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
      .select("id, name, email, designation, department_id, role, auth_user_id")
      .eq("auth_user_id", authData.user.id)
      .single();

    if (facultyError) {
      console.error("Faculty query error:", facultyError);
      return res.status(404).json({ error: "Faculty profile not found. Please use the correct login portal." });
    }

    if (!faculty) {
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
        role: faculty.role,
        auth_user_id: faculty.auth_user_id,
      },
      token: authData.session.access_token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get faculty profile from auth token
export const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Token verification error:", authError);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Get faculty details by auth_user_id
    const { data: faculty, error: facultyError } = await supabase
      .from("faculties")
      .select("id, name, email, designation, department_id, role, phone, qualification, joining_date, auth_user_id")
      .eq("auth_user_id", user.id)
      .single();

    if (facultyError) {
      console.error("Faculty query error:", facultyError);
      // Fallback: try to find by email if auth_user_id lookup fails
      const { data: fallbackFaculty, error: fallbackError } = await supabase
        .from("faculties")
        .select("id, name, email, designation, department_id, role, phone, qualification, joining_date, auth_user_id")
        .eq("email", user.email)
        .single();

      if (fallbackError || !fallbackFaculty) {
        return res.status(404).json({ error: "Faculty profile not found", detail: facultyError.message });
      }
      return res.json(fallbackFaculty);
    }

    if (!faculty) {
      return res.status(404).json({ error: "Faculty profile not found" });
    }

    res.json(faculty);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get faculty profile by email (simpler fallback for ChairDashboard)
export const getProfileByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { data: faculty, error: facultyError } = await supabase
      .from("faculties")
      .select("id, name, email, designation, department_id, role, phone, qualification, joining_date")
      .eq("email", email)
      .single();

    if (facultyError || !faculty) {
      return res.status(404).json({ error: "Faculty profile not found" });
    }

    res.json(faculty);
  } catch (err) {
    console.error("getProfileByEmail error:", err);
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

    // First, try to find faculty by email
    const { data: faculty, error: findErr } = await supabase
      .from("faculties")
      .select("id, name, email, designation, department_id")
      .eq("email", email)
      .maybeSingle();

    if (findErr && findErr.code !== "PGRST116") {
      return res.status(500).json({ error: findErr.message });
    }

    // If faculty found, handle faculty password reset
    if (faculty) {
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
    }

    // If faculty not found, check if it's a manually assigned HOD
    try {
      const { data: hod, error: hodErr } = await supabase
        .from("hods")
        .select("id, hod_full_name, hod_email, department_id, assignment_mode")
        .eq("hod_email", email)
        .eq("assignment_mode", "manual")
        .eq("status", "ACTIVE")
        .maybeSingle();

      if (hodErr && hodErr.code !== "PGRST116") {
        return res.status(500).json({ error: hodErr.message });
      }

      if (hod) {
        // Generate new reset token for HOD
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update token on HOD record
        const { error: upErr } = await supabase
          .from("hods")
          .update({
            reset_token: resetToken,
            reset_token_expiry: resetTokenExpiry.toISOString(),
          })
          .eq("id", hod.id);

        if (upErr) {
          return res.status(500).json({ error: upErr.message });
        }

        // Get department name for email context
        let departmentName = null;
        if (hod.department_id) {
          const { data: deptData } = await supabase
            .from("departments")
            .select("name, department_name, title")
            .eq("id", hod.department_id)
            .maybeSingle();
          departmentName = deptData?.name || deptData?.department_name || deptData?.title || null;
        }

        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&type=hod`;

        // Send reset email
        try {
          await sendPasswordResetEmail({
            toEmail: hod.hod_email,
            fullName: hod.hod_full_name,
            resetLink,
            designation: "Department Chair",
            departmentName,
          });
        } catch (mailErr) {
          // Continue even if email fails, token is updated
          console.warn("Email send failed:", mailErr?.message || mailErr);
        }

        return res.json({ success: true, message: "Password reset link sent" });
      }
    } catch (hodCheckErr) {
      console.log("Note: Could not check HOD table", hodCheckErr);
    }

    // If neither faculty nor manual HOD found
    return res.status(404).json({ error: "No faculty or department chair found with this email" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Assign Executive Role
export const assignExecutive = async (req, res) => {
  try {
    const { mode = "select_faculty", facultyId, executiveFullName, executiveEmail, effectiveFrom } = req.body;

    // Validate mode
    if (!["select_faculty", "manual"].includes(mode)) {
      return res.status(400).json({ error: "Invalid assignment mode. Must be 'select_faculty' or 'manual'" });
    }

    let executiveRecord;

    if (mode === "select_faculty") {
      // Mode 1: Assign existing faculty as executive
      if (!facultyId) {
        return res.status(400).json({ error: "Faculty ID is required for select_faculty mode" });
      }

      // Verify faculty exists
      const { data: faculty, error: facultyError } = await supabase
        .from("faculties")
        .select("*")
        .eq("id", facultyId)
        .single();

      if (facultyError || !faculty) {
        return res.status(400).json({ error: "Faculty not found" });
      }

      // Remove any existing executive record
      await supabase.from("executives").delete().neq("faculty_id", facultyId);

      // Mark previous faculty as non-executive
      await supabase
        .from("faculties")
        .update({ is_executive: false })
        .neq("id", facultyId)
        .eq("is_executive", true);

      // Create or update executive record for this faculty
      const { data: executive, error: executiveError } = await supabase
        .from("executives")
        .upsert({
          faculty_id: facultyId,
          assignment_mode: "select_faculty",
          effective_from: effectiveFrom || null,
          executive_full_name: null,
          executive_email: null,
        }, { onConflict: "faculty_id" })
        .select();

      if (executiveError) {
        if (executiveError.message && executiveError.message.includes("does not exist")) {
          return res.status(500).json({
            error: "Database schema needs to be updated. Please run the migration: create_executives_table.sql"
          });
        }
        return res.status(500).json({ error: executiveError.message });
      }

      // Mark this faculty as executive
      await supabase
        .from("faculties")
        .update({ is_executive: true })
        .eq("id", facultyId);

      executiveRecord = {
        ...executive[0],
        faculty: faculty
      };
    } else if (mode === "manual") {
      // Mode 2: Manual Executive assignment
      if (!executiveFullName || !executiveEmail) {
        return res.status(400).json({ error: "Executive Full Name and Email are required for manual mode" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(executiveEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Remove any existing executive record
      await supabase.from("executives").delete().not("faculty_id", "is", null);

      // Mark previous executive faculty as non-executive
      await supabase
        .from("faculties")
        .update({ is_executive: false })
        .eq("is_executive", true);

      // Create new executive record (without faculty_id for manual assignment)
      const { data: newExecutive, error: createError } = await supabase
        .from("executives")
        .insert([
          {
            faculty_id: null, // No faculty assigned for manual entries
            executive_full_name: executiveFullName,
            executive_email: executiveEmail,
            assignment_mode: "manual",
            effective_from: effectiveFrom || null,
          }
        ])
        .select();

      if (createError) {
        if (createError.message && createError.message.includes("does not exist")) {
          return res.status(500).json({
            error: "Database schema needs to be updated. Please run the migration: create_executives_table.sql"
          });
        }
        return res.status(500).json({ error: createError.message });
      }

      executiveRecord = newExecutive[0];
    }

    res.json({
      message: `Executive assigned successfully (${mode}). Previous executive role has been removed.`,
      data: executiveRecord
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current executive
export const getCurrentExecutive = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("executives")
      .select(`
        *,
        faculty:faculty_id(*)
      `)
      .maybeSingle();

    if (error && error.message && !error.message.includes("does not exist")) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign courses to a faculty
export const assignCoursesToFaculty = async (req, res) => {
  try {
    const { id: facultyId } = req.params;
    const { courseIds } = req.body;

    if (!facultyId) {
      return res.status(400).json({ error: "Faculty ID is required" });
    }
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: "courseIds must be a non-empty array" });
    }

    // Validate faculty exists and get department
    const { data: faculty, error: facultyErr } = await supabase
      .from("faculties")
      .select("id, department_id, role, is_hod")
      .eq("id", facultyId)
      .maybeSingle();

    if (facultyErr) return res.status(500).json({ error: facultyErr.message });
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });

    // Enforce business rule: only regular faculty can be assigned courses
    const role = (faculty.role || "").toUpperCase();
    if (role === "EXECUTIVE" || role === "DEPT_CHAIR" || faculty.is_hod === true) {
      return res.status(400).json({ error: "Only regular faculty can be assigned courses" });
    }

    // Fetch courses and ensure they belong to the same department through semesters
    const { data: courses, error: coursesErr } = await supabase
      .from("courses")
      .select("id, name, semester_id, semesters:semester_id(department_id)")
      .in("id", courseIds);

    if (coursesErr) return res.status(500).json({ error: coursesErr.message });

    // Validate department match
    const invalid = (courses || []).filter(
      (c) => (c?.semesters?.department_id ?? null) !== faculty.department_id
    );
    if (invalid.length > 0) {
      return res.status(400).json({
        error: "Some courses do not belong to the faculty's department",
        invalidCourseIds: invalid.map((c) => c.id),
      });
    }

    // Upsert assignments
    const rows = courseIds.map((cid) => ({ faculty_id: facultyId, course_id: cid }));
    const { data: assigned, error: upsertErr } = await supabase
      .from("faculty_courses")
      .upsert(rows, { onConflict: "faculty_id,course_id" })
      .select("id, course_id, assigned_at");

    if (upsertErr) return res.status(500).json({ error: upsertErr.message });

    return res.json({
      message: "Courses assigned successfully",
      assignedCount: assigned?.length || 0,
      assigned,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
