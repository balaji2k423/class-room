# Classroom Project

## 📌 Overview
Classroom is a web-based platform designed to enhance online learning experiences by providing seamless communication between students and teachers. The project offers features like class management, assignments, announcements, and student-teacher interaction.

## 🚀 Features
- 🔹 **User Authentication** (Login/Signup for students and teachers)
- 🔹 **Classroom Management** (Create and join classrooms)
- 🔹 **Assignment Submission** (Upload and review assignments)
- 🔹 **Announcements** (Teachers can post important updates)
- 🔹 **Interactive Discussions** (Students and teachers can communicate)
- 🔹 **Real-time Notifications**

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite)
- **Backend**: Node.js (Express.js)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS

## 🎯 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/balaji2k423/Classroom.git
cd Classroom
```

### 2️⃣ Backend Setup
```sh
cd backend
npm install  # Install dependencies
cp .env.example .env  # Configure environment variables
npm start  # Start backend server
```

### 3️⃣ Frontend Setup
```sh
cd ../frontend
npm install  # Install dependencies
cp .env.example .env  # Configure environment variables
npm run dev  # Start frontend server
```

## 📤 Deployment
- Frontend: Deployed using Vercel/Netlify
- Backend: Hosted on Render/Heroku
- Database: MongoDB Atlas

## 🛡️ Environment Variables (.env)
```env
# Backend .env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

# Frontend .env
VITE_BACKEND_URL=http://localhost:5000
```



## 📜 License
This project is open-source and available under the **MIT License**.
