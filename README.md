A web-based study planner that maps university syllabi to individual student progress. Built for my final year project.

>>Tech Stack
Frontend: HTML5, CSS3, Vanilla JavaScript
Backend: Supabase (PostgreSQL)
Auth: Supabase GoTrue (JWT-based)
Hosting: Vercel (planned)

>>Core Features
User Auth: Secure signup/login via Supabase.
Dynamic Roadmaps: Fetches subjects/topics based on user course and semester.
Persistent Progress: Saves checked topics to a cloud database (Postgres).
Privacy: Uses Row Level Security (RLS) to isolate user data.

>>Database Structure
The project uses a relational schema:
profiles: User metadata linked via UUID.
master_syllabus: Centralized list of subjects and topics.
user_progress: Junction table tracking completion status.
