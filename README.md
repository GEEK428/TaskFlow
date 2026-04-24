<div align="center">

# 📋 TaskFlow

### Task Management made Simpler

[![Stars](https://img.shields.io/github/stars/GEEK428/TaskFlow?style=social)](https://github.com/GEEK428/TaskFlow/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Organize • Prioritize • Achieve**

[🚀 Demo](https://task-flow-jade-delta.vercel.app/)

</div>

---

## ✨ Features

🤖 **AI Helper** - Ask any Task related question  
📊 **Smart Dashboard** - Real-time progress tracking and analytics  
🔔 **Smart Reminders** - Notifications for upcoming tasks  
🎯 **Priority Management** - Organize by urgency and importance  
🔐 **Secure Auth** - JWT & Google OAuth integration  
⚡ **Real-time Updates** - Instant synchronization across devices  
🎨 **Modern UI** - Clean, intuitive interface with smooth animations

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

### AI & APIs
![Google Gemini](https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 🚀 Quick Start

### Prerequisites

```bash
node -v  # v18.0.0 or higher
npm -v   # v8.0.0 or higher
```

### Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/GEEK428/TaskFlow.git
cd TaskFlow
```

2️⃣ **Backend Setup**
```bash
cd Backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev
```

3️⃣ **Frontend Setup**
```bash
cd ../Frontend
npm install
npm run dev
```

🎉 Open `[https://task-flow-jade-delta.vercel.app/]` in your browser!

---


## 🏗️ Project Structure

```
TaskFlow/
├── Backend/
│   ├── config/          # Database & configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
└── Frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── assets/      # Images & media
    │   ├── components/  # React components
    │   ├── pages/       # Route pages
    │   └── App.jsx      # Main app
    └── vite.config.js
```

---


## 👨‍💻 Author

**GEEK428**

If you like this project, please ⭐ star the repository!

---

<div align="center">

Made with ❤️ and ☕


</div>
