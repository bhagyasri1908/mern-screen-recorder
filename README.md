MERN Screen Recorder 🎥

A full-stack web application to record your screen with microphone audio, built with the MERN stack (SQLite replaces MongoDB for simplicity).

🌟 Live Demo

Frontend: https://mern-screen-recorder-lac.vercel.app/

Backend: https://mern-screen-recorder-backend.onrender.com

✨ Features

Record screen with microphone audio

Live recording timer (max 3 minutes) ⏱️

Video preview after recording 👀

Download recordings as WebM 💾

Upload recordings to server ☁️

View and stream all recordings 📋▶️

🛠 Technology Stack

Frontend: React, Custom CSS

Backend: Node.js, Express.js

Database: SQLite

File Storage: Local filesystem

Web APIs: MediaRecorder, getDisplayMedia, getUserMedia

📦 Installation & Setup
Prerequisites

Node.js (v14+)

npm or yarn

Modern browser (Chrome, Firefox, Edge)

1. Clone the repository
git clone https://github.com/your-username/mern-screen-recorder.git
cd mern-screen-recorder

2. Backend Setup
cd backend
npm install
node server.js


Backend runs at: http://localhost:5000

3. Frontend Setup
cd frontend
npm install
npm start


Frontend runs at: http://localhost:3000

🚀 Usage

Start Recording: Click "Start Recording"

Select Screen: Choose which screen/tab to record

Allow Microphone: Grant permission when prompted

Stop Recording: Click "Stop Recording" (auto-stops at 3 min)

Preview: Watch your recording

Download: Save locally as a WebM file

Upload: Send to the server for storage

View Recordings: Access all uploaded recordings

📡 API Endpoints
Method	Endpoint	Description
GET	/api/recordings	Get all recordings
POST	/api/recordings	Upload a new recording
GET	/api/recordings/:id	Stream a specific recording
🗃 Database Schema

SQLite table recordings:

CREATE TABLE recordings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

🚀 Deployment
Frontend (Vercel)

Push code to GitHub

Connect repository to Vercel

Build command: npm run build

Output directory: build

Environment variable:
REACT_APP_API_URL=https://mern-screen-recorder-backend.onrender.com

Backend (Render)

Push code to GitHub

Create Web Service on Render

Build command: npm install

Start command: node server.js

⚠️ Limitations & Notes

File Storage: Currently local (backend/uploads/) — not suitable for production.

Database: SQLite (backend/database.db) — consider PostgreSQL for production.

Production Considerations:

Use cloud storage (AWS S3, Backblaze B2)

Switch to PostgreSQL

Add authentication/authorization

Configure proper environment variables

🔧 Troubleshooting

Screen recording not working: Use Chrome/Firefox, HTTPS required

Microphone not recording: Check browser permissions

Uploads failing: Ensure backend/uploads exists and is writable

CORS errors: Allow frontend domain in backend CORS

📝 Future Enhancements

User authentication & authorization

Cloud storage integration

PostgreSQL for production

Video editing (trim, crop)

Sharing functionality

Thumbnail generation

Advanced search and filtering

🤝 Contributing

Fork the repo

Create a feature branch: git checkout -b feature/amazing-feature

Commit changes: git commit -m 'Add amazing feature'

Push branch: git push origin feature/amazing-feature

Open a Pull Request

📄 License

This project is licensed under the ISC License. See the LICENSE file for details.

🙏 Acknowledgments

React team for the amazing framework

Express.js for lightweight server

SQLite for simple database

Vercel & Render for free hosting