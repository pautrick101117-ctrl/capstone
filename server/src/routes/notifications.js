import express from "express";
import { requireSupabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { data } = await db
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${req.auth.sub},broadcast.eq.true`)
      .order("created_at", { ascending: false })
      .limit(30);

    res.json({ notifications: data || [] });
  } catch (error) {
    next(error);
  }
});

export default router;
