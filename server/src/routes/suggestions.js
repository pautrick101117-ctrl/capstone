import express from "express";
import { requireSupabase } from "../lib/supabase.js";
import { requireAuth, requireCurrentUser } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";
import { normalizeRole } from "../utils/helpers.js";

const router = express.Router();

router.use(requireAuth, requireCurrentUser());

router.get("/mine", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db
      .from("project_suggestions")
      .select("*")
      .eq("user_id", req.currentUser.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ suggestions: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (normalizeRole(req.currentUser.role) !== "resident") {
      throw Object.assign(new Error("Only resident accounts can submit suggestions."), { status: 403 });
    }

    const title = `${req.body.title || ""}`.trim();
    const description = `${req.body.description || ""}`.trim();
    if (!title || !description) {
      throw Object.assign(new Error("Title and description are required."), { status: 400 });
    }

    const db = requireSupabase();
    const { data, error } = await db
      .from("project_suggestions")
      .insert({
        user_id: req.currentUser.id,
        title,
        description,
        status: "pending",
      })
      .select("*")
      .single();
    if (error) throw error;

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "create_project_suggestion",
      entityType: "project_suggestion",
      entityId: data.id,
      details: { title },
    });

    res.status(201).json({ suggestion: data });
  } catch (error) {
    next(error);
  }
});

export default router;
