# TaskFlow

A modern, responsive, and fully functional task management web application built from scratch. TaskFlow provides a complete flow for creating, organizing, and tracking tasks — with a clean and intuitive UI inspired by tools like Notion and Trello.

## Features

* **User Authentication:** Full support for creating new accounts and signing in with existing credentials, complete with form validation, password strength indicator, and secure bcrypt password hashing.
* **JWT Protected Routes:** Token-based authentication using JSON Web Tokens stored in localStorage, with protected routes that automatically redirect unauthenticated users to the login page.
* **Task Management:** Complete CRUD system for tasks with title, description, status, priority, category, due date, and assignee fields.
* **Advanced Filtering & Search:** Filter tasks by status, priority, and category. Sort by due date or priority. Search tasks by title in real time.
* **Bulk Actions:** Select multiple tasks and mark as done, change priority, or delete all at once.
* **Dashboard:** Overview cards showing total, completed, pending, and overdue task counts with weekly activity charts and category breakdown.
* **State Management:** Global authentication and task state managed with Zustand, persisted across page refreshes via localStorage.
* **Polished UI/UX:** Built with Tailwind CSS, featuring subtle animations, floating decorative elements, password strength bars, loading indicators, and Material Icons.

## Tech Stack

**Frontend**
* Framework: __[React 19](https://react.dev/)__ via __[Vite](https://vitejs.dev/)__
* Styling: __[Tailwind CSS](https://tailwindcss.com/)__
* State Management: __[Zustand](https://zustand-demo.pmnd.rs/)__
* Routing: __[React Router DOM](https://reactrouter.com/)__
* HTTP Client: __[Axios](https://axios-http.com/)__
* Charts: __[Recharts](https://recharts.org/)__
* Drag & Drop: __[@hello-pangea/dnd](https://github.com/hello-pangea/dnd)__
* Calendar: __[React Big Calendar](https://jquense.github.io/react-big-calendar/)__
* Icons: __[Material Icons](https://fonts.google.com/icons)__

**Backend**
* Runtime: __[Node.js](https://nodejs.org/)__
* Framework: __[Express.js](https://expressjs.com/)__
* Database: __[MySQL](https://www.mysql.com/)__ via __[XAMPP](https://www.apachefriends.org/)__
* Auth: __[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)__ + __[bcryptjs](https://github.com/dcodeIO/bcrypt.js)__
* File Uploads: __[Multer](https://github.com/expressjs/multer)__

## Getting Started

### Prerequisites

You need the following installed to run this project:
* Node.js
* XAMPP (for MySQL database)
* Git

### Installation

1. Clone the repository and navigate to the project directory:
git clone https://github.com/yourusername/taskflow.git
cd taskflow

2. Install backend dependencies:
cd server
npm install

3. Install frontend dependencies:
cd client
npm install

### Database Setup

1. Open XAMPP and start MySQL
2. Open Navicat or phpMyAdmin and create a database called `taskflow_db`
3. Run the SQL table scripts in this order:
   * `users`
   * `tasks`
   * `subtasks`
   * `comments`
   * `activity_log`
   * `notifications`
   * `team_members`

### Environment Variables

Create a `.env` file inside the `server` folder with the following:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=taskflow_db
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRES_IN=7d

### Running the App

To start the backend server:
cd server
npm run dev

To start the frontend:
cd client
npm run dev

Backend runs on `http://localhost:5000`
Frontend runs on `http://localhost:5173`

## Project Structure

* `client/src/pages/` — One file per screen (Login, Register, Dashboard, MyTasks, etc.)
* `client/src/components/` — Reusable UI components (Sidebar, Navbar, TaskCard, ProtectedRoute)
* `client/src/store/` — Zustand global state (authStore, taskStore)
* `client/src/api/axios.js` — Axios instance with base URL configuration
* `server/src/controllers/` — Business logic for each route
* `server/src/routes/` — API route definitions
* `server/src/middleware/` — JWT authentication middleware
* `server/src/config/db.js` — MySQL database connection
* `server/server.js` — Express server entry point

## Project Status

🚧 Currently in active development