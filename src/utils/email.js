import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 📧 Reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g., "sandbox.smtp.mailtrap.io"
  port: process.env.EMAIL_PORT, // e.g., 2525
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send verification email
export const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${token}`;

  const mailOptions = {
    from: `"NarcStop AI" <no-reply@narcstop.ai>`,
    to,
    subject: "Verify Your Email - NarcStop AI",
    html: `
      <h2>Welcome to NarcStop AI 🌟</h2>
      <p>Thank you for registering! Please click below to verify your email:</p>
      <a href="${verificationUrl}" 
         style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Verification email sent to ${to}`);
};


// ✅ Send password reset email
export const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"NarcStop AI Support" <support@narcstop.ai>`,
    to,
    subject: "Reset Your Password - NarcStop AI",
    html: `
      <h2>Password Reset Request 🔐</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}" 
         style="background:#2196F3;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Password reset email sent to ${to}`);
};
