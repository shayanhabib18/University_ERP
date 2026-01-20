## Faculty Account Setup - Complete Flow

### Architecture
✅ **Passwords stored securely** in Supabase Auth  
✅ **Faculties table** stores `auth_user_id` link to auth user  
✅ **Password setup tokens** stored temporarily for email verification

### Database Setup Required

Run this SQL in Supabase SQL Editor:

```sql
-- Add auth_user_id column to link Supabase Auth users
ALTER TABLE faculties
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add reset token columns for password setup flow
ALTER TABLE faculties
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_faculties_auth_user_id ON faculties(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_faculties_reset_token ON faculties(reset_token);
```

### Complete Faculty Onboarding Flow

#### 1. Admin Adds Faculty
- Go to Faculty Management
- Fill form (name, email, designation, department, etc.)
- Click "Register Faculty"

#### 2. Backend Creates Auth Account
- Creates Supabase Auth user with temp password
- Stores `auth_user_id` in faculties table
- Generates 24-hour password setup token
- Stores token in `reset_token` column

#### 3. Faculty Receives Email
- **Subject:** "Account Approved - Set Your Password"
- **Contains:** Email, Designation, Department
- **Action:** "Set Password & Login" button
- **Link:** `reset-password?token=XXX&type=faculty`

#### 4. Faculty Sets Password
- Clicks link → Password setup page opens
- Enters new password (min 6 chars)
- Backend validates token
- Supabase Auth password updated
- Token cleared from database

#### 5. Faculty Logs In
- Navigate to Faculty Login
- Email + new password
- Access Faculty Portal

### Key Points
✅ No temporary passwords sent  
✅ Link expires in 24 hours  
✅ Passwords securely hashed by Supabase  
✅ Email shows full account details  
✅ Professional account approval flow
