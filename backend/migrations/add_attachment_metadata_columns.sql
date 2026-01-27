-- Adds missing metadata columns for announcement attachments
ALTER TABLE IF EXISTS announcement_attachments
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS file_type TEXT;
