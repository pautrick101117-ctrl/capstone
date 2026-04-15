import { verifyToken } from "../lib/jwt.js";

export const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return next(Object.assign(new Error("Authentication required."), { status: 401 }));
  }

  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    next(Object.assign(new Error("Invalid or expired session."), { status: 401 }));
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    return next(Object.assign(new Error("You do not have access to this action."), { status: 403 }));
  }

  next();
};
