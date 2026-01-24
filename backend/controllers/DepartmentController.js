// backend/controllers/DepartmentController.js
import supabase from "../model/supabaseClient.js";

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase.from("departments").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
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
    
    // First check if the is_hod column exists, if not return null
    let { data, error } = await supabase
      .from("faculties")
      .select("*")
      .eq("department_id", departmentId)
      .eq("is_hod", true)
      .maybeSingle();
    
    // If there's a column not found error, just return null (column doesn't exist yet)
    if (error && error.message && error.message.includes("does not exist")) {
      return res.json(null);
    }
    
    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ error: error.message });
    }
    
    // PGRST116 means no rows found, which is fine
    res.json(data || null);
  } catch (err) {
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

    if (!departmentId) {
      return res.status(400).json({ error: "Department ID is required" });
    }

    // Validate mode
    if (!["select_faculty", "manual"].includes(mode)) {
      return res.status(400).json({ error: "Invalid assignment mode. Must be 'select_faculty' or 'manual'" });
    }

    // Remove HOD status from any existing HOD in the department
    try {
      const { error: removeError } = await supabase
        .from("faculties")
        .update({ is_hod: false })
        .eq("department_id", departmentId)
        .eq("is_hod", true);

      if (removeError && !removeError.message.includes("does not exist")) {
        console.log("Warning: Could not remove previous HOD:", removeError.message);
      }
    } catch (removeErr) {
      console.log("Note: Could not remove previous HOD status");
    }

    let updatedFaculty;

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

      // Set the HOD with select_faculty mode
      const { data: updated, error: updateError } = await supabase
        .from("faculties")
        .update({
          is_hod: true,
          assignment_mode: "select_faculty",
          effective_from: effectiveFrom || null,
          hod_full_name: null,
          hod_email: null,
        })
        .eq("id", facultyId)
        .select();

      if (updateError) {
        if (updateError.message && updateError.message.includes("does not exist")) {
          return res.status(500).json({
            error: "Database schema needs to be updated. Please run the migration: add_hod_manual_assignment.sql"
          });
        }
        return res.status(500).json({ error: updateError.message });
      }

      updatedFaculty = updated[0];
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

      // Create a new faculty record for manual HOD
      const { data: newFaculty, error: createError } = await supabase
        .from("faculties")
        .insert([
          {
            department_id: departmentId,
            name: hodFullName,
            email: hodEmail,
            is_hod: true,
            assignment_mode: "manual",
            hod_full_name: hodFullName,
            hod_email: hodEmail,
            effective_from: effectiveFrom || null,
            status: "ACTIVE",
            role: "FACULTY",
          }
        ])
        .select();

      if (createError) {
        if (createError.message && createError.message.includes("does not exist")) {
          return res.status(500).json({
            error: "Database schema needs to be updated. Please run the migration: add_hod_manual_assignment.sql"
          });
        }
        return res.status(500).json({ error: createError.message });
      }

      updatedFaculty = newFaculty[0];
    }

    // Update department with HOD info
    try {
      await supabase
        .from("departments")
        .update({ department_chair: updatedFaculty.id })
        .eq("id", departmentId);
    } catch (deptErr) {
      console.log("Note: Could not update department_chair");
    }

    res.json({
      message: `HOD assigned successfully (${mode})`,
      data: updatedFaculty
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
