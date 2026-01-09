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
      <h2 style="color:#1e40af;">🎉 Account Approved!</h2>
      <p>Dear ${fullName},</p>
      <p>Congratulations! Your student account has been approved. Here are your account details:</p>
      
      <div style="background:#f0f7ff;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Roll Number:</strong> <code style="background:#fff;padding:5px 10px;border-radius:4px;font-family:monospace;">${rollNumber}</code></p>
        <p style="margin:8px 0;"><strong>Email:</strong> <code style="background:#fff;padding:5px 10px;border-radius:4px;font-family:monospace;">${toEmail}</code></p>
        ${departmentName ? `<p style="margin:8px 0;"><strong>Department:</strong> ${departmentName}</p>` : ''}
      </div>

      <h3 style="color:#1e40af;margin-top:25px;">Set Your Password:</h3>
      <p>Click the button below to set your initial password:</p>
      
      <p style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Set Password Now</a>
      </p>

      <p style="color:#666;font-size:13px;">After setting your password, you can log in to the Student Portal using your Roll Number or Email.</p>

      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      <p style="color:#555;font-size:13px;"><strong>Forgot Password Later?</strong> You can always click "Forgot Password" on the login page to reset your password.</p>
      <p style="color:#888;font-size:11px;">This link expires in 24 hours. If you did not apply for this account or if you have any issues, contact the administration office immediately.</p>
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
// Send approval notification email with login details
export const sendApprovalEmail = async ({
  toEmail,
  fullName,
  rollNumber,
  departmentName,
}) => {
  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";

  const subject = "Account Approved - Welcome to University ERP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#1e40af;">🎉 Account Approved!</h2>
      <p>Dear ${fullName},</p>
      <p>Congratulations! Your student account has been approved. Here are your login details:</p>
      
      <div style="background:#f0f7ff;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Roll Number:</strong> <code style="background:#fff;padding:5px 10px;border-radius:4px;font-family:monospace;">${rollNumber}</code></p>
        <p style="margin:8px 0;"><strong>Email:</strong> <code style="background:#fff;padding:5px 10px;border-radius:4px;font-family:monospace;">${toEmail}</code></p>
        ${departmentName ? `<p style="margin:8px 0;"><strong>Department:</strong> ${departmentName}</p>` : ''}
      </div>

      <h3 style="color:#1e40af;margin-top:25px;">How to Get Started:</h3>
      <ol>
        <li>Click the button below to go to the Student Portal</li>
        <li>Use your <strong>Roll Number</strong> or <strong>Email</strong> to log in</li>
        <li>Click <strong>"Forgot Password"</strong> to set your initial password</li>
        <li>Log in with your new password</li>
      </ol>

      <p style="text-align:center;margin:30px 0;">
        <a href="http://localhost:5173/login/student" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Go to Student Portal</a>
      </p>

      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      <p style="color:#555;font-size:13px;"><strong>Need Help?</strong> If you have any issues, contact the administration office.</p>
      <p style="color:#888;font-size:11px;">If you did not apply for this account, please contact the administration immediately.</p>
    </div>
  `;

  if (!transporter) {
    console.warn("SMTP not configured; email details logged to console below.");
    console.log("\n" + "=".repeat(60));
    console.log("📧 APPROVAL EMAIL WOULD BE SENT (SMTP NOT CONFIGURED)");
    console.log("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Roll Number: ${rollNumber}`);
    console.log(`Student Name: ${fullName}`);
    console.log(`Department: ${departmentName}`);
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
    console.log(`✅ Approval email sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send approval email to ${toEmail}:`, err.message);
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
