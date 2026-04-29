import express from "express";
import { requireSupabase } from "../lib/supabase.js";
import { requireAuth, requireCurrentUser } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { logAudit } from "../utils/audit.js";
import { normalizeRole } from "../utils/helpers.js";

const router = express.Router();

const mapElection = (election, options = [], votes = [], completions = [], eligibleVoters = 0) => {
  const totalVotes = votes.length || options.reduce((sum, option) => sum + Number(option.votes_count || 0), 0);
  const sortedOptions = [...options].sort((a, b) => Number(b.votes_count || 0) - Number(a.votes_count || 0));
  const winnerId = sortedOptions[0]?.id || null;

  return {
    id: election.id,
    title: election.title,
    description: election.description,
    imageUrl: election.image_url,
    status: election.status,
    startsAt: election.starts_at,
    endsAt: election.ends_at,
    sourceSuggestionId: election.source_suggestion_id,
    totalVotes,
    eligibleVoters,
    participationRate: eligibleVoters ? Number(((totalVotes / eligibleVoters) * 100).toFixed(1)) : 0,
    completionCount: completions.length,
    options: options.map((option) => {
      const voteCount = Number(option.votes_count || 0);
      return {
        id: option.id,
        name: option.name,
        description: option.description,
        votes: voteCount,
        percentage: totalVotes ? Number(((voteCount / totalVotes) * 100).toFixed(1)) : 0,
        isWinner: option.id === winnerId,
      };
    }),
  };
};

const getElectionBundle = async (db, electionId) => {
  const { data: election, error } = await db.from("elections").select("*").eq("id", electionId).single();
  if (error) throw error;

  const [options, votes, completions, eligibleResidents] = await Promise.all([
    db.from("election_options").select("*").eq("election_id", electionId).order("created_at"),
    db.from("votes").select("id, user_id").eq("election_id", electionId),
    db.from("project_completions").select("id, user_id").eq("election_id", electionId),
    db.from("users").select("*", { count: "exact", head: true }).eq("role", "resident").eq("is_active", true),
  ]);

  if (options.error) throw options.error;
  if (votes.error) throw votes.error;
  if (completions.error) throw completions.error;

  return mapElection(election, options.data || [], votes.data || [], completions.data || [], eligibleResidents.count || 0);
};

router.get("/current", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    let { data: election, error } = await db
      .from("elections")
      .select("*")
      .eq("status", "live")
      .gt("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    if (!election) {
      const latest = await db.from("elections").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (latest.error) throw latest.error;
      election = latest.data;
    }

    if (!election) {
      return res.json({ election: null });
    }

    const bundle = await getElectionBundle(db, election.id);
    res.json({ election: bundle });
  } catch (error) {
    next(error);
  }
});

router.get("/results/latest", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: election, error } = await db
      .from("elections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!election) return res.json({ election: null });

    const bundle = await getElectionBundle(db, election.id);
    res.json({ election: bundle });
  } catch (error) {
    next(error);
  }
});

router.get("/history", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: elections, error } = await db.from("elections").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    const items = [];
    for (const election of elections || []) {
      items.push(await getElectionBundle(db, election.id));
    }

    res.json({ elections: items });
  } catch (error) {
    next(error);
  }
});

router.get("/my-status", requireAuth, requireCurrentUser(), async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: election } = await db
      .from("elections")
      .select("id")
      .eq("status", "live")
      .gt("ends_at", new Date().toISOString())
      .maybeSingle();
    if (!election) {
      return res.json({ hasVoted: false });
    }

    const { data: vote } = await db
      .from("votes")
      .select("id")
      .eq("election_id", election.id)
      .eq("user_id", req.currentUser.id)
      .maybeSingle();

    res.json({ hasVoted: Boolean(vote), electionId: election.id });
  } catch (error) {
    next(error);
  }
});

router.post("/vote", requireAuth, requireCurrentUser(), rateLimit({ key: "vote", max: 3, windowMs: 60_000 }), async (req, res, next) => {
  try {
    if (normalizeRole(req.currentUser.role) !== "resident") {
      throw Object.assign(new Error("Only residents can vote."), { status: 403 });
    }

    const db = requireSupabase();
    const { optionId } = req.body;
    const { data: election } = await db
      .from("elections")
      .select("*")
      .eq("status", "live")
      .gt("ends_at", new Date().toISOString())
      .maybeSingle();
    if (!election) {
      throw Object.assign(new Error("There is no live election right now."), { status: 400 });
    }

    const { data: existingVote } = await db
      .from("votes")
      .select("id")
      .eq("election_id", election.id)
      .eq("user_id", req.currentUser.id)
      .maybeSingle();
    if (existingVote) {
      throw Object.assign(new Error("You have already voted in this election."), { status: 409 });
    }

    const { data: option, error } = await db
      .from("election_options")
      .select("*")
      .eq("id", optionId)
      .eq("election_id", election.id)
      .single();
    if (error) throw error;

    await db.from("votes").insert({
      election_id: election.id,
      option_id: option.id,
      user_id: req.currentUser.id,
    });
    await db
      .from("election_options")
      .update({ votes_count: Number(option.votes_count || 0) + 1 })
      .eq("id", option.id);
    await db.from("users").update({ has_voted: true }).eq("id", req.currentUser.id);
    await db.from("notifications").insert({
      user_id: req.currentUser.id,
      title: "Vote recorded",
      body: `Your vote for ${option.name} has been recorded.`,
      kind: "success",
      broadcast: false,
    });

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "vote",
      entityType: "election",
      entityId: election.id,
      details: { optionId: option.id, optionName: option.name },
    });

    res.json({ message: "Your vote has been recorded." });
  } catch (error) {
    next(error);
  }
});

router.post("/mark-completed", requireAuth, requireCurrentUser(), async (req, res, next) => {
  try {
    if (normalizeRole(req.currentUser.role) !== "resident") {
      throw Object.assign(new Error("Only residents can mark projects as completed."), { status: 403 });
    }

    const electionId = req.body.electionId;
    if (!electionId) {
      throw Object.assign(new Error("Election ID is required."), { status: 400 });
    }

    const db = requireSupabase();
    const { data: election } = await db.from("elections").select("*").eq("id", electionId).single();
    if (!election || election.status !== "closed") {
      throw Object.assign(new Error("Project completion can only be marked after voting closes."), { status: 400 });
    }

    const { error } = await db.from("project_completions").insert({
      election_id: electionId,
      user_id: req.currentUser.id,
    });
    if (error && !`${error.message}`.toLowerCase().includes("duplicate")) throw error;

    const { data: residents } = await db
      .from("users")
      .select("id")
      .eq("role", "resident")
      .eq("is_active", true);
    if ((residents || []).length) {
      await db.from("notifications").insert(
        residents.map((resident) => ({
          user_id: resident.id,
          title: "Project marked as completed",
          body: `${req.currentUser.full_name || req.currentUser.first_name} confirmed project delivery for ${election.title}.`,
          kind: "info",
          broadcast: false,
        }))
      );
    }

    res.json({ message: "Thank you for confirming project completion." });
  } catch (error) {
    next(error);
  }
});

export default router;
