// backend/controllers/FacultyController.js
import supabase from "../model/supabaseClient.js";
import crypto from "crypto";
import { sendFacultyCredentials, sendPasswordResetEmail } from "../utils/mailer.js";

const buildPayload = (body) => {
  const {
    name,
    designation,
    qualification,
    specialization,
    email,
    phone,
    cnic,
    address,
    experience,
    joining_date,
    department_id,
    status,
    role,
    must_change_password,
  } = body;

  return {
    name,
    designation,
    qualification,
    specialization: specialization ?? null,
    email,
    phone,
    cnic,
    address: address ?? null,
    experience: experience ?? null,
    joining_date: joining_date ?? null,
    department_id,
    status: status ?? "ACTIVE",
    role: role ?? "FACULTY",
    must_change_password: must_change_password ?? true,
  };
};

export const getAllFaculty = async (_req, res) => {
  try {
    const { data, error } = await supabase.from("faculties").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFacultyByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { data, error } = await supabase
      .from("faculties")
      .select("*")
      .eq("department_id", departmentId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addFaculty = async (req, res) => {
  try {
    const required = [
      "name",
      "designation",
      "qualification",
      "email",
      "phone",
      "cnic",
      "department_id",
    ];
    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const payload = buildPayload(req.body);
    
    // Step 1: Create Supabase Auth user (without auto-email)
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: payload.email,
        password: crypto.randomBytes(12).toString('hex'), // Temporary password
        email_confirm: true, // Set to true to skip auto-confirmation email
        user_metadata: {
          full_name: payload.name,
          designation: payload.designation,
        },
      });

      if (authError) {
        return res.status(400).json({ error: `Auth user creation failed: ${authError.message}` });
      }

      // Step 2: Generate password setup token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Step 3: Create faculty record with auth_user_id and reset token
      const { data: facultyData, error: dbError } = await supabase
        .from("faculties")
        .insert([{
          ...payload,
          auth_user_id: authData.user.id,
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString(),
        }])
        .select()
        .maybeSingle();

      if (dbError) {
        // Rollback: delete auth user if faculty creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(500).json({ error: `Faculty creation failed: ${dbError.message}` });
      }

      // Step 4: Get department name for email
      let departmentName = null;
      if (payload.department_id) {
        const { data: deptData } = await supabase
          .from("departments")
          .select("name, department_name, title")
          .eq("id", payload.department_id)
          .single();
        
        departmentName = deptData?.name || deptData?.department_name || deptData?.title || null;
      }

      // Step 5: Create password setup link with token
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&type=faculty`;
      
      console.log("📝 Reset Link Details:", {
        resetLink: resetLink,
        hasTypeFaculty: resetLink.includes('type=faculty'),
        hasToken: resetLink.includes(`token=${resetToken}`),
      });

      // Step 6: Send account approved email with password setup link
      try {
        console.log("📧 Preparing to send faculty approval email:", {
          email: payload.email,
          name: payload.name,
          designation: payload.designation,
          department: departmentName,
          resetLink: resetLink,
        });

        const emailResult = await sendFacultyCredentials({
          toEmail: payload.email,
          fullName: payload.name,
          facultyId: facultyData.id,
          resetLink: resetLink,
          designation: payload.designation,
          departmentName: departmentName,
        });
        
        if (emailResult.skipped) {
          console.warn("⚠️ SMTP NOT CONFIGURED - Email logged to console only. Please configure SMTP in .env for actual email delivery.");
        } else if (emailResult.sent) {
          console.log(`✅ Faculty registered and account approval email sent to ${payload.email}`);
        }
      } catch (emailError) {
        console.error(`⚠️ Faculty registered but failed to send email:`, emailError.message);
        // Continue even if email fails - faculty is already created
      }

      res.json(facultyData);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = buildPayload(req.body);
    const { data, error } = await supabase
      .from("faculties")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("faculties").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Faculty deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    console.log("🔍 Looking for faculty with token:", token.substring(0, 20) + "...");
    console.log("📊 Token length:", token.length, "- Type:", token.length > 100 ? "Supabase Recovery" : "Custom");

    // FIRST: Try to find faculty by custom reset token
    const { data: faculty, error: findError } = await supabase
      .from("faculties")
      .select("id, auth_user_id, reset_token_expiry, reset_token, email")
      .eq("reset_token", token)
      .maybeSingle();

    if (!faculty) {
      console.error("❌ Faculty not found with this token");
      return res.status(400).json({ error: "Invalid token - faculty not found. Please request a new password reset link." });
    }

    // Check if token has expired
    const now = new Date();
    const expiry = new Date(faculty.reset_token_expiry);
    
    console.log("⏰ Token expiry check:", {
      now: now.toISOString(),
      expiry: expiry.toISOString(),
      isExpired: now > expiry,
    });
    
    if (now > expiry) {
      return res.status(400).json({ error: "Token has expired. Please request a new password reset link." });
    }

    // Update password via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      faculty.auth_user_id,
      { password }
    );

    if (authError) {
      console.error("Auth error:", authError);
      return res.status(400).json({ error: `Password update failed: ${authError.message}` });
    }

    // Clear reset token from database
    const { error: updateError } = await supabase
      .from("faculties")
      .update({
        reset_token: null,
        reset_token_expiry: null,
      })
      .eq("id", faculty.id);

    if (updateError) {
      console.error("Error clearing token:", updateError);
      // Continue - password is already set
    }

    console.log(`✅ Password set successfully for faculty:`, faculty.email);
    res.json({ message: "Password set successfully", success: true });
  } catch (err) {
    console.error("setPassword error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      console.error("Auth sign-in error:", signInError);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Get faculty details
    const { data: faculty, error: facultyError } = await supabase
      .from("faculties")
      .select("id, name, email, designation, department_id")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (facultyError || !faculty) {
      console.error("Faculty not found:", facultyError);
      return res.status(404).json({ error: "Faculty profile not found" });
    }

    console.log(`✅ Faculty logged in: ${faculty.email}`);
    
    res.json({
      success: true,
      user: {
        id: faculty.id,
        email: faculty.email,
        name: faculty.name,
        designation: faculty.designation,
        department_id: faculty.department_id,
      },
      token: authData.session.access_token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Trigger a faculty password reset by email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find faculty by email
    const { data: faculty, error: findErr } = await supabase
      .from("faculties")
      .select("id, name, email, designation, department_id")
      .eq("email", email)
      .maybeSingle();

    if (findErr) {
      return res.status(500).json({ error: findErr.message });
    }
    if (!faculty) {
      return res.status(404).json({ error: "No faculty found with this email" });
    }

    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update token on faculty
    const { error: upErr } = await supabase
      .from("faculties")
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString(),
      })
      .eq("id", faculty.id);

    if (upErr) {
      return res.status(500).json({ error: upErr.message });
    }

    // Get department name for email context
    let departmentName = null;
    if (faculty.department_id) {
      const { data: deptData } = await supabase
        .from("departments")
        .select("name, department_name, title")
        .eq("id", faculty.department_id)
        .maybeSingle();
      departmentName = deptData?.name || deptData?.department_name || deptData?.title || null;
    }

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&type=faculty`;

    // Send reset email
    try {
      await sendPasswordResetEmail({
        toEmail: faculty.email,
        fullName: faculty.name,
        resetLink,
        designation: faculty.designation,
        departmentName,
      });
    } catch (mailErr) {
      // Continue even if email fails, token is updated
      console.warn("Email send failed:", mailErr?.message || mailErr);
    }

    return res.json({ success: true, message: "Password reset link sent" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ error: err.message });
  }
};
