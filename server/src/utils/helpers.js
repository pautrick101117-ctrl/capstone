export const createCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

export const hashPassword = async (bcrypt, password) => bcrypt.hash(password, 12);

export const comparePassword = async (bcrypt, password, hash) => bcrypt.compare(password, hash);

export const normalizeRole = (role) => {
  if (["admin", "super_admin", "staff"].includes(role)) {
    return "admin";
  }

  return "resident";
};

export const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  middleName: user.middle_name,
  lastName: user.last_name,
  address: user.address,
  contactNumber: user.contact_number,
  role: normalizeRole(user.role),
  status: user.status,
  emailVerified: user.email_verified,
  emailVerifiedAt: user.email_verified_at,
  verificationProvider: user.verification_provider,
  hasVoted: Boolean(user.has_voted),
  createdAt: user.created_at,
});
