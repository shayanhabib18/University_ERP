// backend/routes/studentRoutes.js
// Express routes for student management
import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ==================== STUDENT ROUTES ====================

// GET all students
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
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

// SEARCH students - must come BEFORE /:studentId route
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .or(
        `full_name.ilike.%${q}%,roll_number.ilike.%${q}%,university_email.ilike.%${q}%`
      );

    if (error) throw error;
    res.json(data || []);
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
      university_email,
      personal_email,
      student_phone,
      parent_phone,
      permanent_address,
      current_address,
    } = req.body;

    // Validate required fields
    if (
      !full_name ||
      !father_name ||
      !cnic ||
      !roll_number ||
      !department_id ||
      !university_email
    ) {
      return res.status(400).json({ error: "Missing required fields" });
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
          roll_number,
          department_id,
          joining_session,
          joining_date,
          university_email,
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
    res.status(201).json(data[0]);
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
    res.json(data[0]);
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

export default router;
