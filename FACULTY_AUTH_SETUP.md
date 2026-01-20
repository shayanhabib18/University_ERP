# Faculty Authentication Setup Guide

## Current Issue
The faculty registration flow is complete but emails aren't being sent because SMTP is not configured. The code will work, but email delivery needs one of these solutions:

## Solution 1: Use Mailtrap (Recommended for Testing)
Mailtrap is a free service that simulates email delivery - perfect for development.

1. Go to [mailtrap.io](https://mailtrap.io)
2. Sign up for free
3. Create a new inbox
4. Click "Integrations" → "Node.js/Nodemailer"
5. Copy the SMTP credentials
6. Create/update `.env` file in `backend/` folder with:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mailtrap SMTP
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
FROM_EMAIL=noreply@university.local

PORT=5000
```

7. Restart the backend: `npm run dev`

## Solution 2: Use Gmail
1. Enable 2-Factor Authentication on your Google Account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer" (or your device)
4. Google generates a 16-character password
5. Create `.env` file with:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=16-character-app-password
FROM_EMAIL=your-email@gmail.com
```

6. Restart backend

## Testing the Flow

### Step 1: Add Faculty
POST `http://localhost:5000/faculty`
```json
{
  "name": "Dr. Test Faculty",
  "email": "test@mailtrap.io",
  "designation": "Professor",
  "department_id": 1,
  "phone": "1234567890"
}
```

### Step 2: Check Email
- **With Mailtrap:** Go to your Mailtrap inbox - email appears there immediately
- **With Gmail:** Check your email

### Step 3: Click Reset Link
The email contains: `http://localhost:5173/reset-password?token=XXX&type=faculty`

Click the button or copy the link

### Step 4: Set Password
1. Frontend loads ResetPassword page
2. Console should show: `✅ Faculty reset detected with token`
3. Enter new password (min 6 characters)
4. Should redirect to `/login/faculty`

### Step 5: Faculty Login
- Email: `test@mailtrap.io`
- Password: Your new password
- Should show Faculty Dashboard

## Debugging

### Check Backend Logs
When you add faculty, look for:
- ✅ If SMTP works: `Faculty credentials email sent to X`
- ⚠️ If SMTP missing: `⚠️ SMTP NOT CONFIGURED - EMAILS WILL NOT BE SENT`

### Check Frontend Console
When clicking reset link:
- ✅ Correct: `✅ Faculty reset detected with token`
- ❌ Wrong: `✅ Student reset detected (Supabase format)`

### Token not in URL?
If you don't see query parameters in the URL:
1. Check SMTP is configured
2. Verify the email link matches: `?token=...&type=faculty`
3. Check browser console for URL parsing

## File Structure
```
backend/
├── .env                          # ← Create this file with SMTP config
├── .env.example                  # Reference template
├── controllers/
│   └── FacultyController.js       # Faculty registration & password reset
├── utils/
│   └── mailer.js                 # Email sending
└── routes/
    └── facultyRoutes.js          # Faculty endpoints

frontend/
└── src/pages/login/
    └── ResetPassword.jsx          # Password reset form
```

## API Endpoints

### Register Faculty
```
POST /faculty
Body: { name, email, designation, department_id, phone }
Returns: Faculty record with auth setup
```

### Set Password
```
POST /faculty/set-password
Body: { token, password }
Returns: { message: "Password set successfully", success: true }
```

### Faculty Login
```
POST /faculty/login
Body: { email, password }
Returns: { success: true, user, token }
```

## How It Works (Technical Flow)

1. **Admin adds faculty** → POST `/faculty`
2. **Backend:**
   - Creates Supabase Auth user
   - Generates 24-hour reset token
   - Stores token in DB
   - Sends custom email with link: `?token=...&type=faculty`
3. **Faculty receives email** (if SMTP configured)
4. **Faculty clicks link** → Frontend extracts `token` and `type=faculty`
5. **Faculty sets password** → POST `/faculty/set-password`
6. **Backend:**
   - Validates token & expiry
   - Updates Supabase Auth password
   - Clears token from DB
7. **Faculty logs in** → Token stored, redirects to Faculty Dashboard

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "SMTP NOT CONFIGURED" message | Configure `.env` with SMTP credentials |
| Email not received | Check Mailtrap/Gmail SMTP configuration |
| "Invalid token" error | Token expired (24hr limit) or used twice |
| Redirects to student portal | Check browser console for token extraction |
| Password won't update | Ensure password is 6+ characters |

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | https://xxxxx.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for backend operations | eyJhbGc... |
| `SMTP_HOST` | Email server hostname | smtp.gmail.com |
| `SMTP_PORT` | Email server port | 587 |
| `SMTP_USER` | Email account username | your-email@gmail.com |
| `SMTP_PASS` | Email account password/app-password | 16-char-password |
| `FROM_EMAIL` | Sender email address | noreply@university.local |
| `PORT` | Backend server port | 5000 |

## Next Steps

1. ✅ Choose SMTP provider (Mailtrap recommended)
2. ✅ Configure `.env` file in backend folder
3. ✅ Restart backend: `npm run dev`
4. ✅ Test by adding a faculty member
5. ✅ Verify email received
6. ✅ Click reset link
7. ✅ Set password and login
