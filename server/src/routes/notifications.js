import express from "express";
import { requireSupabase } from "../lib/supabase.js";
import { requireAuth, requireCurrentUser } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth, requireCurrentUser({ allowPasswordChange: true }));

router.get("/", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${req.currentUser.id},broadcast.eq.true`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ notifications: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/read", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { data, error } = await db
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .or(`user_id.eq.${req.currentUser.id},broadcast.eq.true`)
      .select("*")
      .single();
    if (error) throw error;
    res.json({ notification: data });
  } catch (error) {
    next(error);
  }
});

router.post("/read-all", async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { error } = await db
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", req.currentUser.id)
      .eq("is_read", false);
    if (error) throw error;
    res.json({ message: "Notifications marked as read." });
  } catch (error) {
    next(error);
  }
});

export default router;
