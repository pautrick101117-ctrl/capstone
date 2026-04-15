import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { requireSupabase } from "../lib/supabase.js";
import { sendVerificationEmail } from "../lib/mailer.js";
import { signToken } from "../lib/jwt.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { comparePassword, createCode, hashPassword, normalizeRole, sanitizeUser } from "../utils/helpers.js";
import { logAudit } from "../utils/audit.js";
import { requireAuth } from "../middleware/auth.js";
import { env } from "../lib/env.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const uploadValidId = async (file, email) => {
  if (!file) return null;

  const db = requireSupabase();
  const fileExt = file.originalname.split(".").pop();
  const path = `valid-ids/${Date.now()}-${email.replace(/[^a-z0-9]/gi, "_")}.${fileExt}`;
  const { error } = await db.storage.from(env.supabaseStorageBucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) throw error;

  const { data } = db.storage.from(env.supabaseStorageBucket).getPublicUrl(path);
  return data.publicUrl;
};

router.post("/request-code", rateLimit({ key: "register-code", max: 5, windowMs: 10 * 60_000 }), async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { email, firstName = "", lastName = "" } = req.body;

    if (!email) {
      throw Object.assign(new Error("Email is required."), { status: 400 });
    }

    const code = createCode();
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
    const sentAt = new Date().toISOString();

    await db.from("verification_codes").delete().eq("email", email.toLowerCase());
    await db.from("verification_codes").insert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt,
      sent_to: email.toLowerCase(),
      provider: "gmail_app_password",
      method: "email",
      sent_at: sentAt,
    });

    const delivery = await sendVerificationEmail({
      email,
      code,
      fullName: `${firstName} ${lastName}`.trim(),
    });

    res.json({
      message: "Verification code sent.",
      provider: delivery.provider || "gmail_app_password",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/register", upload.single("validId"), async (req, res, next) => {
  try {
    const db = requireSupabase();
    const payload = req.body;
    const email = (payload.email || "").toLowerCase();
    const verificationCode = payload.verificationCode;

    if (!email || !payload.password || !verificationCode) {
      throw Object.assign(new Error("Email, password, and verification code are required."), { status: 400 });
    }

    const { data: existingUser } = await db.from("users").select("id").eq("email", email).maybeSingle();
    if (existingUser) {
      throw Object.assign(new Error("An account with this email already exists."), { status: 409 });
    }

    const { data: codeRow } = await db
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", verificationCode)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!codeRow) {
      throw Object.assign(new Error("Invalid or expired verification code."), { status: 400 });
    }

    const passwordHash = await hashPassword(bcrypt, payload.password);
    const validIdUrl = await uploadValidId(req.file, email);

    const { data: insertedUser, error: insertError } = await db
      .from("users")
      .insert({
        first_name: payload.firstName,
        middle_name: payload.middleName || "",
        last_name: payload.lastName,
        email,
        password_hash: passwordHash,
        address: payload.address || "",
        contact_number: payload.contactNumber || "",
        valid_id_url: validIdUrl,
        role: "resident",
        status: "pending",
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        verification_provider: "gmail_app_password",
        has_voted: false,
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    await db
      .from("verification_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", codeRow.id);
    await logAudit({
      actorId: insertedUser.id,
      actorRole: insertedUser.role,
      action: "register",
      entityType: "user",
      entityId: insertedUser.id,
      details: { email },
    });

    res.status(201).json({
      message: "Registration successful. Please wait for admin approval.",
      user: sanitizeUser(insertedUser),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", rateLimit({ key: "login", max: 10, windowMs: 15 * 60_000 }), async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { usernameOrEmail, password, adminOnly } = req.body;

    const { data: user } = await db
      .from("users")
      .select("*")
      .or(`email.eq.${(usernameOrEmail || "").toLowerCase()},contact_number.eq.${usernameOrEmail || ""}`)
      .maybeSingle();

    if (!user) {
      throw Object.assign(new Error("Invalid credentials."), { status: 401 });
    }

    const valid = await comparePassword(bcrypt, password || "", user.password_hash);
    if (!valid) {
      throw Object.assign(new Error("Invalid credentials."), { status: 401 });
    }

    if (user.status !== "approved" && user.role === "resident") {
      throw Object.assign(new Error("Your account is pending admin approval."), { status: 403 });
    }

    if (adminOnly && normalizeRole(user.role) !== "admin") {
      throw Object.assign(new Error("Admin access only."), { status: 403 });
    }

    const token = signToken({
      sub: user.id,
      role: normalizeRole(user.role),
      email: user.email,
    });

    res.json({
      token,
      user: sanitizeUser(user),
      sessionTimeoutMinutes: 120,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const db = requireSupabase();
    const { data: user, error } = await db.from("users").select("*").eq("id", req.auth.sub).single();
    if (error) throw error;

    const { data: election } = await db.from("elections").select("id").eq("status", "live").maybeSingle();
    let hasVoted = false;
    if (election) {
      const { data: vote } = await db
        .from("votes")
        .select("id")
        .eq("election_id", election.id)
        .eq("user_id", req.auth.sub)
        .maybeSingle();
      hasVoted = Boolean(vote);
    }

    const { data: notifications } = await db
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${req.auth.sub},broadcast.eq.true`)
      .order("created_at", { ascending: false })
      .limit(20);

    const safeUser = sanitizeUser({ ...user, has_voted: hasVoted });

    res.json({
      user: safeUser,
      notifications: notifications || [],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
