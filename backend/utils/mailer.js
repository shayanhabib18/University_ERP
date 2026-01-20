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

// Send approval email with password reset link
export const sendApprovalEmailWithLink = async ({
  toEmail,
  fullName,
  rollNumber,
  departmentName,
  resetLink,
}) => {
  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";

  const subject = "Account Approved - Set Your Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#1e40af;">Account Approved</h2>
      <p>Dear ${fullName},</p>
      <p>Your student account has been approved. Click the button below to set your password:</p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Set Password</a>
      </p>

      <p style="color:#888;font-size:11px;">This link expires in 24 hours. If you did not apply for this account, please ignore this email.</p>
      <p style="color:#888;font-size:11px;">If the button doesn't work, copy and paste this link in your browser:<br>${resetLink}</p>
    </div>
  `;

  if (!transporter) {
    console.warn("SMTP not configured; email details logged to console below.");
    console.log("\n" + "=".repeat(60));
    console.log("📧 APPROVAL EMAIL WITH LINK WOULD BE SENT (SMTP NOT CONFIGURED)");
    console.log("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Roll Number: ${rollNumber}`);
    console.log(`Student Name: ${fullName}`);
    console.log(`Department: ${departmentName}`);
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
    console.log(`✅ Approval email with link sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send approval email to ${toEmail}:`, err.message);
    throw err;
  }
};

// Send faculty credentials email
export const sendFacultyCredentials = async ({
  toEmail,
  fullName,
  facultyId,
  resetLink,
  designation,
  departmentName,
}) => {
  // Validate required parameters
  if (!toEmail || !fullName || !resetLink) {
    throw new Error("Missing required parameters: toEmail, fullName, or resetLink");
  }

  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";

  const subject = "Welcome to University ERP - Set Your Password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#1e40af;">Welcome to University ERP</h2>
      <p>Dear ${fullName},</p>
      <p>Your faculty account has been created. Please click the button below to set your password and activate your account:</p>
      
      <div style="background:#f0f7ff;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Email:</strong> <code style="background:#fff;padding:5px 10px;border-radius:4px;font-family:monospace;">${toEmail}</code></p>
        ${designation ? `<p style="margin:8px 0;"><strong>Designation:</strong> ${designation}</p>` : ''}
        ${departmentName ? `<p style="margin:8px 0;"><strong>Department:</strong> ${departmentName}</p>` : ''}
      </div>

      <h3 style="color:#1e40af;margin-top:25px;">Set Your Password:</h3>
      <p>Click the button below to create your password and access the Faculty Portal:</p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Set Password & Login</a>
      </p>

      <p style="color:#666;font-size:13px;">After setting your password, you can log in to the Faculty Portal using your email address and new password.</p>

      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      <p style="color:#555;font-size:13px;"><strong>Security Notice:</strong> This link expires in 24 hours for security purposes.</p>
      <p style="color:#888;font-size:11px;">If you did not expect this email or have any concerns, please contact the administration office immediately.</p>
      <p style="color:#888;font-size:11px;">If the button doesn't work, copy and paste this link in your browser:<br>${resetLink}</p>
    </div>
  `;

  if (!transporter) {
    console.warn("\n" + "⚠️".repeat(30));
    console.warn("⚠️  SMTP NOT CONFIGURED - EMAILS WILL NOT BE SENT  ⚠️");
    console.warn("⚠️".repeat(30));
    console.warn("\n📋 TO FIX: Configure SMTP in your .env file:\n");
    console.warn("    SMTP_HOST=smtp.gmail.com");
    console.warn("    SMTP_PORT=587");
    console.warn("    SMTP_USER=your-email@gmail.com");
    console.warn("    SMTP_PASS=your-app-password");
    console.warn("    FROM_EMAIL=your-email@gmail.com\n");
    console.warn("📧 EMAIL THAT WOULD BE SENT (if SMTP was configured):");
    console.warn("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Faculty Name: ${fullName}`);
    console.log(`Designation: ${designation || 'N/A'}`);
    console.log(`Department: ${departmentName || 'N/A'}`);
    console.log(`Password Setup Link: ${resetLink}`);
    console.warn("=".repeat(60) + "\n");
    return { skipped: true };
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });
    console.log(`✅ Faculty credentials email sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send faculty credentials email to ${toEmail}:`, err.message);
    throw err;
  }
};

// Send password reset email (for forgot password)
export const sendPasswordResetEmail = async ({
  toEmail,
  fullName,
  resetLink,
  designation,
  departmentName,
}) => {
  // Validate required parameters
  if (!toEmail || !fullName || !resetLink) {
    throw new Error("Missing required parameters: toEmail, fullName, or resetLink");
  }

  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";

  const subject = "Password Reset - University ERP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#1e40af;">Reset Password</h2>
      <p>Follow this link to reset the password for your user:</p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Reset Password</a>
      </p>
    </div>
  `;

  if (!transporter) {
    console.warn("\n" + "⚠️".repeat(30));
    console.warn("⚠️  SMTP NOT CONFIGURED - EMAILS WILL NOT BE SENT  ⚠️");
    console.warn("⚠️".repeat(30));
    console.warn("📧 PASSWORD RESET EMAIL WOULD BE SENT (if SMTP was configured):");
    console.warn("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Faculty Name: ${fullName}`);
    console.log(`Reset Link: ${resetLink}`);
    console.warn("=".repeat(60) + "\n");
    return { skipped: true };
  }

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });
    console.log(`✅ Password reset email sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send password reset email to ${toEmail}:`, err.message);
    throw err;
  }
};
