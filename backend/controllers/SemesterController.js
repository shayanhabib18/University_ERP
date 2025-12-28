// backend/controllers/SemesterController.js
import supabase from "../model/supabaseClient.js";

// Get all semesters
export const getAllSemesters = async (req, res) => {
  try {
    const { data, error } = await supabase.from("semesters").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get semesters by department
export const getSemestersByDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("department_id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add semester
export const addSemester = async (req, res) => {
  try {
    const { department_id, number } = req.body;
    const { data, error } = await supabase
      .from("semesters")
      .insert([{ department_id, number }])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update semester
export const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, number } = req.body;
    const { data, error } = await supabase
      .from("semesters")
      .update({ department_id, number })
      .eq("id", id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete semester
export const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("semesters").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Semester deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
