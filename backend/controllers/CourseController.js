// backend/controllers/CourseController.js
import supabase from "../model/supabaseClient.js";

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get courses by semester
export const getCoursesBySemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("semester_id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a course
export const addCourse = async (req, res) => {
  try {
    const { semester_id, code, name, credit_hours, crhr, pre_req } = req.body;
    // Normalize to credit_hours column
    const creditHours = crhr ?? credit_hours;
    if (creditHours == null) {
      return res.status(400).json({ error: "credit_hours is required" });
    }
    const { data, error } = await supabase
      .from("courses")
      .insert([{ semester_id, code, name, credit_hours: creditHours, pre_req }])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    console.error("addCourse error", err);
    res.status(500).json({ error: err.message });
  }
};

// Update a course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester_id, code, name, credit_hours, crhr, pre_req } = req.body;
    const creditHours = crhr ?? credit_hours;
    const { data, error } = await supabase
      .from("courses")
      .update({ semester_id, code, name, credit_hours: creditHours, pre_req })
      .eq("id", id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
