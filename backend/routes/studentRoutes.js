// backend/routes/studentRoutes.js
// Express routes for student management aligned with Supabase schema
import express from "express";
import supabase from "../model/supabaseClient.js";
import { sendWelcomeWithPasswordReset } from "../utils/mailer.js";

const router = express.Router();

// ==================== STUDENT SIGNUP REQUEST ROUTES ====================

// GET all pending signup requests
router.get("/signup-requests", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_signup_requests")
      .select(`
        *,
        departments:department_id (
          id,
          name,
          code
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET single signup request by ID
router.get("/signup-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { data, error } = await supabase
      .from("student_signup_requests")
      .select(`
        *,
        departments:department_id (
          id,
          name,
          code
        )
      `)
      .eq("id", requestId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CREATE new signup request
router.post("/signup-requests", async (req, res) => {
  try {
    const {
      student_name,
      father_name,
      email,
      mobile,
      cnic,
      qualification,
      obtained_marks,
      total_marks,
      city,
      department_id,
      joining_date,
      joining_session,
      marksheet_url,
    } = req.body;

    const required = [
      "student_name",
      "father_name",
      "email",
      "mobile",
      "cnic",
      "qualification",
      "obtained_marks",
      "total_marks",
      "city",
      "department_id",
      "joining_date",
      "joining_session",
    ];

    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const { data, error } = await supabase
      .from("student_signup_requests")
      .insert([
        {
          student_name,
          father_name,
          email,
          mobile,
          cnic,
          qualification,
          obtained_marks,
          total_marks,
          city,
          department_id,
          joining_date,
          joining_session,
          marksheet_url,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE signup request status (approve/decline)
router.put("/signup-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const { data, error } = await supabase
      .from("student_signup_requests")
      .update({ status })
      .eq("id", requestId)
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// APPROVE signup request - create auth user, student record, and send password reset link
router.post("/signup-requests/:requestId/approve", async (req, res) => {
  try {
    const { requestId } = req.params;

    // Get the signup request
    const { data: request, error: fetchError } = await supabase
      .from("student_signup_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError) throw new Error("Signup request not found");
    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    const email = request.email;

    // Create Supabase Auth user with a random temporary password (will be changed via reset link)
    const generateRandomPassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: generateRandomPassword(),
      email_confirm: true,
      user_metadata: {
        full_name: request.student_name,
        role: 'student',
        department_id: request.department_id
      }
    });

    if (authError) throw new Error(`Failed to create auth user: ${authError.message}`);

    // Auto-generate roll number with batch year format: SE101-01, SE101-02, etc.
    const { data: dept } = await supabase
      .from("departments")
      .select("code,name")
      .eq("id", request.department_id)
      .single();

    const prefixSource = dept?.code || dept?.name || "STU";
    const prefix = prefixSource.toString().trim();
    
    // Get current year for batch (e.g., 2026 -> 101 for batch 2026, or use joining year)
    const joiningYear = request.joining_date ? new Date(request.joining_date).getFullYear() : new Date().getFullYear();
    const batchYear = joiningYear.toString().slice(-2); // Last 2 digits: 2026 -> 26
    const rollPrefix = `${prefix}1${batchYear}`; // e.g., SE126 for Software Engineering batch 2026

    const { data: lastRoll } = await supabase
      .from("students")
      .select("roll_number")
      .eq("department_id", request.department_id)
      .ilike("roll_number", `${rollPrefix}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastRoll?.roll_number) {
      const parts = lastRoll.roll_number.split("-");
      const maybeNum = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(maybeNum)) {
        nextNumber = maybeNum + 1;
      }
    }

    const rollNumber = `${rollPrefix}-${String(nextNumber).padStart(2, "0")}`; // e.g., SE126-01

    // Create student record
    const { error: studentError } = await supabase
      .from("students")
      .insert([{
        auth_user_id: authUser.user.id,
        full_name: request.student_name,
        father_name: request.father_name,
        date_of_birth: null, // Will be updated later by student
        gender: null, // Will be updated later by student
        cnic: request.cnic,
        roll_number: rollNumber,
        department_id: request.department_id,
        joining_session: request.joining_session,
        joining_date: request.joining_date,
        personal_email: request.email,
        student_phone: request.mobile,
        parent_phone: null,
        permanent_address: null,
        current_address: request.city,
        status: "active"
      }]);

    if (studentError) {
      // Rollback: delete auth user if student creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create student record: ${studentError.message}`);
    }

    // Update signup request status to approved
    await supabase
      .from("student_signup_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    // Generate password reset link and send approval email
    try {
      const { sendApprovalEmailWithLink } = await import('../utils/mailer.js');
      const departmentName = dept?.name || 'N/A';
      
      // Generate recovery link using Supabase admin
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: 'http://localhost:5173/reset-password'
        }
      });

      if (linkError) {
        console.warn(`⚠️  Failed to generate reset link: ${linkError.message}`);
        throw new Error(`Failed to generate reset link: ${linkError.message}`);
      }

      // Extract the recovery link
      let resetLink = linkData?.properties?.action_link || 
                     linkData?.action_link || 
                     `http://localhost:5173/reset-password#access_token=${linkData?.properties?.hashed_token}&type=recovery`;

      await sendApprovalEmailWithLink({
        toEmail: email,
        fullName: request.student_name,
        rollNumber: rollNumber,
        departmentName: departmentName,
        resetLink: resetLink,
      });

      console.log(`\n${'='.repeat(60)}`);
      console.log('✉️  APPROVAL EMAIL WITH PASSWORD LINK SENT');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Roll Number: ${rollNumber}`);
      console.log(`Student Name: ${request.student_name}`);
      console.log(`Department: ${departmentName}`);
      console.log(`Instructions: Student clicks link to set initial password`);

      console.log('='.repeat(60) + '\n');


    } catch (mailErr) {
      console.warn("Failed to send approval email:", mailErr?.message || mailErr);
      // Continue anyway - student can set password via forgot password later
    }

    res.json({
      success: true,
      message: "Student approved. Notification email sent with login details.",
      rollNumber: rollNumber
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE signup request
router.delete("/signup-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const { error } = await supabase
      .from("student_signup_requests")
      .delete()
      .eq("id", requestId);

    if (error) throw error;
    res.json({ message: "Signup request deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== STUDENT ROUTES ====================

// GET all students
router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// SEARCH students (placed before id-based route)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .or(`full_name.ilike.%${q}%,roll_number.ilike.%${q}%,personal_email.ilike.%${q}%`);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET current student profile using auth token (supabase access token)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing access token" });

    // Decode JWT to extract user id (sub)
    const parts = token.split(".");
    if (parts.length < 2) return res.status(401).json({ error: "Invalid token" });
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    const userId = payload.sub;
    if (!userId) return res.status(401).json({ error: "Invalid token payload" });

    const { data: student, error } = await supabase
      .from("students")
      .select("id, full_name, roll_number, personal_email, student_phone, current_address, joining_session, department_id")
      .eq("auth_user_id", userId)
      .single();

    if (error) throw error;
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Fetch department name if department_id exists
    let departmentName = "";
    if (student.department_id) {
      const { data: dept } = await supabase
        .from("departments")
        .select("name")
        .eq("id", student.department_id)
        .single();
      departmentName = dept?.name || "";
    }

    res.json({
      ...student,
      department_name: departmentName,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET students by department
router.get("/department/:departmentId", async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("department_id", departmentId)
      .order("roll_number", { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET single student by ID
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CREATE new student with Supabase Auth account and send credentials
router.post("/register-with-auth", async (req, res) => {
  try {
    const {
      full_name,
      father_name,
      date_of_birth,
      gender,
      cnic,
      department_id,
      joining_session,
      joining_date,
      personal_email,
      student_phone,
      parent_phone,
      permanent_address,
      current_address,
    } = req.body;

    const required = [
      "full_name",
      "father_name",
      "cnic",
      "department_id",
      "personal_email",
    ];

    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Generate temporary password
    const generatePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const temporaryPassword = generatePassword();

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: personal_email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        role: 'student',
        department_id: department_id
      }
    });

    if (authError) throw new Error(`Failed to create auth user: ${authError.message}`);

    // Auto-generate roll number with batch year format
    const { data: dept, error: deptError } = await supabase
      .from("departments")
      .select("code,name")
      .eq("id", department_id)
      .single();

    if (deptError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw deptError;
    }

    const prefixSource = dept?.code || dept?.name || "DEP";
    const prefix = (prefixSource || "DEP").toString().trim();
    
    // Get batch year from joining date
    const joiningYear = joining_date ? new Date(joining_date).getFullYear() : new Date().getFullYear();
    const batchYear = joiningYear.toString().slice(-2);
    const rollPrefix = `${prefix}1${batchYear}`;

    const { data: lastRoll } = await supabase
      .from("students")
      .select("roll_number")
      .eq("department_id", department_id)
      .ilike("roll_number", `${rollPrefix}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastRoll?.roll_number) {
      const parts = lastRoll.roll_number.split("-");
      const maybeNum = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(maybeNum)) {
        nextNumber = maybeNum + 1;
      }
    }

    const finalRollNumber = `${rollPrefix}-${String(nextNumber).padStart(2, "0")}`;

    // Create student record
    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          auth_user_id: authUser.user.id,
          full_name,
          father_name,
          date_of_birth,
          gender,
          cnic,
          roll_number: finalRollNumber,
          department_id,
          joining_session,
          joining_date,
          personal_email,
          student_phone,
          parent_phone,
          permanent_address,
          current_address,
          status: "active",
        },
      ])
      .select();

    if (error) {
      // Rollback: delete auth user if student creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

    // Attempt to send credentials email
    try {
      await sendStudentCredentials({
        toEmail: personal_email,
        fullName: full_name,
        rollNumber: finalRollNumber,
        temporaryPassword,
      });
    } catch (mailErr) {
      console.warn("Failed to send credentials email:", mailErr?.message || mailErr);
    }

    // Log credentials
    console.log(`\n✉️  STUDENT CREDENTIALS GENERATED ✉️`);
    console.log(`Email: ${personal_email}`);
    console.log(`Temporary Password: ${temporaryPassword}`);
    console.log(`Roll Number: ${finalRollNumber}`);
    console.log(`-----------------------------------\n`);

    res.status(201).json({
      success: true,
      student: data?.[0],
      credentials: {
        email: personal_email,
        temporaryPassword: temporaryPassword,
        rollNumber: finalRollNumber
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
});

// CREATE new student (without auth - legacy endpoint)
router.post("/", async (req, res) => {
  try {
    const {
      full_name,
      father_name,
      date_of_birth,
      gender,
      cnic,
      roll_number,
      department_id,
      joining_session,
      joining_date,
      personal_email,
      student_phone,
      parent_phone,
      permanent_address,
      current_address,
    } = req.body;

    const required = [
      "full_name",
      "father_name",
      "cnic",
      "department_id",
      "date_of_birth",
    ];

    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Auto-generate roll number when not provided: uses department code with batch year (e.g., SE126-01)
    let finalRollNumber = roll_number;
    if (!finalRollNumber) {
      const { data: dept, error: deptError } = await supabase
        .from("departments")
        .select("code,name")
        .eq("id", department_id)
        .single();

      if (deptError) throw deptError;

      const prefixSource = dept?.code || dept?.name || "DEP";
      const prefix = (prefixSource || "DEP").toString().trim();
      
      // Get batch year from joining date
      const joiningYear = joining_date ? new Date(joining_date).getFullYear() : new Date().getFullYear();
      const batchYear = joiningYear.toString().slice(-2);
      const rollPrefix = `${prefix}1${batchYear}`;

      const { data: lastRoll } = await supabase
        .from("students")
        .select("roll_number")
        .eq("department_id", department_id)
        .ilike("roll_number", `${rollPrefix}-%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNumber = 1;
      if (lastRoll?.roll_number) {
        const parts = lastRoll.roll_number.split("-");
        const maybeNum = parseInt(parts[parts.length - 1], 10);
        if (!Number.isNaN(maybeNum)) {
          nextNumber = maybeNum + 1;
        }
      }

      finalRollNumber = `${rollPrefix}-${String(nextNumber).padStart(2, "0")}`;
    }

    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          full_name,
          father_name,
          date_of_birth,
          gender,
          cnic,
          roll_number: finalRollNumber,
          department_id,
          joining_session,
          joining_date,
          personal_email,
          student_phone,
          parent_phone,
          permanent_address,
          current_address,
          status: "active",
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE student
router.put("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from("students")
      .update(updateData)
      .eq("id", studentId)
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE student
router.delete("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (error) throw error;
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ACADEMIC RECORDS ROUTES ====================

// GET academic records for a student
router.get("/academic-records/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabase
      .from("academic_records")
      .select("*")
      .eq("student_id", studentId)
      .order("semester", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET specific semester record
router.get(
  "/academic-records/student/:studentId/semester/:semester",
  async (req, res) => {
    try {
      const { studentId, semester } = req.params;
      const { data, error } = await supabase
        .from("academic_records")
        .select("*")
        .eq("student_id", studentId)
        .eq("semester", parseInt(semester, 10))
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// CREATE academic record
router.post("/academic-records", async (req, res) => {
  try {
    const {
      student_id,
      semester,
      academic_year,
      attendance,
      gpa,
      overall_grade,
      total_credit_hours,
      earned_credit_hours,
      remarks,
    } = req.body;

    const required = ["student_id", "semester", "academic_year"];
    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const { data, error } = await supabase
      .from("academic_records")
      .insert([
        {
          student_id,
          semester,
          academic_year,
          attendance,
          gpa,
          overall_grade,
          total_credit_hours,
          earned_credit_hours,
          remarks,
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE academic record
router.put("/academic-records/:recordId", async (req, res) => {
  try {
    const { recordId } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from("academic_records")
      .update(updateData)
      .eq("id", recordId)
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE academic record
router.delete("/academic-records/:recordId", async (req, res) => {
  try {
    const { recordId } = req.params;

    const { error } = await supabase
      .from("academic_records")
      .delete()
      .eq("id", recordId);

    if (error) throw error;
    res.json({ message: "Academic record deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== DOCUMENTS ROUTES ====================

// GET documents for a student
router.get("/documents/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", studentId)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE document
router.delete("/documents/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;

    const { error } = await supabase
      .from("student_documents")
      .delete()
      .eq("id", documentId);

    if (error) throw error;
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== COURSE ENROLLMENTS ROUTES ====================

// GET enrollments for a student
router.get("/enrollments/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("student_id", studentId)
      .order("semester", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET enrollments for a semester
router.get(
  "/enrollments/student/:studentId/semester/:semester",
  async (req, res) => {
    try {
      const { studentId, semester } = req.params;
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("student_id", studentId)
        .eq("semester", parseInt(semester, 10));

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// CREATE enrollment
router.post("/enrollments", async (req, res) => {
  try {
    const { student_id, course_id, semester, academic_year, credit_hours } =
      req.body;

    const required = ["student_id", "course_id", "semester", "academic_year"];
    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const { data, error } = await supabase
      .from("course_enrollments")
      .insert([
        {
          student_id,
          course_id,
          semester,
          academic_year,
          credit_hours,
          status: "ongoing",
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DROP course
router.put("/enrollments/:enrollmentId/drop", async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const { data, error } = await supabase
      .from("course_enrollments")
      .update({ status: "dropped" })
      .eq("id", enrollmentId)
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DEBUG: Check all students with full details (remove in production)
router.get("/debug/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, roll_number, personal_email, student_phone, current_address, joining_session, department_id");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
