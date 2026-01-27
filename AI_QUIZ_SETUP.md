# AI Quiz Generation Feature - Setup Guide

## Overview
This feature allows faculty members to generate AI-powered quizzes using GROK API and automatically check student submissions.

## Features
✅ AI-generated MCQ and descriptive questions using GROK API
✅ Auto-checking for multiple choice questions
✅ Quiz sharing with deadline management
✅ Student quiz submission interface
✅ Detailed results with explanations
✅ Faculty view of student submissions

## Setup Instructions

### 1. Get GROK API Key
1. Go to [x.ai](https://x.ai/) or [console.x.ai](https://console.x.ai/)
2. Sign up or login
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### 2. Configure Backend
1. Open `backend/.env` file
2. Add your GROK API key:
   ```
   GROK_API_KEY=your_actual_grok_api_key_here
   ```

### 3. Install Dependencies
```bash
cd backend
npm install node-fetch
```

### 4. Run Database Migration
1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to SQL Editor
4. Run the migration file: `backend/migrations/create_quizzes_table.sql`
5. This creates:
   - `quizzes` table
   - `quiz_submissions` table
   - Required indexes and triggers

### 5. Restart Backend Server
```bash
cd backend
npm start
```

### 6. Test the Feature
1. Login as Faculty
2. Navigate to AI Quiz Generator (AiQuizAssignmentForm.jsx)
3. Select a course
4. Enter a topic (e.g., "Data Structures", "Machine Learning Basics")
5. Choose quiz type (MCQ or Descriptive)
6. Click "Generate Smart Quiz"
7. Review generated questions
8. Click "Share" to make it available to students

## API Endpoints

### Faculty Endpoints
- `POST /quizzes/generate` - Generate quiz with AI
- `GET /quizzes/faculty` - Get all faculty quizzes
- `POST /quizzes/:quizId/share` - Share quiz with students
- `GET /quizzes/:quizId/submissions` - View student submissions
- `DELETE /quizzes/:quizId` - Delete quiz

### Student Endpoints
- `POST /quizzes/:quizId/submit` - Submit quiz answers
- `GET /quizzes/student/available` - Get available quizzes (to be implemented)

## Database Schema

### quizzes table
- `id` - Primary key
- `course_id` - Reference to courses
- `faculty_id` - Reference to faculties
- `title` - Quiz title
- `topic` - Quiz topic
- `type` - mcq or descriptive
- `questions` - JSONB array of questions
- `is_shared` - Whether quiz is shared with students
- `deadline` - Submission deadline
- `created_at` - Creation timestamp

### quiz_submissions table
- `id` - Primary key
- `quiz_id` - Reference to quizzes
- `student_id` - Reference to students
- `answers` - JSONB array of student answers
- `score` - Auto-calculated score (for MCQ)
- `total_questions` - Total questions in quiz
- `results` - JSONB with detailed results
- `submitted_at` - Submission timestamp

## GROK API Integration

The system uses GROK's chat completion API with:
- Model: `grok-beta`
- Temperature: 0.7 (for creative but consistent output)
- JSON response format
- Structured prompts for educational content

## Auto-Checking Logic

### MCQ Quizzes
- Automatically graded on submission
- Score calculated immediately
- Correct answers and explanations shown to students
- Results stored in `quiz_submissions` table

### Descriptive Quizzes
- Stores student answers
- Provides key points for manual grading by faculty
- Faculty can review and grade later

## Frontend Components

### Faculty Components
- `AiQuizAssignmentForm.jsx` - Main quiz generation interface
- Quiz generation form with course/topic selection
- Generated questions preview
- Share functionality with deadline

### Student Components
- `StudentQuizzes.jsx` - Quiz taking interface
- Quiz list with available quizzes
- Quiz attempt interface
- Results display with explanations

## Troubleshooting

### "GROK API key not configured"
- Ensure `GROK_API_KEY` is set in `backend/.env`
- Restart the backend server after adding the key

### "Invalid JSON response from GROK API"
- GROK API might return markdown-formatted JSON
- The code automatically strips code blocks
- Check backend console logs for raw response

### "Failed to save quiz"
- Ensure migration has been run in Supabase
- Check that `quizzes` table exists
- Verify faculty_id exists in faculties table

### "Table does not exist"
- Run the migration: `backend/migrations/create_quizzes_table.sql`
- Refresh Supabase schema

## Future Enhancements
- [ ] File upload for context (PDF, PPT parsing)
- [ ] Bulk quiz generation
- [ ] Quiz analytics and statistics
- [ ] Adaptive difficulty based on student performance
- [ ] Timer for timed quizzes
- [ ] Question bank management
- [ ] Export quiz as PDF

## Cost Considerations
- GROK API charges per API call
- Typical quiz generation: 1 API call
- Monitor usage in GROK dashboard
- Consider implementing caching for similar topics
