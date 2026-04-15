import express from "express";
import { requireSupabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { logAudit } from "../utils/audit.js";

const router = express.Router();

const formatElection = (election, options) => ({
  id: election.id,
  title: election.title,
  description: election.description,
  status: election.status,
  startsAt: election.starts_at,
  endsAt: election.ends_at,
  totalVotes: options.reduce((sum, option) => sum + option.votes_count, 0),
  options: options.map((option) => ({
    id: option.id,
    name: option.name,
    description: option.description,
    votes: option.votes_count,
  })),
});

router.get("/live", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: election } = await db.from("elections").select("*").eq("status", "live").maybeSingle();
    if (!election) {
      return res.json({ election: null });
    }

    const { data: options } = await db
      .from("election_options")
      .select("*")
      .eq("election_id", election.id)
      .order("votes_count", { ascending: false });

    res.json({ election: formatElection(election, options || []) });
  } catch (error) {
    next(error);
  }
});

router.post("/vote", requireAuth, rateLimit({ key: "vote", max: 3, windowMs: 60_000 }), async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { optionId } = req.body;

    const { data: user } = await db.from("users").select("*").eq("id", req.auth.sub).single();
    if (user.has_voted) {
      throw Object.assign(new Error("You have already voted."), { status: 409 });
    }

    const { data: election } = await db.from("elections").select("*").eq("status", "live").maybeSingle();
    if (!election) {
      throw Object.assign(new Error("There is no live election right now."), { status: 400 });
    }

    const { data: option } = await db
      .from("election_options")
      .select("*")
      .eq("id", optionId)
      .eq("election_id", election.id)
      .single();

    await db.from("votes").insert({
      election_id: election.id,
      option_id: option.id,
      user_id: user.id,
    });

    await db.from("users").update({ has_voted: true }).eq("id", user.id);
    await db.from("election_options").update({ votes_count: option.votes_count + 1 }).eq("id", option.id);
    await db.from("notifications").insert({
      user_id: user.id,
      title: "You have successfully voted",
      body: `Your vote for ${option.name} has been recorded.`,
      kind: "success",
    });
    await logAudit({
      actorId: user.id,
      actorRole: user.role,
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

router.get("/my-status", requireAuth, async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: user } = await db.from("users").select("has_voted").eq("id", req.auth.sub).single();
    res.json({ hasVoted: Boolean(user?.has_voted) });
  } catch (error) {
    next(error);
  }
});

export default router;
