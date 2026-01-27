# Apply Announcements Tables Migration

## Migration File Created
`backend/migrations/create_announcements_tables.sql`

## What This Migration Does
Creates the following tables for announcement system:

1. **announcements** - Stores announcement details (title, message, sender info)
2. **announcement_recipients** - Tracks which roles can receive each announcement
3. **announcement_attachments** - Stores file attachments metadata (file name, URL, size, type)

## How to Apply Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in left sidebar
3. Click "New query"
4. Copy the entire content of `backend/migrations/create_announcements_tables.sql`
5. Paste into the SQL editor
6. Click "Run" button
7. You should see success messages for each table created

### Option 2: Supabase CLI
```bash
# From the project root directory
cd backend
supabase db push
```

### Option 3: psql Command Line
```bash
# From backend directory
psql "postgresql://[YOUR_SUPABASE_CONNECTION_STRING]" -f migrations/create_announcements_tables.sql
```

## Verify Migration
Run this query in Supabase SQL Editor to verify tables exist:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('announcements', 'announcement_recipients', 'announcement_attachments');
```

Expected result: 3 rows showing all three table names.

## What's Already Configured

### Backend (Already Done ✅)
- File upload endpoint: `POST /announcements/attachment/upload`
- Attachments are saved to Supabase Storage bucket: `announcement-attachments`
- Attachment metadata (file_name, file_url, file_size, file_type) is saved to database
- Attachments are loaded when fetching announcements

### Frontend (Already Done ✅)
- Executive can attach files when creating announcements
- Files are uploaded via multipart/form-data to backend
- Attachments are displayed in announcement cards
- Users can download attachments by clicking them

## After Migration
Once the migration is applied:
1. Restart the backend server
2. Create a test announcement from Executive portal with an attachment
3. Verify the attachment appears in the announcement
4. Check Supabase Storage bucket `announcement-attachments` for uploaded file
5. Check `announcement_attachments` table for metadata record
