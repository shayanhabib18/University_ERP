-- Faculty messages between faculty members
CREATE TABLE IF NOT EXISTS faculty_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  recipient_faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  body TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_faculty_messages_sender ON faculty_messages(sender_faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_messages_recipient ON faculty_messages(recipient_faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_messages_created ON faculty_messages(created_at DESC);
