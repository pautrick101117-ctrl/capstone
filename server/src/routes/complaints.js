import express from "express";
import { requireSupabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { normalizeRole } from "../utils/helpers.js";

const router = express.Router();

router.use(requireAuth);

router.get("/mine", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db
      .from("complaints")
      .select("*")
      .eq("user_id", req.auth.sub)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ complaints: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (normalizeRole(req.auth.role) !== "resident") {
      throw Object.assign(new Error("Only resident accounts can submit complaints."), { status: 403 });
    }

    const complaintType = (req.body.complaint_type || "").trim();
    const details = (req.body.details || "").trim();
    if (!complaintType || !details) {
      throw Object.assign(new Error("Complaint type and details are required."), { status: 400 });
    }

    const db = requireSupabase();
    const { data: user, error: userError } = await db
      .from("users")
      .select("id, first_name, last_name")
      .eq("id", req.auth.sub)
      .single();
    if (userError) throw userError;

    const payload = {
      user_id: user.id,
      resident_name: `${user.first_name} ${user.last_name}`.trim(),
      complaint_type: complaintType,
      details,
      status: "pending",
    };

    const { data, error } = await db.from("complaints").insert(payload).select("*").single();
    if (error) throw error;

    await logAudit({
      actorId: req.auth.sub,
      actorRole: normalizeRole(req.auth.role),
      action: "create_complaint",
      entityType: "complaint",
      entityId: data.id,
      details: payload,
    });

    res.status(201).json({ complaint: data });
  } catch (error) {
    next(error);
  }
});

export default router;
