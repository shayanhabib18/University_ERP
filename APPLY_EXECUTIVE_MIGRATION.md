# Apply Executive Migration to Supabase

## Quick Fix: The "Failed to load faculty data" error is happening because the migration hasn't been applied yet.

## Solution - Apply Migration in Supabase Dashboard

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run this SQL (Copy everything below)

```sql
-- Add extra details columns for executives
ALTER TABLE executives ADD COLUMN IF NOT EXISTS executive_cnic TEXT;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS executive_phone TEXT;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS executive_address TEXT;

-- Add password and reset token fields for executive authentication
ALTER TABLE executives ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;
ALTER TABLE executives ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_executives_cnic ON executives(executive_cnic);
CREATE INDEX IF NOT EXISTS idx_executives_phone ON executives(executive_phone);
CREATE INDEX IF NOT EXISTS idx_executives_reset_token ON executives(reset_token);
CREATE INDEX IF NOT EXISTS idx_executives_auth_user_id ON executives(auth_user_id);
```

### Step 3: Click the "RUN" button (or press Ctrl+Enter)

You should see: **"Success. No rows returned"**

### Step 4: Verify columns were added
Run this query to confirm:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'executives'
ORDER BY ordinal_position;
```

You should see all the new columns including: `reset_token`, `reset_token_expiry`, `auth_user_id`

### Step 5: Restart Backend
```bash
# Press Ctrl+C in the backend terminal, then:
cd backend
npm run dev
```

### Step 6: Refresh Admin Panel
The "Failed to load faculty data" error should be gone.

---

## Alternative: If Supabase Dashboard doesn't work

You can also run the migration using the Supabase CLI or by connecting directly to your PostgreSQL database using a tool like pgAdmin or DBeaver with your Supabase connection string.

---

## After Migration is Applied

Test the executive assignment flow:
1. Admin Panel → Assign Executive
2. Fill in details and submit
3. Check backend console for password setup link
4. Click link to set password
5. Login at Executive Portal
