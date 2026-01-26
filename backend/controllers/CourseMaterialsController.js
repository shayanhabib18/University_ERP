import supabase from "../model/supabaseClient.js";

// Storage bucket name
const BUCKET_NAME = "course-materials";

// Ensure bucket exists (run once on startup)
export const initializeStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      console.log(`✅ Created storage bucket: ${BUCKET_NAME}`);
    } else {
      console.log(`✅ Storage bucket already exists: ${BUCKET_NAME}`);
    }
  } catch (err) {
    console.error(`⚠️ Could not initialize storage bucket:`, err.message);
  }
};

export const getAllMaterials = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("course_materials")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMaterialsByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { data, error } = await supabase
      .from("course_materials")
      .select("*")
      .eq("course_id", course_id)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadMaterial = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate unique filename: {course_id}/{timestamp}-{originalname}
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${course_id}/${timestamp}-${safeName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(400).json({ error: `Upload failed: ${uploadError.message}` });
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl;

    // Insert record in database
    const { data, error: dbError } = await supabase
      .from("course_materials")
      .insert([
        {
          course_id: course_id,
          name: safeName,
          description: description || null,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          file_path: publicUrl,
          uploaded_at: new Date().toISOString(),
        },
      ])
      .select();

    if (dbError) throw dbError;

    res.status(201).json({
      success: true,
      material: data?.[0],
    });
  } catch (err) {
    console.error("Upload material error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    // Get material to find file path
    const { data: mats, error: getErr } = await supabase
      .from("course_materials")
      .select("id, file_path")
      .eq("id", id)
      .limit(1);

    if (getErr) throw getErr;
    const mat = mats?.[0];
    if (!mat) return res.status(404).json({ error: "Material not found" });

    // Delete DB record
    const { error: delErr } = await supabase
      .from("course_materials")
      .delete()
      .eq("id", id);

    if (delErr) throw delErr;

    // Delete file from Supabase Storage if path exists
    if (mat.file_path) {
      try {
        // Extract path from URL: e.g., extract "course_id/timestamp-filename" from the full URL
        const urlParts = mat.file_path.split(`/${BUCKET_NAME}/`);
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from(BUCKET_NAME).remove([filePath]);
        }
      } catch (e) {
        // Log but don't fail if file deletion fails
        console.warn("Could not delete file from storage:", e.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete material error:", err);
    res.status(500).json({ error: err.message });
  }
};
