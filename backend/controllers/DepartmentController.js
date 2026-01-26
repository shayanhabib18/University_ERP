// backend/controllers/DepartmentController.js
import supabase from "../model/supabaseClient.js";
import crypto from "crypto";
import { sendHODCredentials, sendHODAssignmentNotification, sendHODRemovalNotification } from "../utils/mailer.js";

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase.from("departments").select("*");
    if (error) return res.status(500).json({ error: error.message });
    
    // Fetch HOD information for each department from the new hods table
    const departmentsWithHOD = await Promise.all(
      (data || []).map(async (dept) => {
        try {
          const { data: hod } = await supabase
            .from("hods")
            .select(`
              id,
              faculty_id,
              hod_full_name,
              hod_email,
              assignment_mode,
              has_courses,
              faculties(id, name, email)
            `)
            .eq("department_id", dept.id)
            .eq("status", "ACTIVE")
            .maybeSingle();
          
          // If no HOD found, return department without HOD info
          if (!hod) {
            return {
              ...dept,
              hodName: null,
              hodEmail: null,
              hodId: null,
              hod_full_name: null,
              hod_email: null,
              assignment_mode: null,
              has_courses: false,
            };
          }
          
          // Get HOD name from either faculty or manual entry
          const hodName = hod?.faculties?.name || hod?.hod_full_name || null;
          const hodEmail = hod?.faculties?.email || hod?.hod_email || null;
          
          return {
            ...dept,
            hodName,
            hodEmail,
            hodId: hod?.faculty_id || null,
            hod_full_name: hod?.hod_full_name || null,
            hod_email: hod?.hod_email || null,
            assignment_mode: hod?.assignment_mode || null,
            has_courses: hod?.has_courses || false,
          };
        } catch (err) {
          console.error(`Error fetching HOD for department ${dept.id}:`, err);
          // If hods table doesn't exist yet, just return department without HOD info
          return {
            ...dept,
            hodName: null,
            hodEmail: null,
            hodId: null,
            hod_full_name: null,
            hod_email: null,
            assignment_mode: null,
            has_courses: false,
          };
        }
      })
    );
    
    res.json(departmentsWithHOD);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a department
export const addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    const { data, error } = await supabase
      .from("departments")
      .insert([{ name, code }])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const { data, error } = await supabase
      .from("departments")
      .update({ name, code })
      .eq("id", id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Department not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get HOD for a department
export const getHODByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    // Get HOD from the new hods table
    const { data, error } = await supabase
      .from("hods")
      .select(`
        id,
        faculty_id,
        hod_full_name,
        hod_email,
        assignment_mode,
        faculties(id, name, email)
      `)
      .eq("department_id", departmentId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    
    if (error && error.code !== "PGRST116") {
      // If hods table doesn't exist, try old method with is_hod flag
      if (error.message && error.message.includes("does not exist")) {
        const { data: oldHod } = await supabase
          .from("faculties")
          .select("*")
          .eq("department_id", departmentId)
          .eq("is_hod", true)
          .maybeSingle();
        return res.json(oldHod || null);
      }
      return res.status(500).json({ error: error.message });
    }
    
    // Format response with either faculty info or manual HOD info
    if (data) {
      const hod = data.faculties || {
        name: data.hod_full_name,
        email: data.hod_email,
      };
      return res.json(hod);
    }
    
    res.json(null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// HOD Login - for manually assigned HODs only
export const hodLogin = async (req, res) => {
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

    // Get HOD details for this email
    const { data: hod, error: hodError } = await supabase
      .from("hods")
      .select("id, hod_full_name, hod_email, department_id, assignment_mode, has_courses")
      .eq("hod_email", email)
      .eq("assignment_mode", "manual")
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (hodError) {
      console.error("HOD query error:", hodError);
      return res.status(404).json({ error: "HOD profile not found or not manually assigned" });
    }

    if (!hod) {
      return res.status(404).json({ error: "HOD profile not found" });
    }

    // Get department info
    const { data: department } = await supabase
      .from("departments")
      .select("id, name")
      .eq("id", hod.department_id)
      .single();

    const hodResponse = {
      id: hod.id,
      email: hod.hod_email,
      name: hod.hod_full_name,
      department_id: hod.department_id,
      department_name: department?.name || "Unknown",
      role: "HOD",
      assignment_mode: "manual",
      has_courses: hod.has_courses || false,
    };

    res.json({
      success: true,
      user: hodResponse,
      token: authData.session.access_token,
    });
  } catch (err) {
    console.error("HOD Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Assign HOD to a department (supports both select and manual modes)
export const assignHOD = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { 
      mode = "select_faculty", 
      facultyId, 
      hodFullName, 
      hodEmail,
      effectiveFrom 
    } = req.body;

    // Validate mode
    if (!["select_faculty", "manual"].includes(mode)) {
      return res.status(400).json({ error: "Invalid assignment mode. Must be 'select_faculty' or 'manual'" });
    }

    // Get current HOD before removing (to send notification)
    let previousHOD = null;
    try {
      const { data: currentHod } = await supabase
        .from("hods")
        .select(`
          id,
          faculty_id,
          hod_full_name,
          hod_email,
          faculties(id, name, email)
        `)
        .eq("department_id", departmentId)
        .eq("status", "ACTIVE")
        .maybeSingle();
      
      if (currentHod) {
        previousHOD = currentHod.faculties || {
          name: currentHod.hod_full_name,
          email: currentHod.hod_email,
        };
      }
    } catch (err) {
      // New table might not exist yet
    }

    // Mark old HOD as inactive
    if (previousHOD) {
      try {
        await supabase
          .from("hods")
          .update({ status: "INACTIVE" })
          .eq("department_id", departmentId)
          .eq("status", "ACTIVE");
      } catch (err) {
        console.log("Note: Could not mark previous HOD as inactive");
      }

      // Get department info for email
      const { data: deptData } = await supabase
        .from("departments")
        .select("name")
        .eq("id", departmentId)
        .single();

      const departmentNameForEmail = deptData?.name || "Unknown Department";

      try {
        await sendHODRemovalNotification({
          toEmail: previousHOD.email,
          fullName: previousHOD.name,
          departmentName: departmentNameForEmail,
        });
        console.log(`✅ HOD removal notification sent to previous HOD (${previousHOD.email})`);
      } catch (emailError) {
        console.error(`⚠️ Failed to send HOD removal notification:`, emailError.message);
      }
    }

    let hodResponse;

    if (mode === "select_faculty") {
      // Mode 1: Select from existing faculty
      if (!facultyId) {
        return res.status(400).json({ error: "Faculty ID is required for select_faculty mode" });
      }

      // Verify faculty exists and belongs to this department
      const { data: faculty, error: facultyError } = await supabase
        .from("faculties")
        .select("*")
        .eq("id", facultyId)
        .eq("department_id", departmentId)
        .single();

      if (facultyError || !faculty) {
        return res.status(400).json({ error: "Faculty not found in this department" });
      }

      // Create or update HOD record in hods table
      const { data: hodData, error: hodError } = await supabase
        .from("hods")
        .upsert([{
          department_id: departmentId,
          faculty_id: facultyId,
          assignment_mode: "select_faculty",
          effective_from: effectiveFrom || null,
          status: "ACTIVE",
        }], { onConflict: "department_id" })
        .select();

      if (hodError) {
        if (hodError.message && hodError.message.includes("does not exist")) {
          return res.status(500).json({
            error: "HOD table not initialized. Please run migration: create_hod_table.sql"
          });
        }
        return res.status(500).json({ error: hodError.message });
      }

      hodResponse = { ...faculty, hodId: facultyId };

      // Send notification email to the faculty member
      const { data: deptData } = await supabase
        .from("departments")
        .select("name")
        .eq("id", departmentId)
        .single();

      const departmentNameForEmail = deptData?.name || "Unknown Department";

      try {
        await sendHODAssignmentNotification({
          toEmail: faculty.email,
          fullName: faculty.name,
          departmentName: departmentNameForEmail,
        });
        console.log(`✅ Existing faculty member (${faculty.email}) assigned as HOD - Notification email sent`);
      } catch (emailError) {
        console.error(`⚠️ HOD assigned but failed to send notification email:`, emailError.message);
      }
    } else if (mode === "manual") {
      // Mode 2: Manual HOD assignment
      if (!hodFullName || !hodEmail) {
        return res.status(400).json({ error: "HOD Full Name and Email are required for manual mode" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(hodEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Generate reset token for new HOD
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      // Create HOD record with manual entry
      const { data: hodData, error: hodError } = await supabase
        .from("hods")
        .upsert([{
          department_id: departmentId,
          hod_full_name: hodFullName,
          hod_email: hodEmail,
          assignment_mode: "manual",
          effective_from: effectiveFrom || null,
          status: "ACTIVE",
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry,
        }], { onConflict: "department_id" })
        .select();

      if (hodError) {
        if (hodError.message && hodError.message.includes("does not exist")) {
          return res.status(500).json({
            error: "HOD table not initialized. Please run migration: create_hod_table.sql"
          });
        }
        return res.status(500).json({ error: hodError.message });
      }

      hodResponse = { name: hodFullName, email: hodEmail };

      // Get department info for email
      const { data: deptData } = await supabase
        .from("departments")
        .select("name")
        .eq("id", departmentId)
        .single();

      const departmentNameForEmail = deptData?.name || "Unknown Department";

      // Send email with password setup link (include type=hod so frontend knows to redirect to Chairman login)
      const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&type=hod`;
      
      try {
        await sendHODCredentials({
          toEmail: hodEmail,
          fullName: hodFullName,
          resetLink,
          departmentName: departmentNameForEmail,
        });
        console.log(`✅ New HOD account created and email sent to ${hodEmail}`);
      } catch (emailError) {
        console.error(`⚠️ HOD created but failed to send email:`, emailError.message);
      }
    }

    // Update department with HOD info
    try {
      if (mode === "select_faculty" && faculty) {
        // For faculty-based HODs, store their auth_user_id in department_chair
        await supabase
          .from("departments")
          .update({ department_chair: faculty.auth_user_id })
          .eq("id", departmentId);
        console.log(`✅ Updated department_chair with faculty auth_user_id: ${faculty.auth_user_id}`);
      } else {
        // For manual HODs, set department_chair to null since they don't have auth yet
        await supabase
          .from("departments")
          .update({ department_chair: null })
          .eq("id", departmentId);
        console.log("ℹ️  Set department_chair to null (manual HOD - auth created on password setup)");
      }
    } catch (deptErr) {
      console.log("⚠️  Could not update department_chair:", deptErr.message);
    }

    res.json({
      message: `HOD assigned successfully (${mode})`,
      data: hodResponse,
      previousHOD: previousHOD ? {
        name: previousHOD.name,
        email: previousHOD.email,
      } : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
