import express from "express";
import bcrypt from "bcryptjs";
import { requireSupabase } from "../lib/supabase.js";
import { signToken } from "../lib/jwt.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { requireAuth, requireCurrentUser } from "../middleware/auth.js";
import { comparePassword, normalizeRole, sanitizeUser } from "../utils/helpers.js";
import { logAudit } from "../utils/audit.js";

const router = express.Router();
const SESSION_TIMEOUT_MINUTES = 30;

router.post("/request-code", (_req, _res, next) => {
  next(Object.assign(new Error("Public registration has been disabled. Please contact your barangay admin."), { status: 410 }));
});

router.post("/register", (_req, _res, next) => {
  next(Object.assign(new Error("Public registration has been disabled. Please contact your barangay admin."), { status: 410 }));
});

router.post("/login", rateLimit({ key: "login", max: 10, windowMs: 15 * 60_000 }), async (req, res, next) => {
  try {
    const db = requireSupabase();
    const rawIdentifier = `${req.body.usernameOrEmail || ""}`.trim();
    const identifier = rawIdentifier.toLowerCase();
    const password = `${req.body.password || ""}`;
    const adminOnly = Boolean(req.body.adminOnly);

    if (!identifier || !password) {
      throw Object.assign(new Error("Username and password are required."), { status: 400 });
    }

    const { data: user, error } = await db
      .from("users")
      .select("*")
      .or(`username.eq.${identifier},email.eq.${identifier},contact_number.eq.${rawIdentifier}`)
      .maybeSingle();
    if (error) throw error;

    if (!user) {
      throw Object.assign(new Error("Invalid credentials."), { status: 401 });
    }

    const valid = await comparePassword(bcrypt, password, user.password_hash);
    if (!valid) {
      throw Object.assign(new Error("Invalid credentials."), { status: 401 });
    }

    if (!user.is_active) {
      throw Object.assign(new Error("This account is inactive. Please contact the barangay admin."), { status: 403 });
    }

    if (user.status !== "approved" && normalizeRole(user.role) === "resident") {
      throw Object.assign(new Error("Your account is not active yet. Please contact the barangay admin."), { status: 403 });
    }

    if (adminOnly && normalizeRole(user.role) !== "admin") {
      throw Object.assign(new Error("Admin access only."), { status: 403 });
    }

    const token = signToken({
      sub: user.id,
      role: normalizeRole(user.role),
      email: user.email,
      username: user.username,
    });

    await logAudit({
      actorId: user.id,
      actorRole: normalizeRole(user.role),
      action: "login",
      entityType: "user",
      entityId: user.id,
      details: { adminOnly },
    });

    res.json({
      token,
      user: sanitizeUser(user),
      sessionTimeoutMinutes: SESSION_TIMEOUT_MINUTES,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, requireCurrentUser({ allowPasswordChange: true }), async (req, res, next) => {
  try {
    const db = requireSupabase();

    const { data: liveElection } = await db
      .from("elections")
      .select("id")
      .eq("status", "live")
      .gt("ends_at", new Date().toISOString())
      .maybeSingle();

    let hasVoted = false;
    if (liveElection) {
      const { data: vote } = await db
        .from("votes")
        .select("id")
        .eq("election_id", liveElection.id)
        .eq("user_id", req.currentUser.id)
        .maybeSingle();
      hasVoted = Boolean(vote);
    }

    const { data: notifications, error: notificationError } = await db
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${req.currentUser.id},broadcast.eq.true`)
      .order("created_at", { ascending: false })
      .limit(30);
    if (notificationError) throw notificationError;

    res.json({
      user: sanitizeUser({ ...req.currentUser, has_voted: hasVoted }),
      notifications: notifications || [],
      sessionTimeoutMinutes: SESSION_TIMEOUT_MINUTES,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/change-password", requireAuth, requireCurrentUser({ allowPasswordChange: true }), async (req, res, next) => {
  try {
    const { currentPassword = "", newPassword = "" } = req.body;
    if (!newPassword || newPassword.length < 8) {
      throw Object.assign(new Error("New password must be at least 8 characters long."), { status: 400 });
    }

    if (!req.currentUser.must_change_password) {
      const validCurrent = await comparePassword(bcrypt, currentPassword, req.currentUser.password_hash);
      if (!validCurrent) {
        throw Object.assign(new Error("Current password is incorrect."), { status: 400 });
      }
    }

    const db = requireSupabase();
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { data, error } = await db
      .from("users")
      .update({
        password_hash: passwordHash,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.currentUser.id)
      .select("*")
      .single();
    if (error) throw error;

    await logAudit({
      actorId: req.currentUser.id,
      actorRole: normalizeRole(req.currentUser.role),
      action: "change_password",
      entityType: "user",
      entityId: req.currentUser.id,
      details: {},
    });

    res.json({
      message: "Password updated successfully.",
      user: sanitizeUser(data),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
