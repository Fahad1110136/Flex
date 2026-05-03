<div align="center">

# 🎓 Flex

### *A Modern Student Course Registration Portal*

> **Flex** is a full-stack student course registration portal that streamlines the academic enrollment process. Built with React and Express, it provides students and administrators with a clean, efficient, and secure platform to manage courses and registrations.

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **User Registration** | Students can sign up, create a profile, and manage their personal information |
| 🔑 **Login / Logout** | Secure authentication using **JWT (JSON Web Tokens)** with session management |
| 📧 **Password Reset** | Students can reset forgotten passwords via their registered email address |
| 📚 **Course Registration** | Browse available courses, view details, and register with a single click |
| 🛠️ **Admin Dashboard** | Admins can add/remove course offerings and monitor registered students |

---

## 🧰 Tech Stack

### 🖥️ Frontend
- **React.js** — Component-based UI with a responsive design
- **CSS / SCSS** — Custom styling for a clean user experience

### ⚙️ Backend
- **Node.js** — JavaScript runtime environment
- **Express.js** — Lightweight and fast REST API framework

### 🗄️ Database
- **Microsoft SQL Server** — Reliable relational database for storing all student and course data
- **Windows Authentication** — Secure local DB access without hardcoded credentials

### 🔒 Authentication
- **JWT (JSON Web Tokens)** — Stateless, secure token-based authentication

---

## 📁 Project Structure

```
Flex/
├── backend/                  # Express server & API
│   ├── config/
│   │   └── db.js             # SQL Server connection setup
│   ├── models/               # Database models
│   ├── routes/               # API route handlers
│   ├── middleware/           # Auth & error handling middleware
│   ├── .env                  # Environment variables (not committed)
│   └── server.js             # Entry point
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page-level views
│   │   └── App.js            # Root component
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 📦 Installation

**1. Clone the repository**
```bash
git clone https://github.com/Fahad1110136/Flex.git
cd Flex
cd EnrollX-main
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Install frontend dependencies**
```bash
cd frontend
npm install
```

---

### 🗄️ Database Setup

1. Open **SQL Server Management Studio (SSMS)**
2. Connect using **Windows Authentication**
3. Create a database named `Flex`
4. Run any provided SQL schema scripts to set up the tables

---

### 🔧 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
DB_HOST=localhost (for Windows Athentication only)
DB_NAME=your_database_name
DB_USER=your_login_user
DB_PASSWORD=your_login_user_password
JWT_SECRET=your_super_secret_key (run this: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" to get yours)
```

---

### ▶️ Running the Application

**Start the backend server:**
```bash
cd backend
npm start
```
> Backend runs on `http://localhost:5000`

**Start the frontend app:**
```bash
cd frontend
npm run dev
```
> Frontend runs on `http://localhost:5173` 
---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new student |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `POST` | `/api/auth/reset-password` | Initiate password reset |
| `GET` | `/api/courses` | Fetch all available courses |
| `POST` | `/api/courses/register` | Register for a course |
| `GET` | `/api/admin/students` | Admin: view all registered students |

---

## 🛡️ Security

- Passwords are **hashed** before storage — never stored in plain text
- All protected routes require a valid **JWT token** in the request header
- SQL Server connection uses **Windows Authentication** — no credentials in code
- Environment variables keep sensitive config **out of source control**

---

## 🐛 Common Issues & Fixes

| Error | Fix |
|---|---|
| `cross-env is not recognized` | Run `npm install cross-env --save-dev` |
| `config.server must be a string` | Check your `.env` file is in the `backend/` folder and has `DB_HOST=localhost` |
| `Missing script: start` | Use `npm run dev` for the frontend instead of `npm start` |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by the Flex Team

</div>