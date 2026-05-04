# TaskFlow

A modern, responsive, and fully functional task management web application built from scratch. TaskFlow is designed to help individuals and teams organize their work, track productivity, and collaborate seamlessly — with a clean and intuitive UI inspired by tools like Notion and Trello.

## What is TaskFlow?

TaskFlow is a full-stack productivity platform that allows users to:
- Create and manage tasks with priorities, categories, and due dates
- Visualize tasks in a list view or Kanban board
- Track productivity through analytics and charts
- Collaborate with team members by assigning tasks and sharing boards
- Stay on top of deadlines through smart notifications
- View tasks on a calendar to never miss a due date

Whether you are managing personal to-dos, school projects, work assignments, or team sprints — TaskFlow keeps everything organized in one place.

## Features

* **User Authentication:** Full support for creating new accounts and signing in with existing credentials, complete with form validation, password strength indicator, and secure bcrypt password hashing.
* **JWT Protected Routes:** Token-based authentication using JSON Web Tokens stored in localStorage, with protected routes that automatically redirect unauthenticated users to the login page.
* **Task Management:** Complete CRUD system for tasks with title, description, status (Todo / In Progress / Done), priority (Low / Medium / High), category, due date, and assignee fields.
* **Advanced Filtering & Search:** Filter tasks by status, priority, and category. Sort by due date or priority. Search tasks by title in real time.
* **Bulk Actions:** Select multiple tasks and mark as done, change priority, or delete all at once.
* **Kanban Board:** Trello-style drag and drop board with three columns — Todo, In Progress, and Done — for a visual overview of all tasks.
* **Task Details:** Each task has a dedicated details view showing subtasks with a progress bar, a comment thread for discussion, and a full activity log tracking every change made.
* **Dashboard:** Overview cards showing total, completed, pending, and overdue task counts with weekly activity bar chart and tasks by category donut chart.
* **Calendar View:** Monthly calendar showing tasks by due date. Click any day to see tasks due that day with their status.
* **Analytics:** Detailed productivity charts including completion rate over time, tasks by priority, tasks by category, weekly performance score, and insights and trends.
* **Notifications:** In-app notification system for task due today alerts, overdue alerts, comment mentions, task assignments, and team activity updates.
* **User Profile & Settings:** Update name, email, bio, avatar, theme preference (Light / Dark / System), and notification preferences all from one settings page.
* **Team Collaboration:** Invite team members by email, assign tasks to specific members, manage roles (Admin / Member), and track team activity across shared tasks.
* **Activity Log:** Every action on a task is recorded — who created it, who changed the status, who commented, who updated the due date.
* **Responsive Design:** Fully responsive layout that works on both desktop and mobile. Sidebar collapses on mobile with a clean card-based UI throughout.
* **Polished UI/UX:** Built with Tailwind CSS featuring subtle page load animations, floating decorative elements, password strength bars, loading spinners, empty state screens, and Material Icons.

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

* `client/src/pages/` — One file per screen (Login, Register, Dashboard, MyTasks, Board, Calendar, Analytics, Notifications, Profile, Team, Settings)
* `client/src/components/` — Reusable UI components (Sidebar, Navbar, TaskCard, ProtectedRoute)
* `client/src/store/` — Zustand global state (authStore, taskStore)
* `client/src/api/axios.js` — Axios instance with base URL configuration
* `server/src/controllers/` — Business logic for each route
* `server/src/routes/` — API route definitions
* `server/src/middleware/` — JWT authentication middleware
* `server/src/config/db.js` — MySQL database connection
* `server/server.js` — Express server entry point

## Project Status

🚧 Currently in active development — building Phase 4 (Task System Frontend)

## Developer

**Erl** — Built as a learning project to practice full-stack web development using React, Node.js, Express, and MySQL.
