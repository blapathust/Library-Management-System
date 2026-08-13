# Library Management System

A comprehensive, modern Library Management System built with a Spring Boot backend and a React (Vite) frontend, intended for desktop browsers.

## Demo

- **User Demo**: Available at [https://library.c4tu5.com](https://library.c4tu5.com)
  - **Username**: `test_user`
  - **Password**: `password`
 
- **Admin/Staff Demo**: Contact fork owner for access

## Features

- **User Authentication**: Secure login, registration, and role-based access control (Admin, Staff, User) with HTTP-only cookies and basic auth fallback.
- **Book Management**: Admins and staff can add, edit, and delete books, authors, categories, and publishers.
- **Book Borrowing**: Users can request to borrow books, and staff can approve or reject these requests.
- **Subscriptions**: Users can subscribe to their favorite books to get notified about availability or updates.
- **Live Metrics & Analytics**: Administrators have access to real-time visit and login charts powered by Graphite metrics.
- **Staff Profiles**: Dedicated admin profiles to track staff activity logs and update account information.

## Tech Stack

### Frontend
- React 19
- Vite
- TailwindCSS v4
- React Router DOM
- Recharts (for analytics)
- Axios

### Backend
- Java 17 & Spring Boot 3.2+
- Spring Security
- PostgreSQL (Database)
- Hibernate / Spring Data JPA
- Micrometer / Graphite (for metrics)
- Docker & Docker Compose

---

## Local Development Setup

### 1. Backend Setup

The easiest way to run the backend and its dependencies (PostgreSQL, Graphite) is using Docker Compose.

1. Install [Docker Desktop](https://www.docker.com/).
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Copy the `.env.example` file (if present) to `.env` or create a `.env` file with the following variables:
   ```env
   POSTGRES_DB=library_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_db_password

   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password

   CORS_ORIGINS=http://localhost:5173
   DDL_AUTO=update
   SQL_INIT_MODE=never
   SHOW_SQL=false
   COOKIE_SECURE=false
   
   GRAPHITE_DBNAME=graphite
   GRAPHITE_USER=graphite
   GRAPHITE_PASSWORD=your_secure_graphite_password
   ```
4. Start the backend services:
   ```bash
   docker compose up -d --build
   ```
   *The backend API will be available at `http://localhost:8081`.*

### 2. Frontend Setup

1. Install [Node.js](https://nodejs.org/) (v22+ recommended).
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Ensure you have a `.env.local` file configured for local development:
   ```env
   VITE_API_URL=http://localhost:8081
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

---

## Deployment

### Backend
The backend is fully containerized. To deploy to a VPS:
1. Ensure `COOKIE_SECURE=true` is set in your production `.env`.
2. Update `CORS_ORIGINS` to include your production frontend URL.
3. Use a reverse proxy (like NGINX or Traefik) to serve the backend over HTTPS and restrict public access to internal ports (e.g., port `81` for Graphite).
4. Run `docker compose up -d`.

### Frontend
The frontend can be built as a static site and deployed anywhere (Vercel, Netlify, Firebase Hosting, etc.).
1. Ensure `.env` contains your production backend URL:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```
2. Build the app:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder. If using Firebase, run:
   ```bash
   npm run deploy
   ```

---
