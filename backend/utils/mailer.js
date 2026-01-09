import nodemailer from "nodemailer";

// Create reusable transporter using SMTP
const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendStudentCredentials = async ({
  toEmail,
  fullName,
  rollNumber,
  temporaryPassword,
}) => {
  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";

  const subject = "Your University ERP Account Credentials";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#1e40af;">Welcome to University ERP</h2>
      <p>Dear ${fullName},</p>
      <p>Your student account has been created. Use the credentials below to log in:</p>
      <ul>
        <li><strong>Roll Number:</strong> ${rollNumber}</li>
        <li><strong>Email:</strong> ${toEmail}</li>
        <li><strong>Temporary Password:</strong> ${temporaryPassword}</li>
      </ul>
      <p>Please log in and change your password immediately.</p>
      <p><a href="http://localhost:5173/login/student" style="background:#1e40af;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Go to Student Portal</a></p>
      <p style="color:#555;font-size:12px;">If you did not request this, please contact the administration.</p>
    </div>
  `;

  if (!transporter) {
    console.warn("SMTP not configured; credentials logged to console below.");
    // Log credentials to console for development/testing
    console.log("\n" + "=".repeat(60));
    console.log("📧 EMAIL WOULD BE SENT (SMTP NOT CONFIGURED)");
    console.log("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Roll Number: ${rollNumber}`);
    console.log(`Temporary Password: ${temporaryPassword}`);
    console.log("=".repeat(60) + "\n");
    return { skipped: true };
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send email to ${toEmail}:`, err.message);
    throw err;
  }
};

// Send welcome email with password reset link
export const sendWelcomeWithPasswordReset = async ({
  toEmail,
  fullName,
  rollNumber,
  resetLink,
}) => {
  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";

  const subject = "Welcome to University ERP - Set Your Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#1e40af;">Welcome to University ERP</h2>
      <p>Dear ${fullName},</p>
      <p>Your student account has been approved! Here are your account details:</p>
      <ul>
        <li><strong>Roll Number:</strong> ${rollNumber}</li>
        <li><strong>Email:</strong> ${toEmail}</li>
      </ul>
      <p>To get started, please set your password by clicking the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Set Your Password</a>
      </p>
      <p>After setting your password, you can log in using your <strong>Roll Number</strong> or <strong>Email</strong> with your new password.</p>
      <p style="color:#555;font-size:12px;">This link will expire in 24 hours. If you did not request this, please contact the administration.</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      <p style="color:#888;font-size:11px;">If the button doesn't work, copy and paste this link in your browser:<br>${resetLink}</p>
    </div>
  `;

  if (!transporter) {
    console.warn("SMTP not configured; email details logged to console below.");
    console.log("\n" + "=".repeat(60));
    console.log("📧 WELCOME EMAIL WOULD BE SENT (SMTP NOT CONFIGURED)");
    console.log("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Roll Number: ${rollNumber}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("=".repeat(60) + "\n");
    return { skipped: true };
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });
    console.log(`✅ Welcome email sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send welcome email to ${toEmail}:`, err.message);
    throw err;
  }
};
