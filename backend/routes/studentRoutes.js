// backend/routes/studentRoutes.js
// Express routes for student management aligned with Supabase schema
import express from "express";
import supabase from "../model/supabaseClient.js";

const router = express.Router();

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
      .or(`full_name.ilike.%${q}%,roll_number.ilike.%${q}%`);

    if (error) throw error;
    res.json(data || []);
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

// CREATE new student
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

    // Auto-generate roll number when not provided: uses department code as prefix (e.g., SE-01)
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

      const { data: lastRoll } = await supabase
        .from("students")
        .select("roll_number")
        .eq("department_id", department_id)
        .ilike("roll_number", `${prefix}-%`)
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

      finalRollNumber = `${prefix}-${String(nextNumber).padStart(2, "0")}`;
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

export default router;
