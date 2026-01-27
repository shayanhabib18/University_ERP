// backend/controllers/FacultyController.js
import supabase from "../model/supabaseClient.js";
import crypto from "crypto";
import multer from "multer";
import { sendFacultyCredentials, sendPasswordResetEmail, sendCoordinatorCredentials, sendExecutiveCredentials } from "../utils/mailer.js";
import { trackLoginActivity } from "../utils/loginTracker.js";

const FACULTY_DOCS_BUCKET = "faculty-documents";
export const facultyDocsUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const initializeFacultyDocumentStorage = async () => {
  try {
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) throw listErr;
    const exists = buckets?.some((b) => b.name === FACULTY_DOCS_BUCKET);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(FACULTY_DOCS_BUCKET, { public: true });
      if (createErr) throw createErr;
      console.log(`✅ Created storage bucket: ${FACULTY_DOCS_BUCKET}`);
    }
  } catch (err) {
    console.error("⚠️ Could not initialize faculty documents bucket:", err.message);
  }
};

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

const sanitizeFilename = (name = "file") => name.replace(/[^a-zA-Z0-9._-]/g, "_");

export const uploadFacultyDocuments = async (req, res) => {
  try {
    const { id: facultyId } = req.params;
    const files = req.files || [];

    if (!facultyId) {
      return res.status(400).json({ error: "Faculty ID is required" });
    }

    if (!files.length) {
      return res.status(400).json({ error: "No files provided" });
    }

    const { data: facultyRow, error: facultyErr } = await supabase
      .from("faculties")
      .select("id")
      .eq("id", facultyId)
      .maybeSingle();

    if (facultyErr || !facultyRow?.id) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const saved = [];

    for (const file of files) {
      const timestamp = Date.now();
      const safeName = sanitizeFilename(file.originalname);
      const storagePath = `${facultyId}/${timestamp}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from(FACULTY_DOCS_BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadErr) {
        return res.status(400).json({ error: `Upload failed for ${file.originalname}: ${uploadErr.message}` });
      }

      const { data: urlData } = supabase.storage
        .from(FACULTY_DOCS_BUCKET)
        .getPublicUrl(storagePath);

      const docRow = {
        faculty_id: facultyId,
        file_name: file.originalname,
        file_url: urlData?.publicUrl || null,
        file_type: file.mimetype || null,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("faculty_documents")
        .insert(docRow)
        .select()
        .maybeSingle();

      if (insertErr) {
        return res.status(500).json({ error: `Saved to storage but failed to record in database: ${insertErr.message}` });
      }

      saved.push(inserted);
    }

    return res.status(201).json({ message: "Documents uploaded", documents: saved });
  } catch (err) {
    console.error("Error uploading faculty documents:", err);
    return res.status(500).json({ error: err.message });
  }
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
    const { token, password, type } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    console.log("🔍 Looking for user with token:", token.substring(0, 20) + "...");
    console.log("📊 Token length:", token.length, "- Type:", type || "faculty");

    // Handle executive password setup
    if (type === "executive") {
      const { data: executive, error: findError } = await supabase
        .from("executives")
        .select("id, executive_email, executive_full_name, reset_token_expiry, auth_user_id")
        .eq("reset_token", token)
        .maybeSingle();

      if (!executive) {
        return res.status(400).json({ error: "Invalid token - executive not found. Please request a new password setup link." });
      }

      // Check if token has expired
      const now = new Date();
      const expiry = new Date(executive.reset_token_expiry);
      
      if (now > expiry) {
        return res.status(400).json({ error: "Token has expired. Please contact administration." });
      }

      // Create or update Supabase Auth user for executive
      let authUserId = executive.auth_user_id;
      
      if (!authUserId) {
        // Create new auth user for executive
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: executive.executive_email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: executive.executive_full_name,
            role: "executive",
          },
        });

        if (authError) {
          console.error("Auth user creation error:", authError);
          return res.status(400).json({ error: `Password setup failed: ${authError.message}` });
        }

        authUserId = authData.user.id;

        // Update executive record with auth_user_id
        await supabase
          .from("executives")
          .update({ auth_user_id: authUserId })
          .eq("id", executive.id);
      } else {
        // Update existing auth user password
        const { error: authError } = await supabase.auth.admin.updateUserById(
          authUserId,
          { password }
        );

        if (authError) {
          console.error("Auth password update error:", authError);
          return res.status(400).json({ error: `Password update failed: ${authError.message}` });
        }
      }

      // Clear reset token
      await supabase
        .from("executives")
        .update({
          reset_token: null,
          reset_token_expiry: null,
        })
        .eq("id", executive.id);

      console.log(`✅ Password set successfully for executive:`, executive.executive_email);
      return res.json({ message: "Password set successfully", success: true });
    }

    // Handle faculty password setup (existing logic)
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
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!faculty) {
      return res.status(404).json({ error: "Invalid email or password" });
    }

    // Check if user is a coordinator - reject them from faculty login
    if (faculty.role === "COORDINATOR") {
      return res.status(401).json({ error: "Invalid email or password" });
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

// Coordinator login - only for users with COORDINATOR role
export const coordinatorLogin = async (req, res) => {
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
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!faculty) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is a coordinator
    if (faculty.role !== "COORDINATOR") {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log(`✅ Coordinator logged in: ${faculty.email}`);
    
    // Track login activity
    await trackLoginActivity({
      user_id: faculty.id,
      user_type: 'coordinator',
      user_email: faculty.email,
      user_name: faculty.name
    }, req, 'success');

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
    console.error("Coordinator login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Executive login - for assigned executives
export const executiveLogin = async (req, res) => {
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
      console.error("Executive auth sign-in error:", signInError);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if this is an executive (either faculty-based or manual)
    // First, try to find executive by direct auth_user_id (manual executives)
    let executive = null;
    let executiveError = null;

    const { data: manualExec, error: manualError } = await supabase
      .from("executives")
      .select(`
        id,
        executive_full_name,
        executive_email,
        assignment_mode,
        faculty_id,
        auth_user_id
      `)
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    if (manualExec) {
      executive = manualExec;
    } else {
      // If not found, try to find by faculty's auth_user_id (faculty-based executives)
      const { data: facultyExec, error: facultyError } = await supabase
        .from("executives")
        .select(`
          id,
          executive_full_name,
          executive_email,
          assignment_mode,
          faculty_id,
          faculty:faculty_id(id, name, email, designation, department_id, role, auth_user_id)
        `)
        .eq("faculty.auth_user_id", authData.user.id)
        .maybeSingle();

      if (facultyExec) {
        executive = facultyExec;
      } else {
        executiveError = facultyError;
      }
    }

    if (!executive) {
      console.error("Executive not found for auth_user_id:", authData.user.id);
      return res.status(401).json({ error: "Not authorized as executive" });
    }

    const isManual = executive.assignment_mode === "manual";
    const executiveName = isManual ? executive.executive_full_name : executive.faculty?.name;
    const executiveEmail = isManual ? executive.executive_email : executive.faculty?.email;

    console.log(`✅ Executive logged in: ${executiveEmail}`);
    
    // Track login activity
    await trackLoginActivity({
      user_id: executive.id,
      user_type: 'executive',
      user_email: executiveEmail,
      user_name: executiveName
    }, req, 'success');
    
    res.json({
      success: true,
      user: {
        id: executive.id,
        email: executiveEmail,
        name: executiveName,
        role: "EXECUTIVE",
        assignment_mode: executive.assignment_mode,
        auth_user_id: authData.user.id,
      },
      token: authData.session.access_token,
    });
  } catch (err) {
    console.error("Executive login error:", err);
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

      if (!fallbackError && fallbackFaculty) {
        return res.json(fallbackFaculty);
      }

      // Final fallback: handle manually assigned HODs that lack a faculty row
      const { data: hod, error: hodError } = await supabase
        .from("hods")
        .select("id, department_id, hod_full_name, hod_email, assignment_mode, has_courses, status")
        .eq("hod_email", user.email)
        .eq("status", "ACTIVE")
        .maybeSingle();

      if (hodError) {
        return res.status(500).json({ error: hodError.message });
      }

      if (hod) {
        return res.json({
          id: hod.id,
          name: hod.hod_full_name,
          email: hod.hod_email,
          designation: "HOD",
          department_id: hod.department_id,
          role: "HOD",
          phone: null,
          qualification: null,
          joining_date: null,
          is_manual_hod: true,
          assignment_mode: hod.assignment_mode || "manual",
          has_courses: hod.has_courses || false,
        });
      }

      return res.status(404).json({ error: "Faculty profile not found", detail: facultyError.message });
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

// Coordinator-specific profile endpoint
export const getCoordinatorProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Coordinator token verification error:", authError);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data: coordinator, error: coordinatorError } = await supabase
      .from("faculties")
      .select("id, name, email, department_id, role")
      .eq("auth_user_id", user.id)
      .eq("role", "COORDINATOR")
      .single();

    if (coordinatorError || !coordinator) {
      console.error("Coordinator profile not found or not coordinator:", coordinatorError);
      return res.status(404).json({ error: "Coordinator profile not found" });
    }

    let departmentName = "";
    if (coordinator.department_id) {
      const { data: dept } = await supabase
        .from("departments")
        .select("name")
        .eq("id", coordinator.department_id)
        .maybeSingle();
      departmentName = dept?.name || "";
    }

    res.json({
      id: coordinator.id,
      name: coordinator.name,
      full_name: coordinator.name,
      email: coordinator.email,
      department_id: coordinator.department_id,
      department_name: departmentName,
      role: coordinator.role,
    });
  } catch (error) {
    console.error("Get coordinator profile error:", error);
    res.status(500).json({ error: error.message });
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
      // Fallback for manual HODs who don't have a faculty record yet
      const { data: hod, error: hodError } = await supabase
        .from("hods")
        .select("id, department_id, hod_full_name, hod_email, assignment_mode, has_courses, status")
        .eq("hod_email", email)
        .eq("status", "ACTIVE")
        .maybeSingle();

      if (hodError) {
        return res.status(500).json({ error: hodError.message });
      }

      if (hod) {
        // Return a lightweight profile so ChairDashboard can render
        return res.json({
          id: hod.id,
          name: hod.hod_full_name,
          email: hod.hod_email,
          designation: "HOD",
          department_id: hod.department_id,
          role: "HOD",
          phone: null,
          qualification: null,
          joining_date: null,
          is_manual_hod: true,
          assignment_mode: hod.assignment_mode || "manual",
          has_courses: hod.has_courses || false,
        });
      }

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
      .select("id, name, email, designation, department_id, role")
      .eq("email", email)
      .maybeSingle();

    if (findErr && findErr.code !== "PGRST116") {
      return res.status(500).json({ error: findErr.message });
    }

    // If faculty found, handle faculty/coordinator password reset
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

      // Determine reset type based on faculty role
      const isCoordinator = faculty.role === "COORDINATOR";
      const resetType = isCoordinator ? "coordinator" : "faculty";
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&type=${resetType}`;

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

    // If faculty/HOD not found, check if it's an executive
    try {
      const { data: executive, error: execErr } = await supabase
        .from("executives")
        .select("id, executive_full_name, executive_email, assignment_mode")
        .eq("executive_email", email)
        .maybeSingle();

      if (execErr && execErr.code !== "PGRST116") {
        return res.status(500).json({ error: execErr.message });
      }

      if (executive) {
        // Generate new reset token for Executive
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update token on Executive record
        const { error: upErr } = await supabase
          .from("executives")
          .update({
            reset_token: resetToken,
            reset_token_expiry: resetTokenExpiry.toISOString(),
          })
          .eq("id", executive.id);

        if (upErr) {
          return res.status(500).json({ error: upErr.message });
        }

        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&type=executive`;

        // Send reset email
        try {
          await sendPasswordResetEmail({
            toEmail: executive.executive_email,
            fullName: executive.executive_full_name,
            resetLink,
            designation: "Executive",
            departmentName: null,
          });
        } catch (mailErr) {
          // Continue even if email fails, token is updated
          console.warn("Email send failed:", mailErr?.message || mailErr);
        }

        return res.json({ success: true, message: "Password reset link sent" });
      }
    } catch (execCheckErr) {
      console.log("Note: Could not check executives table", execCheckErr);
    }

    // If neither faculty, manual HOD, nor executive found
    return res.status(404).json({ error: "No faculty, department chair, or executive found with this email" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Assign Executive Role
export const assignExecutive = async (req, res) => {
  try {
    const {
      mode = "select_faculty",
      facultyId,
      executiveFullName,
      executiveEmail,
      executiveCnic,
      executivePhone,
      executiveAddress,
      effectiveFrom,
    } = req.body;

    // Validate mode
    if (!["select_faculty", "manual"].includes(mode)) {
      return res.status(400).json({ error: "Invalid assignment mode. Must be 'select_faculty' or 'manual'" });
    }

    let executiveRecord;
    let targetEmail = null;
    let targetName = null;
    let resetLink = null;
    const portalUrl = process.env.EXECUTIVE_PORTAL_URL || "http://localhost:5173/login/executive";

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
          executive_cnic: null,
          executive_phone: null,
          executive_address: null,
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

      targetEmail = faculty.email;
      targetName = faculty.name;
      resetLink = null; // Faculty executives use their existing faculty credentials
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

      // Generate reset token for password setup
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create new executive record (without faculty_id for manual assignment)
      const { data: newExecutive, error: createError } = await supabase
        .from("executives")
        .insert([
          {
            faculty_id: null, // No faculty assigned for manual entries
            executive_full_name: executiveFullName,
            executive_email: executiveEmail,
            executive_cnic: executiveCnic || null,
            executive_phone: executivePhone || null,
            executive_address: executiveAddress || null,
            assignment_mode: "manual",
            effective_from: effectiveFrom || null,
            reset_token: resetToken,
            reset_token_expiry: resetTokenExpiry.toISOString(),
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

      targetEmail = executiveEmail;
      targetName = executiveFullName;
      resetLink = `http://localhost:5173/reset-password?token=${resetToken}&type=executive`;
      executiveRecord = newExecutive[0];
    }

    // Send credentials email (best-effort)
    if (targetEmail && targetName) {
      try {
        const emailResult = await sendExecutiveCredentials({
          toEmail: targetEmail,
          fullName: targetName,
          loginEmail: targetEmail,
          resetLink: resetLink,
          portalUrl,
        });
        if (emailResult.skipped) {
          console.warn("⚠️ SMTP not configured; executive credentials email logged to console only.");
        }
      } catch (mailErr) {
        console.warn("Executive assigned, but failed to send credentials email:", mailErr?.message || mailErr);
      }
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

    if (error) {
      // If executives table doesn't exist or has issues, return null instead of error
      console.warn("getCurrentExecutive error (non-critical):", error.message);
      return res.json(null);
    }

    res.json(data || null);
  } catch (err) {
    console.error("getCurrentExecutive error:", err);
    // Return null instead of error to prevent blocking faculty data load
    res.json(null);
  }
};

export const getFacultyDocuments = async (req, res) => {
  try {
    const { id: facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({ error: "Faculty ID is required" });
    }

    const { data: documents, error } = await supabase
      .from("faculty_documents")
      .select("id, file_name, file_url, file_type, uploaded_at")
      .eq("faculty_id", facultyId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(documents || []);
  } catch (err) {
    console.error("Error fetching faculty documents:", err);
    return res.status(500).json({ error: err.message });
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

// Assign Coordinator Role
export const assignCoordinator = async (req, res) => {
  try {
    const { id: facultyId } = req.params;

    // Validate faculty exists
    const { data: faculty, error: facultyErr } = await supabase
      .from("faculties")
      .select("id, name, email, role, department_id")
      .eq("id", facultyId)
      .maybeSingle();

    if (facultyErr) return res.status(500).json({ error: facultyErr.message });
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });

    // Check if already a coordinator
    if (faculty.role === "COORDINATOR") {
      return res.status(400).json({ error: "This faculty is already a coordinator" });
    }

    // Update faculty role to COORDINATOR
    const { data: updated, error: updateErr } = await supabase
      .from("faculties")
      .update({ role: "COORDINATOR" })
      .eq("id", facultyId)
      .select("id, name, email, role")
      .single();

    if (updateErr) return res.status(500).json({ error: updateErr.message });

    return res.json({
      message: "Coordinator assigned successfully",
      faculty: updated,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Remove Coordinator Role
export const removeCoordinator = async (req, res) => {
  try {
    const { id: facultyId } = req.params;

    // Validate faculty exists
    const { data: faculty, error: facultyErr } = await supabase
      .from("faculties")
      .select("id, name, email, role")
      .eq("id", facultyId)
      .maybeSingle();

    if (facultyErr) return res.status(500).json({ error: facultyErr.message });
    if (!faculty) return res.status(404).json({ error: "Faculty not found" });

    // Check if faculty is a coordinator
    if (faculty.role !== "COORDINATOR") {
      return res.status(400).json({ error: "This faculty is not a coordinator" });
    }

    // Update role back to FACULTY
    const { data: updated, error: updateErr } = await supabase
      .from("faculties")
      .update({ role: "FACULTY" })
      .eq("id", facultyId)
      .select("id, name, email, role")
      .single();

    if (updateErr) return res.status(500).json({ error: updateErr.message });

    return res.json({
      message: "Coordinator role removed successfully",
      faculty: updated,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get Coordinator's Department Faculty
export const getCoordinatorDepartmentFaculty = async (req, res) => {
  try {
    const coordinatorFacultyId = req.user?.faculty_id || req.user?.id;
    const authUserId = req.user?.auth_user_id;
    
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get coordinator's department from coordinators table
    const { data: coordinator, error: coordErr } = await supabase
      .from("coordinators")
      .select("department_id, faculty_id")
      .eq("faculty_id", coordinatorFacultyId)
      .maybeSingle();

    if (coordErr) return res.status(500).json({ error: coordErr.message });
    
    if (!coordinator) {
      // Fallback: check faculties table
      const { data: faculty, error: facultyErr } = await supabase
        .from("faculties")
        .select("department_id")
        .eq("id", coordinatorFacultyId)
        .eq("role", "COORDINATOR")
        .maybeSingle();
      
      if (facultyErr) return res.status(500).json({ error: facultyErr.message });
      if (!faculty?.department_id) {
        return res.status(404).json({ error: "Coordinator department not found" });
      }
      
      // Get faculty in this department
      const { data: facultyList, error: listErr } = await supabase
        .from("faculties")
        .select("id, name, email, phone, designation, qualification, role, status")
        .eq("department_id", faculty.department_id)
        .order("name");
      
      if (listErr) return res.status(500).json({ error: listErr.message });
      return res.json(facultyList || []);
    }

    // Get faculty in coordinator's department
    const { data: facultyList, error: listErr } = await supabase
      .from("faculties")
      .select("id, name, email, phone, designation, qualification, role, status")
      .eq("department_id", coordinator.department_id)
      .order("name");

    if (listErr) return res.status(500).json({ error: listErr.message });

    return res.json(facultyList || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get Coordinator's Department Students
export const getCoordinatorDepartmentStudents = async (req, res) => {
  try {
    const coordinatorFacultyId = req.user?.faculty_id || req.user?.id;
    const authUserId = req.user?.auth_user_id;
    
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get coordinator's department from coordinators table
    const { data: coordinator, error: coordErr } = await supabase
      .from("coordinators")
      .select("department_id, faculty_id")
      .eq("faculty_id", coordinatorFacultyId)
      .maybeSingle();

    if (coordErr) return res.status(500).json({ error: coordErr.message });
    
    if (!coordinator) {
      // Fallback: check faculties table
      const { data: faculty, error: facultyErr } = await supabase
        .from("faculties")
        .select("department_id")
        .eq("id", coordinatorFacultyId)
        .eq("role", "COORDINATOR")
        .maybeSingle();
      
      if (facultyErr) return res.status(500).json({ error: facultyErr.message });
      if (!faculty?.department_id) {
        return res.status(404).json({ error: "Coordinator department not found" });
      }
      
      // Get students in this department
      const { data: studentList, error: listErr } = await supabase
        .from("students")
        .select("id, full_name, personal_email, roll_number, department_id, status")
        .eq("department_id", faculty.department_id)
        .order("full_name");
      
      if (listErr) return res.status(500).json({ error: listErr.message });
      return res.json(studentList || []);
    }

    // Get students in coordinator's department
    const { data: studentList, error: listErr } = await supabase
      .from("students")
      .select("id, full_name, personal_email, roll_number, department_id, status")
      .eq("department_id", coordinator.department_id)
      .order("full_name");

    if (listErr) return res.status(500).json({ error: listErr.message });

    return res.json(studentList || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get Coordinator Overview (Department info + counts)
export const getCoordinatorOverview = async (req, res) => {
  try {
    const coordinatorFacultyId = req.user?.faculty_id || req.user?.id;
    const authUserId = req.user?.auth_user_id;
    
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get coordinator's department
    const { data: coordinator, error: coordErr } = await supabase
      .from("coordinators")
      .select("department_id, coordinator_full_name, coordinator_email")
      .eq("faculty_id", coordinatorFacultyId)
      .maybeSingle();

    let departmentId;
    
    if (coordinator) {
      departmentId = coordinator.department_id;
    } else {
      // Fallback to faculties table
      const { data: faculty, error: facultyErr } = await supabase
        .from("faculties")
        .select("department_id")
        .eq("id", coordinatorFacultyId)
        .eq("role", "COORDINATOR")
        .maybeSingle();
      
      if (facultyErr) return res.status(500).json({ error: facultyErr.message });
      if (!faculty?.department_id) {
        return res.status(404).json({ error: "Coordinator department not found" });
      }
      departmentId = faculty.department_id;
    }

    // Get department details
    const { data: department, error: deptErr } = await supabase
      .from("departments")
      .select("id, name, department_name, title, description")
      .eq("id", departmentId)
      .maybeSingle();

    if (deptErr) return res.status(500).json({ error: deptErr.message });
    if (!department) return res.status(404).json({ error: "Department not found" });

    // Get faculty count
    const { count: facultyCount, error: facultyCountErr } = await supabase
      .from("faculties")
      .select("id", { count: "exact", head: true })
      .eq("department_id", departmentId);

    if (facultyCountErr) return res.status(500).json({ error: facultyCountErr.message });

    // Get student count
    const { count: studentCount, error: studentCountErr } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("department_id", departmentId);

    if (studentCountErr) return res.status(500).json({ error: studentCountErr.message });

    return res.json({
      department,
      facultyCount: facultyCount || 0,
      studentCount: studentCount || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Manual Coordinator Assignment
export const assignCoordinatorManually = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, email, phone, designation, qualifications, assigned_for, role, address, cnic } = req.body;
    const document = req.file;

    // Validate required fields
    if (!name || !email || !qualifications) {
      return res.status(400).json({ error: "Name, email, and qualifications are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Remove existing coordinator for this department (from both tables)
    const { data: existingCoords, error: findErr } = await supabase
      .from("faculties")
      .select("id, role")
      .eq("department_id", departmentId)
      .eq("role", "COORDINATOR");

    if (findErr) return res.status(500).json({ error: findErr.message });

    // Remove coordinator role from existing coordinators in faculties table
    if (existingCoords && existingCoords.length > 0) {
      const { error: removeErr } = await supabase
        .from("faculties")
        .update({ role: "FACULTY", is_coordinator: false })
        .in("id", existingCoords.map(c => c.id));

      if (removeErr) return res.status(500).json({ error: removeErr.message });
    }

    // Remove existing coordinator from coordinators table
    await supabase.from("coordinators").delete().eq("department_id", departmentId);

    // Generate reset token (valid for 24 hours)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Check if coordinator exists by email
    const { data: existingFaculty, error: checkErr } = await supabase
      .from("faculties")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkErr && checkErr.code !== "PGRST116") {
      return res.status(500).json({ error: checkErr.message });
    }

    let coordinator;
    let coordinatorId;

    if (existingFaculty) {
      // Update existing faculty to be coordinator
      const { data: updated, error: updateErr } = await supabase
        .from("faculties")
        .update({
          name,
          role: "COORDINATOR",
          is_coordinator: true,
          phone: phone || existingFaculty.phone,
          cnic: cnic || existingFaculty.cnic,
          address: address || existingFaculty.address,
          designation: designation || "Department Coordinator",
          qualification: qualifications,
          status: "ACTIVE",
          must_change_password: true,
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString(),
        })
        .eq("id", existingFaculty.id)
        .select("id, name, email, phone, designation, role")
        .single();

      if (updateErr) return res.status(500).json({ error: updateErr.message });
      coordinator = updated;
      coordinatorId = existingFaculty.id;
    } else {
      // Create new coordinator entry
      const { data: created, error: createErr } = await supabase
        .from("faculties")
        .insert({
          name,
          email,
          phone: phone || null,
          cnic: cnic || "TEMP",
          address: address || "To be updated",
          designation: designation || "Department Coordinator",
          qualification: qualifications,
          department_id: departmentId,
          role: "COORDINATOR",
          is_coordinator: true,
          status: "ACTIVE",
          must_change_password: true,
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString(),
          joining_date: new Date().toISOString(),
        })
        .select("id, name, email, phone, designation, role")
        .single();

      if (createErr) return res.status(500).json({ error: createErr.message });
      coordinator = created;
      coordinatorId = created.id;
    }

    // Insert into coordinators table
    const { error: coordErr } = await supabase
      .from("coordinators")
      .upsert({
        faculty_id: coordinatorId,
        department_id: departmentId,
        coordinator_full_name: name,
        coordinator_email: email,
        coordinator_phone: phone || null,
        coordinator_cnic: cnic || null,
        coordinator_address: address || null,
        designation: designation || "Department Coordinator",
        qualifications: qualifications,
        assignment_mode: "manual",
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString(),
      }, { onConflict: "department_id" });

    if (coordErr) {
      if (coordErr.message && coordErr.message.includes("does not exist")) {
        return res.status(500).json({ error: "Run migration create_coordinators_table.sql to create coordinators table." });
      }
      return res.status(500).json({ error: coordErr.message });
    }

    // Upload document if provided
    if (document) {
      try {
        const timestamp = Date.now();
        const safeName = document.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `coordinators/${coordinatorId}/${timestamp}-${safeName}`;

        const { error: uploadErr } = await supabase.storage
          .from(FACULTY_DOCS_BUCKET)
          .upload(storagePath, document.buffer, {
            contentType: document.mimetype,
            upsert: false,
          });

        if (!uploadErr) {
          console.log(`✅ Document uploaded to storage: ${storagePath}`);
          
          // Get public URL for the uploaded document
          const { data: urlData } = supabase.storage
            .from(FACULTY_DOCS_BUCKET)
            .getPublicUrl(storagePath);

          // Save document metadata to faculty_documents table
          const { error: metadataErr } = await supabase
            .from("faculty_documents")
            .insert({
              faculty_id: coordinatorId,
              file_name: document.originalname,
              file_url: urlData.publicUrl,
              file_type: document.mimetype,
            });

          if (metadataErr) {
            console.warn("⚠️ Failed to save document metadata:", metadataErr.message);
          } else {
            console.log(`✅ Document metadata saved to database`);
          }
        }
      } catch (docErr) {
        console.warn("⚠️ Document upload failed, continuing:", docErr);
      }
    }

    // Send password reset link via email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&type=coordinator`;
    try {
      await sendCoordinatorCredentials(name, email, resetLink);
    } catch (emailErr) {
      console.warn("⚠️ Failed to send email, but coordinator was created:", emailErr);
    }

    return res.json({
      message: "Coordinator assigned successfully! A password reset link has been sent to their email.",
      coordinator,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
