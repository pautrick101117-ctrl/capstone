import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import XLSX from "xlsx";
import { requireSupabase } from "../lib/supabase.js";
import { uploadAsset } from "../lib/storage.js";
import { broadcastSms, sendSms } from "../lib/sms.js";
import { requireAuth, requireCurrentUser, requireRole } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import {
  buildUsername,
  createTemporaryPassword,
  ensureAdult,
  normalizeRole,
  normalizePhoneNumber,
  sanitizeUser,
} from "../utils/helpers.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireAuth, requireCurrentUser({ allowPasswordChange: true }), requireRole("admin"));

const ensure = (value, message) => {
  if (!value) throw Object.assign(new Error(message), { status: 400 });
};

const splitName = (fullName = "") => {
  const parts = `${fullName}`.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.length > 1 ? parts[parts.length - 1] : parts[0] || "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
  };
};

const ensureUniqueUsername = async (db, baseUsername) => {
  let candidate = baseUsername;
  let counter = 1;

  while (true) {
    const { data, error } = await db.from("users").select("id").eq("username", candidate).maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    counter += 1;
    candidate = `${baseUsername}.${counter}`;
  }
};

const getResidentRecipients = async (db) => {
  const { data, error } = await db
    .from("users")
    .select("id, contact_number, full_name, first_name")
    .eq("role", "resident")
    .eq("is_active", true);
  if (error) throw error;
  return data || [];
};

const notifyResidents = async (db, residents, { title, body, kind = "info" }) => {
  if (!residents.length) return;
  const { error } = await db.from("notifications").insert(
    residents.map((resident) => ({
      user_id: resident.id,
      title,
      body,
      kind,
      broadcast: false,
    }))
  );
  if (error) throw error;
};

const sendAccountSms = async ({ phone, username, tempPassword }) =>
  sendSms({
    to: phone,
    message: `Your Barangay Iba portal account is ready. Username: ${username}. Temporary password: ${tempPassword}. Please change your password after your first login.`,
  });

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return `${value}`.toLowerCase() !== "false";
};

const addTimelineEntry = async (db, requestId, status, note = "") => {
  const { error } = await db.from("request_timeline").insert({
    request_id: requestId,
    status,
    note,
  });
  if (error) throw error;
};

const getElectionMetrics = async (db, electionId) => {
  const [election, options, votes, completions, residents] = await Promise.all([
    db.from("elections").select("*").eq("id", electionId).single(),
    db.from("election_options").select("*").eq("election_id", electionId).order("created_at"),
    db.from("votes").select("id, user_id").eq("election_id", electionId),
    db.from("project_completions").select("id, user_id").eq("election_id", electionId),
    db.from("users").select("id", { count: "exact", head: true }).eq("role", "resident").eq("is_active", true),
  ]);

  if (election.error) throw election.error;
  if (options.error) throw options.error;
  if (votes.error) throw votes.error;
  if (completions.error) throw completions.error;

  const totalVotes = votes.data?.length || 0;
  const eligibleVoters = residents.count || 0;
  const optionRows = options.data || [];
  const winner = [...optionRows].sort((a, b) => Number(b.votes_count || 0) - Number(a.votes_count || 0))[0] || null;

  return {
    id: election.data.id,
    title: election.data.title,
    description: election.data.description,
    status: election.data.status,
    startsAt: election.data.starts_at,
    endsAt: election.data.ends_at,
    imageUrl: election.data.image_url,
    totalVotes,
    eligibleVoters,
    notVotedCount: Math.max(eligibleVoters - totalVotes, 0),
    participationRate: eligibleVoters ? Number(((totalVotes / eligibleVoters) * 100).toFixed(1)) : 0,
    completionCount: completions.data?.length || 0,
    winner: winner
      ? {
          id: winner.id,
          name: winner.name,
          votes: Number(winner.votes_count || 0),
        }
      : null,
    options: optionRows.map((option) => ({
      id: option.id,
      name: option.name,
      description: option.description,
      votes: Number(option.votes_count || 0),
      percentage: totalVotes ? Number(((Number(option.votes_count || 0) / totalVotes) * 100).toFixed(1)) : 0,
    })),
  };
};

const tableCrud = ({ table, label, fileField, fileFolder, filePrefix, mapPayload }) => {
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

  router.post(`/${table}`, upload.single(fileField || "file"), async (req, res, next) => {
    try {
      const db = requireSupabase();
      const assetUrl =
        fileField && req.file
          ? await uploadAsset({
              file: req.file,
              folder: fileFolder || table,
              prefix: filePrefix || label,
            })
          : null;
      const payload = mapPayload ? await mapPayload({ body: req.body, assetUrl, req, db }) : { ...req.body };
      const { data, error } = await db.from(table).insert(payload).select("*").single();
      if (error) throw error;

      await logAudit({
        actorId: req.currentUser.id,
        actorRole: normalizeRole(req.currentUser.role),
        action: `create_${label}`,
        entityType: table,
        entityId: data.id,
        details: payload,
      });

      res.status(201).json({ item: data });
    } catch (error) {
      next(error);
    }
  });

  router.patch(`/${table}/:id`, upload.single(fileField || "file"), async (req, res, next) => {
    try {
      const db = requireSupabase();
      const assetUrl =
        fileField && req.file
          ? await uploadAsset({
              file: req.file,
              folder: fileFolder || table,
              prefix: `${filePrefix || label}-${req.params.id}`,
            })
          : null;
      const payload = mapPayload
        ? await mapPayload({ body: req.body, assetUrl, req, db, existingId: req.params.id })
        : { ...req.body };
      const { data, error } = await db.from(table).update(payload).eq("id", req.params.id).select("*").single();
      if (error) throw error;

      await logAudit({
        actorId: req.currentUser.id,
        actorRole: normalizeRole(req.currentUser.role),
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

  router.delete(`/${table}/:id`, async (req, res, next) => {
    try {
      const db = requireSupabase();
      const { error } = await db.from(table).delete().eq("id", req.params.id);
      if (error) throw error;

      await logAudit({
        actorId: req.currentUser.id,
        actorRole: normalizeRole(req.currentUser.role),
        action: `delete_${label}`,
        entityType: table,
        entityId: req.params.id,
        details: {},
      });

      res.json({ message: `${label} deleted.` });
    } catch (error) {
      next(error);
    }
  });
};

router.get("/dashboard", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const [users, requests, officials, elections, logs] = await Promise.all([
      db.from("users").select("*").order("created_at", { ascending: false }),
      db.from("requests").select("*").order("created_at", { ascending: false }),
      db.from("officials").select("*"),
      db.from("elections").select("*").order("created_at", { ascending: false }),
      db.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    if (users.error) throw users.error;
    if (requests.error) throw requests.error;
    if (officials.error) throw officials.error;
    if (elections.error) throw elections.error;
    if (logs.error) throw logs.error;

    const residents = (users.data || []).filter((user) => normalizeRole(user.role) === "resident");
    const activeResidents = residents.filter((user) => user.is_active);
    const pendingRequests = (requests.data || []).filter((item) => item.status !== "completed").length;
    const activeOfficials = (officials.data || []).filter((item) => item.is_active).length;
    const openElections = (elections.data || []).filter((item) => item.status === "live").length;

    const requestsByDateMap = new Map();
    for (const item of requests.data || []) {
      const dateKey = new Date(item.created_at).toISOString().slice(0, 10);
      const row = requestsByDateMap.get(dateKey) || { date: dateKey };
      row[item.request_type] = (row[item.request_type] || 0) + 1;
      requestsByDateMap.set(dateKey, row);
    }

    const votingParticipation = [];
    for (const election of elections.data || []) {
      const metrics = await getElectionMetrics(db, election.id);
      votingParticipation.push({
        election: election.title,
        participationRate: metrics.participationRate,
        totalVotes: metrics.totalVotes,
      });
    }

    res.json({
      stats: {
        totalResidents: residents.length,
        pendingRequests,
        activeOfficials,
        openElections,
      },
      charts: {
        requestsByType: Array.from(requestsByDateMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
        residentStatusBreakdown: [
          { name: "Active", value: activeResidents.length },
          { name: "Inactive", value: residents.filter((user) => !user.is_active).length },
          { name: "Pending", value: residents.filter((user) => user.status !== "approved").length },
        ],
        votingParticipation,
      },
      recentActivity: logs.data || [],
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
    res.json({ users: (data || []).map(sanitizeUser) });
  } catch (error) {
    next(error);
  }
});

router.post("/users", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const fullName = `${req.body.fullName || ""}`.trim();
    const address = `${req.body.address || ""}`.trim();
    const purok = `${req.body.purok || ""}`.trim();
    const contactNumber = normalizePhoneNumber(req.body.phoneNumber || req.body.contactNumber || "");
    const email = req.body.email ? `${req.body.email}`.trim().toLowerCase() : null;
    const role = normalizeRole(req.body.role || "resident");
    const birthdate = req.body.birthdate || null;

    ensure(fullName, "Full name is required.");
    ensure(address, "Address is required.");
    ensure(purok, "Purok is required.");
    ensure(contactNumber, "Phone number is required.");
    if (role === "resident") ensureAdult(birthdate);

    const nameParts = splitName(fullName);
    const usernameBase = buildUsername({
      fullName,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
    });
    const username = await ensureUniqueUsername(db, usernameBase);
    const tempPassword = createTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const payload = {
      full_name: fullName,
      first_name: nameParts.firstName,
      middle_name: nameParts.middleName,
      last_name: nameParts.lastName,
      email,
      password_hash: passwordHash,
      address,
      purok,
      contact_number: contactNumber,
      role,
      status: "approved",
      email_verified: Boolean(email),
      email_verified_at: email ? new Date().toISOString() : null,
      verification_provider: "admin_created",
      has_voted: false,
      birthdate,
      username,
      must_change_password: true,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db.from("users").insert(payload).select("*").single();
    if (error) throw error;

    await sendAccountSms({
      phone: contactNumber,
      username,
      tempPassword,
    });

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: role === "admin" ? "create_admin_user" : "create_resident_user",
      entityType: "user",
      entityId: data.id,
      details: { username, role },
    });

    res.status(201).json({ user: sanitizeUser(data), temporaryPassword: tempPassword });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:userId", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const updates = {};
    if (req.body.fullName !== undefined) {
      const fullName = `${req.body.fullName}`.trim();
      ensure(fullName, "Full name is required.");
      const parts = splitName(fullName);
      updates.full_name = fullName;
      updates.first_name = parts.firstName;
      updates.middle_name = parts.middleName;
      updates.last_name = parts.lastName;
    }
    if (req.body.address !== undefined) updates.address = `${req.body.address}`.trim();
    if (req.body.purok !== undefined) updates.purok = `${req.body.purok}`.trim();
    if (req.body.contactNumber !== undefined || req.body.phoneNumber !== undefined) {
      updates.contact_number = normalizePhoneNumber(req.body.contactNumber || req.body.phoneNumber);
    }
    if (req.body.email !== undefined) updates.email = req.body.email ? `${req.body.email}`.trim().toLowerCase() : null;
    if (req.body.birthdate !== undefined) {
      if (req.body.birthdate) ensureAdult(req.body.birthdate);
      updates.birthdate = req.body.birthdate || null;
    }
    if (req.body.isActive !== undefined) updates.is_active = parseBoolean(req.body.isActive, true);
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.role !== undefined) updates.role = normalizeRole(req.body.role);
    updates.updated_at = new Date().toISOString();

    const { data, error } = await db.from("users").update(updates).eq("id", req.params.userId).select("*").single();
    if (error) throw error;

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "update_user",
      entityType: "user",
      entityId: req.params.userId,
      details: updates,
    });

    res.json({ user: sanitizeUser(data) });
  } catch (error) {
    next(error);
  }
});

router.post("/users/:userId/reset-password", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const tempPassword = createTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const { data, error } = await db
      .from("users")
      .update({
        password_hash: passwordHash,
        must_change_password: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.userId)
      .select("*")
      .single();
    if (error) throw error;

    await sendSms({
      to: data.contact_number,
      message: `Your Barangay Iba temporary password has been reset. Username: ${data.username}. Temporary password: ${tempPassword}. Please change it after login.`,
    });

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "reset_user_password",
      entityType: "user",
      entityId: req.params.userId,
      details: {},
    });

    res.json({ message: "Temporary password generated and logged for SMS delivery.", temporaryPassword: tempPassword });
  } catch (error) {
    next(error);
  }
});

router.post("/users/import", upload.single("file"), async (req, res, next) => {
  try {
    ensure(req.file, "Excel file is required.");
    const db = requireSupabase();
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const inserted = [];
    for (const row of rows) {
      const fullName = `${row["Full Name"] || row.full_name || row.Name || ""}`.trim();
      const address = `${row.Address || row.address || ""}`.trim();
      const purok = `${row.Purok || row.purok || ""}`.trim();
      const birthdate = row.Birthdate || row.birthdate || "";
      const contactNumber = normalizePhoneNumber(row["Phone Number"] || row.phone_number || row.Contact || "");
      const email = row.Email ? `${row.Email}`.trim().toLowerCase() : null;
      if (!fullName || !address || !purok || !birthdate || !contactNumber) continue;

      ensureAdult(birthdate);
      const parts = splitName(fullName);
      const username = await ensureUniqueUsername(
        db,
        buildUsername({ fullName, firstName: parts.firstName, lastName: parts.lastName })
      );
      const tempPassword = createTemporaryPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      const { data, error } = await db
        .from("users")
        .insert({
          full_name: fullName,
          first_name: parts.firstName,
          middle_name: parts.middleName,
          last_name: parts.lastName,
          email,
          password_hash: passwordHash,
          address,
          purok,
          contact_number: contactNumber,
          role: "resident",
          status: "approved",
          email_verified: Boolean(email),
          email_verified_at: email ? new Date().toISOString() : null,
          verification_provider: "admin_import",
          has_voted: false,
          birthdate,
          username,
          must_change_password: true,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      if (error) throw error;
      inserted.push(data);
      await sendAccountSms({ phone: contactNumber, username, tempPassword });
    }

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "import_users_xlsx",
      entityType: "user",
      entityId: "batch",
      details: { count: inserted.length },
    });

    res.json({ message: `${inserted.length} residents imported successfully.`, users: inserted.map(sanitizeUser) });
  } catch (error) {
    next(error);
  }
});

router.get("/users/export", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db
      .from("users")
      .select("*")
      .eq("role", "resident")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = (data || []).map((user) => ({
      "Full Name": user.full_name || [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" "),
      Username: user.username,
      Address: user.address,
      Purok: user.purok,
      "Phone Number": user.contact_number,
      Email: user.email,
      Birthdate: user.birthdate,
      Status: user.status,
      Active: user.is_active ? "Yes" : "No",
    }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "Residents");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=barangay-iba-residents-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.get("/requests", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db
      .from("requests")
      .select("*, request_timeline(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ requests: data || [] });
  } catch (error) {
    next(error);
  }
});

router.patch("/requests/:id", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const payload = {
      status: req.body.status,
      admin_note: req.body.adminNote || "",
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await db.from("requests").update(payload).eq("id", req.params.id).select("*").single();
    if (error) throw error;

    await addTimelineEntry(db, data.id, payload.status, payload.admin_note);

    const { data: resident } = await db.from("users").select("contact_number").eq("id", data.user_id).maybeSingle();
    await sendSms({
      to: resident?.contact_number,
      message: `Your ${data.request_type} request is now ${payload.status}.${payload.admin_note ? ` Note: ${payload.admin_note}` : ""}`,
    });
    await db.from("notifications").insert({
      user_id: data.user_id,
      title: "Request status updated",
      body: `${data.request_type} is now ${payload.status}. ${payload.admin_note || ""}`.trim(),
      kind: "info",
      broadcast: false,
    });

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "update_request",
      entityType: "request",
      entityId: req.params.id,
      details: payload,
    });

    res.json({ request: data });
  } catch (error) {
    next(error);
  }
});

router.get("/id-requests", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db
      .from("id_requests")
      .select("*, users!id_requests_user_id_fkey(full_name, first_name, last_name, contact_number)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ requests: data || [] });
  } catch (error) {
    next(error);
  }
});

router.patch("/id-requests/:id", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const payload = {
      status: req.body.status,
      admin_note: req.body.adminNote || "",
      preferred_date: req.body.preferredDate || null,
      time_slot: req.body.timeSlot || null,
    };
    const { data, error } = await db.from("id_requests").update(payload).eq("id", req.params.id).select("*").single();
    if (error) throw error;

    const { data: resident } = await db.from("users").select("contact_number").eq("id", data.user_id).maybeSingle();
    await sendSms({
      to: resident?.contact_number,
      message: `Your Barangay ID request is now ${payload.status}. Pickup: ${payload.preferred_date || "to be scheduled"} ${payload.time_slot || ""}. ${payload.admin_note || ""}`.trim(),
    });
    await db.from("notifications").insert({
      user_id: data.user_id,
      title: "Barangay ID schedule updated",
      body: `Status: ${payload.status}. ${payload.admin_note || ""}`.trim(),
      kind: "info",
      broadcast: false,
    });

    res.json({ request: data });
  } catch (error) {
    next(error);
  }
});

router.get("/suggestions", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db
      .from("project_suggestions")
      .select("*, users!project_suggestions_user_id_fkey(full_name, first_name, last_name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ suggestions: data || [] });
  } catch (error) {
    next(error);
  }
});

router.patch("/suggestions/:id", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const status = req.body.status;
    ensure(status, "Status is required.");
    const { data, error } = await db
      .from("project_suggestions")
      .update({ status })
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) throw error;

    let election = null;
    if (status === "approved") {
      const insert = await db
        .from("elections")
        .insert({
          title: data.title,
          description: data.description,
          status: "draft",
          source_suggestion_id: data.id,
        })
        .select("*")
        .single();
      if (insert.error) throw insert.error;
      election = insert.data;
    }

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "review_project_suggestion",
      entityType: "project_suggestion",
      entityId: req.params.id,
      details: { status, electionId: election?.id || null },
    });

    res.json({ suggestion: data, election });
  } catch (error) {
    next(error);
  }
});

router.get("/content", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db.from("landing_content").select("*").order("key_name");
    if (error) throw error;
    res.json({ content: Object.fromEntries((data || []).map((item) => [item.key_name, item.value])) });
  } catch (error) {
    next(error);
  }
});

router.put("/content", async (req, res, next) => {
  try {
    const db = requireSupabase();
    for (const [key_name, value] of Object.entries(req.body || {})) {
      const { error } = await db
        .from("landing_content")
        .upsert({ key_name, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    }
    res.json({ message: "Content updated." });
  } catch (error) {
    next(error);
  }
});

router.get("/election", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: election, error } = await db.from("elections").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    if (!election) return res.json({ election: null, options: [] });

    const { data: options, error: optionError } = await db
      .from("election_options")
      .select("*")
      .eq("election_id", election.id)
      .order("created_at");
    if (optionError) throw optionError;
    res.json({ election, options: options || [] });
  } catch (error) {
    next(error);
  }
});

router.put("/election", upload.single("image"), async (req, res, next) => {
  try {
    const db = requireSupabase();
    const rawElection = req.body.election ? JSON.parse(req.body.election) : req.body;
    const rawOptions = req.body.options ? JSON.parse(req.body.options) : [];
    ensure(rawElection?.title, "Election title is required.");

    const imageUrl = req.file
      ? await uploadAsset({
          file: req.file,
          folder: "elections",
          prefix: rawElection.title,
        })
      : rawElection.imageUrl || null;

    const options = (rawOptions || [])
      .map((option) => ({
        name: `${option.name || ""}`.trim(),
        description: `${option.description || ""}`.trim(),
      }))
      .filter((option) => option.name);

    if (rawElection.status !== "draft" && options.length < 2) {
      throw Object.assign(new Error("At least two voting options are required."), { status: 400 });
    }

    const electionPayload = {
      title: rawElection.title,
      description: rawElection.description || "",
      status: rawElection.status || "draft",
      starts_at: rawElection.startsAt || null,
      ends_at: rawElection.endsAt || null,
      image_url: imageUrl,
      source_suggestion_id: rawElection.sourceSuggestionId || null,
    };

    let savedElection;
    if (rawElection.id) {
      const update = await db.from("elections").update(electionPayload).eq("id", rawElection.id).select("*").single();
      if (update.error) throw update.error;
      savedElection = update.data;
    } else {
      const insert = await db.from("elections").insert(electionPayload).select("*").single();
      if (insert.error) throw insert.error;
      savedElection = insert.data;
    }

    await db.from("election_options").delete().eq("election_id", savedElection.id);
    if (options.length) {
      const insertOptions = await db.from("election_options").insert(
        options.map((option) => ({
          election_id: savedElection.id,
          name: option.name,
          description: option.description,
          votes_count: 0,
        }))
      );
      if (insertOptions.error) throw insertOptions.error;
    }

    if (savedElection.status === "live") {
      const closeOtherLives = await db.from("elections").update({ status: "closed" }).neq("id", savedElection.id).eq("status", "live");
      if (closeOtherLives.error) throw closeOtherLives.error;
      const resetVotes = await db.from("users").update({ has_voted: false }).eq("role", "resident");
      if (resetVotes.error) throw resetVotes.error;

      const residents = await getResidentRecipients(db);
      await notifyResidents(db, residents, {
        title: "Voting is now open",
        body: `${savedElection.title} is now live for voting.`,
      });
      await broadcastSms(residents, `Voting is now live: ${savedElection.title}. Log in to the Barangay Iba portal to cast your vote.`);
    }

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "save_election",
      entityType: "election",
      entityId: savedElection.id,
      details: electionPayload,
    });

    res.json({ election: savedElection });
  } catch (error) {
    next(error);
  }
});

router.get("/election-results", async (_req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: elections, error } = await db.from("elections").select("id").order("created_at", { ascending: false });
    if (error) throw error;
    const items = [];
    for (const election of elections || []) {
      items.push(await getElectionMetrics(db, election.id));
    }
    res.json({ elections: items });
  } catch (error) {
    next(error);
  }
});

router.post("/broadcast", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const title = `${req.body.title || ""}`.trim();
    const body = `${req.body.body || ""}`.trim();
    ensure(title, "Title is required.");
    ensure(body, "Message is required.");

    const residents = await getResidentRecipients(db);
    await notifyResidents(db, residents, { title, body });
    await broadcastSms(residents, `Barangay Iba notice: ${title}. ${body}`);

    res.json({ message: "Broadcast sent." });
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

tableCrud({
  table: "officials",
  label: "official",
  fileField: "photo",
  fileFolder: "officials",
  filePrefix: "official",
  mapPayload: async ({ body, assetUrl }) => ({
    name: body.name,
    position: body.position,
    term: body.term,
    contact: body.contact || "",
    photo_url: assetUrl || body.photoUrl || null,
    is_active: parseBoolean(body.isActive, true),
    status: parseBoolean(body.isActive, true) ? "active" : "inactive",
  }),
});

tableCrud({
  table: "announcements",
  label: "announcement",
  fileField: "image",
  fileFolder: "announcements",
  filePrefix: "announcement",
  mapPayload: async ({ body, assetUrl, db, existingId }) => {
    const payload = {
      title: body.title,
      body: body.body,
      image_url: assetUrl || body.imageUrl || null,
      type: body.type,
    };

    if (body.date && !existingId) {
      payload.created_at = body.date;
    }

    if (!existingId) {
      const residents = await getResidentRecipients(db);
      await notifyResidents(db, residents, {
        title: body.type === "news" ? "News update" : "New announcement",
        body: body.title,
      });
      await broadcastSms(
        residents,
        `Barangay Iba ${body.type === "news" ? "news" : "announcement"}: ${body.title}. Check the portal for details.`
      );
    }

    return payload;
  },
});

tableCrud({
  table: "events",
  label: "event",
  mapPayload: async ({ body }) => ({
    title: body.title,
    date: body.date,
    time: body.time || null,
    location: body.location || "",
    description: body.description || "",
    type: body.type || "general",
  }),
});

tableCrud({
  table: "fund_sources",
  label: "fund_source",
  mapPayload: async ({ body }) => ({
    name: body.name,
    term: body.term,
    allocated_amount: Number(body.allocatedAmount || body.allocated_amount || 0),
  }),
});

tableCrud({
  table: "fund_projects",
  label: "fund_project",
  fileField: "receipt",
  fileFolder: "receipts",
  filePrefix: "receipt",
  mapPayload: async ({ body, assetUrl }) => ({
    name: body.name,
    date: body.date,
    amount: Number(body.amount || 0),
    description: body.description || "",
    receipt_url: assetUrl || body.receiptUrl || null,
    term: body.term,
    status: body.status || "ongoing",
  }),
});

tableCrud({
  table: "id_pickup_slots",
  label: "id_pickup_slot",
  mapPayload: async ({ body }) => ({
    slot_date: body.slotDate || body.slot_date,
    time_slot: body.timeSlot || body.time_slot,
    capacity: Number(body.capacity || 1),
    is_active: parseBoolean(body.isActive, true),
  }),
});

tableCrud({
  table: "census_households",
  label: "census_household",
  mapPayload: async ({ body }) => ({
    household_name: body.household_name || body.householdName,
    purok: body.purok,
    members: Number(body.members || 1),
    house_number: body.house_number || body.houseNumber,
    status: body.status || "active",
    updated_at: new Date().toISOString(),
  }),
});

export default router;
