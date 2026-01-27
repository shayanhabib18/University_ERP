# Check if Executive Migration Was Applied

## Quick Database Check

Run this SQL query in your Supabase SQL Editor to check if the migration was applied:

```sql
-- Check if auth_user_id column exists in executives table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'executives' 
AND column_name IN ('auth_user_id', 'reset_token', 'reset_token_expiry', 'executive_cnic', 'executive_phone', 'executive_address');
```

**Expected Result:** Should return 6 rows showing all these columns exist.

**If no rows returned:** The migration was NOT applied. Run the migration SQL from `backend/migrations/add_executive_details.sql` in Supabase SQL Editor.

## Alternative Check - View Executive Record

```sql
-- Check if your executive record has auth_user_id set
SELECT 
  id,
  executive_email,
  executive_full_name,
  auth_user_id,
  reset_token,
  reset_token_expiry
FROM executives
WHERE executive_email = 'your_email@example.com';  -- Replace with your actual email
```

**Expected:** Should show your executive record with a `auth_user_id` value (UUID).

**If auth_user_id is NULL:** The password setup didn't complete properly or migration wasn't applied.

## How to Apply Migration

1. Go to Supabase Dashboard
2. Click "SQL Editor" in left sidebar
3. Create "New query"
4. Copy ALL content from `backend/migrations/add_executive_details.sql`
5. Paste and click "Run"
6. Should see success message for each ALTER TABLE statement

## After Applying Migration

1. Restart the backend server
2. Use the password reset link from your email again to set your password
3. Try logging in at `/login/executive`
