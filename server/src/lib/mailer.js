import nodemailer from "nodemailer";
import { env, hasGmailAppConfig } from "./env.js";

let transporter = null;

if (hasGmailAppConfig) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.gmailAppEmail,
      pass: env.gmailAppPassword,
    },
  });
}

export const sendVerificationEmail = async ({ email, code, fullName }) => {
  if (!transporter) {
    console.log(`[verification] ${email} => ${code}`);
    return { delivered: false, preview: code };
  }

  await transporter.sendMail({
    from: `"${env.gmailFromName}" <${env.gmailAppEmail}>`,
    to: email,
    subject: "Your Barangay Iba verification code",
    text: `Hello ${fullName || "resident"}, your verification code is ${code}. It expires in 10 minutes.`,
  });

  return { delivered: true, provider: "gmail_app_password" };
};
