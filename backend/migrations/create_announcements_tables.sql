-- Create announcements tables

-- Main announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_id UUID,
  sender_role TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_sender_role ON announcements(sender_role);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- Announcement recipients table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS announcement_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  recipient_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster recipient queries
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_announcement_id ON announcement_recipients(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_role ON announcement_recipients(recipient_role);

-- Announcement attachments table
CREATE TABLE IF NOT EXISTS announcement_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster attachment queries
CREATE INDEX IF NOT EXISTS idx_announcement_attachments_announcement_id ON announcement_attachments(announcement_id);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_announcement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_announcements_timestamp
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_announcement_timestamp();
