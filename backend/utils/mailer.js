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
      <h2 style="color:#1e40af;">Reset Your Password</h2>
      <p>Dear ${fullName},</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Reset Password</a>
      </p>

      <p style="color:#666;font-size:14px;line-height:1.6;">
        <strong>If the button doesn't work, copy and paste this link in your browser:</strong><br/>
        <span style="word-break:break-all;font-size:12px;">${resetLink}</span>
      </p>

      <p style="color:#888;font-size:12px;margin-top:20px;">
        <strong>Link expires in:</strong> 24 hours<br/>
        <strong>If you did not request this,</strong> please ignore this email or contact support if you have concerns.
      </p>
    </div>
  `;

  if (!transporter) {
    console.warn("\n" + "⚠️".repeat(30));
    console.warn("⚠️  SMTP NOT CONFIGURED - EMAILS WILL NOT BE SENT  ⚠️");
    console.warn("⚠️".repeat(30));
    console.warn("\n📧 PASSWORD RESET EMAIL CONTENT (Email not sent - SMTP not configured):");
    console.warn("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Name: ${fullName}`);
    if (designation) console.log(`Designation: ${designation}`);
    if (departmentName) console.log(`Department: ${departmentName}`);
    console.log(`\nReset Link: ${resetLink}`);
    console.log(`\nHTML Email Body:`);
    console.log(html);
    console.warn("=".repeat(60));
    console.warn("\n⚠️  To enable email sending, configure SMTP in your .env file");
    console.warn("⚠️  See backend/EMAIL_SETUP.md for detailed instructions\n");
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

// Send HOD credentials email (for new HOD accounts)
export const sendHODCredentials = async ({
  toEmail,
  fullName,
  resetLink,
  departmentName,
}) => {
  // Validate required parameters
  if (!toEmail || !fullName || !resetLink || !departmentName) {
    throw new Error("Missing required parameters: toEmail, fullName, resetLink, or departmentName");
  }

  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";

  const subject = "Welcome as Head of Department - University ERP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#1e40af;">Welcome as Head of Department</h2>
      <p>Dear ${fullName},</p>
      <p>You have been assigned as the <strong>Head of Department</strong> for <strong>${departmentName}</strong>.</p>
      
      <div style="background:#f0f7ff;padding:20px;border-radius:8px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Email:</strong> <code style="background:#fff;padding:5px 10px;border-radius:4px;font-family:monospace;">${toEmail}</code></p>
        <p style="margin:8px 0;"><strong>Role:</strong> Head of Department (HOD)</p>
        <p style="margin:8px 0;"><strong>Department:</strong> ${departmentName}</p>
      </div>

      <h3 style="color:#1e40af;margin-top:25px;">Set Your Password:</h3>
      <p>Click the button below to create your password and access your HOD Portal:</p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Set Password & Access Portal</a>
      </p>

      <p style="color:#666;font-size:13px;">After setting your password, you can log in to the Faculty Portal using your email address and new password. You will have access to both Faculty and HOD features.</p>

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
    console.warn("📧 HOD CREDENTIALS EMAIL THAT WOULD BE SENT (if SMTP was configured):");
    console.warn("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`HOD Name: ${fullName}`);
    console.log(`Department: ${departmentName}`);
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
    console.log(`✅ HOD credentials email sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send HOD credentials email to ${toEmail}:`, err.message);
    throw err;
  }
};

// Send HOD assignment notification email (for existing faculty)
export const sendHODAssignmentNotification = async ({
  toEmail,
  fullName,
  departmentName,
}) => {
  // Validate required parameters
  if (!toEmail || !fullName || !departmentName) {
    throw new Error("Missing required parameters: toEmail, fullName, or departmentName");
  }

  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";
  const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const subject = "You Have Been Assigned as Head of Department";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#1e40af;">Congratulations on Your New Role!</h2>
      <p>Dear ${fullName},</p>
      <p>You have been assigned as the <strong>Head of Department (HOD)</strong> for the <strong>${departmentName}</strong> department.</p>
      
      <div style="background:#f0f7ff;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#1e40af;margin-top:0;">Important Information:</h3>
        <p style="margin:8px 0;">✓ You can use your <strong>existing faculty login credentials</strong> to access the portal</p>
        <p style="margin:8px 0;">✓ No new password is required</p>
        <p style="margin:8px 0;">✓ You will now have access to both <strong>Faculty</strong> and <strong>Department Chair (HOD)</strong> features</p>
      </div>

      <h3 style="color:#1e40af;margin-top:25px;">Login to Your Portal:</h3>
      <p>Click the button below to access the portal with your existing credentials:</p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${loginUrl}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Access Portal</a>
      </p>

      <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;">
        <p style="margin:0;color:#856404;"><strong>Note:</strong> Use the same email and password you've been using for faculty login. You will see additional HOD menu options after logging in.</p>
      </div>

      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      <p style="color:#555;font-size:13px;">Your responsibilities as HOD include managing department affairs, overseeing faculty, and making key departmental decisions.</p>
      <p style="color:#888;font-size:11px;">If you have any questions about your new role, please contact the administration office.</p>
    </div>
  `;

  if (!transporter) {
    console.warn("\n" + "⚠️".repeat(30));
    console.warn("⚠️  SMTP NOT CONFIGURED - EMAILS WILL NOT BE SENT  ⚠️");
    console.warn("⚠️".repeat(30));
    console.warn("📧 HOD ASSIGNMENT NOTIFICATION THAT WOULD BE SENT (if SMTP was configured):");
    console.warn("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Faculty Name: ${fullName}`);
    console.log(`Department: ${departmentName}`);
    console.log(`Message: Use existing faculty credentials to access HOD portal`);
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
    console.log(`✅ HOD assignment notification sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send HOD assignment notification to ${toEmail}:`, err.message);
    throw err;
  }
};

// Send HOD removal notification email (when HOD is changed)
export const sendHODRemovalNotification = async ({
  toEmail,
  fullName,
  departmentName,
}) => {
  // Validate required parameters
  if (!toEmail || !fullName || !departmentName) {
    throw new Error("Missing required parameters: toEmail, fullName, or departmentName");
  }

  const transporter = getTransporter();
  const fromEmail = process.env.FROM_EMAIL || "no-reply@university.local";
  const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const subject = "Change in Your HOD Assignment";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#dc2626;">HOD Assignment Change</h2>
      <p>Dear ${fullName},</p>
      <p>We are writing to inform you that your assignment as <strong>Head of Department (HOD)</strong> for the <strong>${departmentName}</strong> department has been changed.</p>
      
      <div style="background:#fee;padding:20px;border-left:4px solid #dc2626;margin:20px 0;">
        <h3 style="color:#dc2626;margin-top:0;">Important Changes:</h3>
        <p style="margin:8px 0;">✗ You no longer have access to the Department Chair (HOD) portal</p>
        <p style="margin:8px 0;">✓ You still have access to the Faculty portal with your existing credentials</p>
        <p style="margin:8px 0;">✓ Your faculty login remains active and unchanged</p>
      </div>

      <p>You can continue to log in using your existing credentials to access the <strong>Faculty Portal</strong>:</p>

      <p style="text-align:center;margin:30px 0;">
        <a href="${loginUrl}" style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-size:16px;">Access Faculty Portal</a>
      </p>

      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      <p style="color:#555;font-size:13px;">Thank you for your service as Head of Department. You will continue to have all faculty privileges.</p>
      <p style="color:#888;font-size:11px;">If you have any questions about this change, please contact the administration office.</p>
    </div>
  `;

  if (!transporter) {
    console.warn("\n" + "⚠️".repeat(30));
    console.warn("⚠️  SMTP NOT CONFIGURED - EMAILS WILL NOT BE SENT  ⚠️");
    console.warn("⚠️".repeat(30));
    console.warn("📧 HOD REMOVAL NOTIFICATION THAT WOULD BE SENT (if SMTP was configured):");
    console.warn("=".repeat(60));
    console.log(`To: ${toEmail}`);
    console.log(`Faculty Name: ${fullName}`);
    console.log(`Department: ${departmentName}`);
    console.log(`Message: HOD access removed, faculty access remains`);
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
    console.log(`✅ HOD removal notification sent to ${toEmail}`);
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send HOD removal notification to ${toEmail}:`, err.message);
    throw err;
  }
};
