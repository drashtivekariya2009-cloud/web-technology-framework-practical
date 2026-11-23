StudyMate - Student Planner

Original StudyMate wording and purple theme retained. Frontend HTML, CSS and JavaScript are together in public/index.html. Backend is separated into routes, models, and middleware.

Requirements: Node.js

1. Extract the ZIP.
2. Copy .env.example and rename the copy to .env. Set SESSION_SECRET in .env to a long, random value before starting the server.
3. Open terminal in this folder and run:
   npm install
   npm start
4. Open http://localhost:3000

Create an account using a password with 8-12 characters, uppercase, lowercase, and a special character.
When MongoDB is available, accounts and tasks are stored persistently in MongoDB. Without MongoDB, the app runs in local demo mode and keeps accounts and tasks in memory until the server stops.
Passwords are hashed with bcrypt; login uses a server session.
