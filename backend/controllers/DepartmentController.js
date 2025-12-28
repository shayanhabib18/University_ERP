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
