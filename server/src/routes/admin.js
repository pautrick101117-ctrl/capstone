import express from "express";
import bcrypt from "bcryptjs";
import { requireSupabase } from "../lib/supabase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { normalizeRole } from "../utils/helpers.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

const ensure = (value, message) => {
  if (!value) {
    throw Object.assign(new Error(message), { status: 400 });
  }
};

const formatUser = (user) => ({
  ...user,
  role: normalizeRole(user.role),
});

const tableCrud = ({ table, label }) => {
  router.get(`/${table}`, async (_req, res, next) => {
    try {
      const db = requireSupabase();
      const { data, error } = await db.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      res.json({ [table]: data || [] });
    } catch (error) {
      next(error);
    }
  });

  router.post(`/${table}`, async (req, res, next) => {
    try {
      const db = requireSupabase();
      const { data, error } = await db.from(table).insert(req.body).select("*").single();
      if (error) throw error;

      await logAudit({
        actorId: req.auth.sub,
        actorRole: req.auth.role,
        action: `create_${label}`,
        entityType: table,
        entityId: data.id,
        details: req.body,
      });

      res.status(201).json({ item: data });
    } catch (error) {
      next(error);
    }
  });

  router.patch(`/${table}/:id`, async (req, res, next) => {
    try {
      const db = requireSupabase();
      const payload = table === "census_households" ? { ...req.body, updated_at: new Date().toISOString() } : req.body;
      const { data, error } = await db.from(table).update(payload).eq("id", req.params.id).select("*").single();
      if (error) throw error;

      await logAudit({
        actorId: req.auth.sub,
        actorRole: req.auth.role,
        action: `update_${label}`,
        entityType: table,
        entityId: req.params.id,
        details: payload,
      });

      res.json({ item: data });
    } catch (error) {
      next(error);
    }
  });
};

router.get("/dashboard", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const counts = await Promise.all([
      db.from("users").select("*", { count: "exact", head: true }).eq("role", "resident"),
      db.from("users").select("*", { count: "exact", head: true }).in("role", ["admin", "super_admin", "staff"]),
      db.from("complaints").select("*", { count: "exact", head: true }),
      db.from("users").select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from("clearances").select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(6),
    ]);

    const [residents, officials, complaints, pendingUsers, pendingClearances, logsQuery] = counts;

    res.json({
      stats: {
        residents: residents.count || 0,
        officials: officials.count || 0,
        complaints: complaints.count || 0,
        pendingClearance: pendingClearances.count || 0,
        pendingUsers: pendingUsers.count || 0,
      },
      logs: logsQuery.data || [],
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db.from("users").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ users: (data || []).map(formatUser) });
  } catch (error) {
    next(error);
  }
});

router.post("/admin-users", async (req, res, next) => {
  try {
    ensure(req.body.email, "Admin email is required.");
    ensure(req.body.password, "Admin password is required.");
    ensure(req.body.firstName, "Admin first name is required.");
    ensure(req.body.lastName, "Admin last name is required.");

    const db = requireSupabase();
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const payload = {
      first_name: req.body.firstName,
      middle_name: req.body.middleName || "",
      last_name: req.body.lastName,
      email: req.body.email.toLowerCase(),
      password_hash: passwordHash,
      address: req.body.address || "",
      contact_number: req.body.contactNumber || "",
      role: "admin",
      status: "approved",
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      verification_provider: "admin_created",
      has_voted: false,
    };

    const { data, error } = await db.from("users").insert(payload).select("*").single();
    if (error) throw error;

    await logAudit({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "create_admin_user",
      entityType: "user",
      entityId: data.id,
      details: { email: data.email, role: "admin" },
    });

    res.status(201).json({ user: formatUser(data) });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:userId", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const updates = {};
    ["status", "role", "address", "contact_number"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (updates.role !== undefined) {
      updates.role = normalizeRole(updates.role);
    }
    if (req.body.password) {
      updates.password_hash = await bcrypt.hash(req.body.password, 12);
    }

    const { data: updated, error } = await db.from("users").update(updates).eq("id", req.params.userId).select("*").single();
    if (error) throw error;

    await logAudit({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "update_user",
      entityType: "user",
      entityId: req.params.userId,
      details: updates,
    });

    res.json({ user: formatUser(updated) });
  } catch (error) {
    next(error);
  }
});

router.get("/content", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db.from("landing_content").select("*").order("key_name");
    if (error) throw error;
    res.json({
      content: Object.fromEntries((data || []).map((item) => [item.key_name, item.value])),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/content", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const entries = Object.entries(req.body || {});

    for (const [keyName, value] of entries) {
      const { error } = await db.from("landing_content").upsert({ key_name: keyName, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    }

    await logAudit({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "update_content",
      entityType: "landing_content",
      entityId: "global",
      details: req.body,
    });

    res.json({ message: "Landing content updated." });
  } catch (error) {
    next(error);
  }
});

router.get("/election", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: election, error: electionError } = await db.from("elections").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (electionError) throw electionError;

    let options = [];
    if (election) {
      const query = await db.from("election_options").select("*").eq("election_id", election.id).order("created_at");
      if (query.error) throw query.error;
      options = query.data || [];
    }

    res.json({ election, options });
  } catch (error) {
    next(error);
  }
});

router.put("/election", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { election, options } = req.body;
    ensure(election?.title, "Election title is required.");
    ensure(Array.isArray(options) && options.length >= 2, "At least two voting options are required.");
    const sanitizedOptions = options
      .map((option) => ({
        name: option.name?.trim(),
        description: option.description || "",
        votes_count: Number(option.votes_count || 0),
      }))
      .filter((option) => option.name);
    ensure(sanitizedOptions.length >= 2, "At least two valid voting options are required.");

    let savedElection;
    const electionPayload = {
      title: election.title,
      description: election.description || "",
      status: election.status || "draft",
      starts_at: election.startsAt || null,
      ends_at: election.endsAt || null,
    };

    if (election.id) {
      const { data, error } = await db.from("elections").update(electionPayload).eq("id", election.id).select("*").single();
      if (error) throw error;
      savedElection = data;
    } else {
      const { data, error } = await db.from("elections").insert(electionPayload).select("*").single();
      if (error) throw error;
      savedElection = data;
    }

    if (savedElection.status === "live") {
      const closeLive = await db
        .from("elections")
        .update({ status: "closed" })
        .neq("id", savedElection.id)
        .eq("status", "live");
      if (closeLive.error) throw closeLive.error;

      const resetVotesFlag = await db.from("users").update({ has_voted: false }).eq("role", "resident");
      if (resetVotesFlag.error) throw resetVotesFlag.error;
    }

    if (Array.isArray(options)) {
      const remove = await db.from("election_options").delete().eq("election_id", savedElection.id);
      if (remove.error) throw remove.error;
      if (sanitizedOptions.length) {
        const insert = await db.from("election_options").insert(
          sanitizedOptions.map((option) => ({
            election_id: savedElection.id,
            name: option.name,
            description: option.description || "",
            votes_count: option.votes_count,
          }))
        );
        if (insert.error) throw insert.error;
      }
    }

    if (savedElection.status === "live") {
      await db.from("notifications").insert({
        title: "Election is now live",
        body: `${savedElection.title} is now available for residents.`,
        kind: "info",
        user_id: null,
        broadcast: true,
      });
    }

    await logAudit({
      actorId: req.auth.sub,
      actorRole: req.auth.role,
      action: "update_election",
      entityType: "election",
      entityId: savedElection.id,
      details: req.body,
    });

    res.json({ election: savedElection });
  } catch (error) {
    next(error);
  }
});

router.get("/audit-logs", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ logs: data || [] });
  } catch (error) {
    next(error);
  }
});

tableCrud({ table: "officials", label: "official" });
tableCrud({ table: "clearances", label: "clearance" });
tableCrud({ table: "census_households", label: "census" });

router.get("/complaints", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db.from("complaints").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ complaints: data || [] });
  } catch (error) {
    next(error);
  }
});

router.patch("/complaints/:id", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const payload = {};
    if (req.body.status !== undefined) payload.status = req.body.status;
    if (req.body.details !== undefined) payload.details = req.body.details;
    const { data, error } = await db.from("complaints").update(payload).eq("id", req.params.id).select("*").single();
    if (error) throw error;

    await logAudit({
      actorId: req.auth.sub,
      actorRole: normalizeRole(req.auth.role),
      action: "update_complaint",
      entityType: "complaint",
      entityId: req.params.id,
      details: payload,
    });

    res.json({ item: data });
  } catch (error) {
    next(error);
  }
});

export default router;
