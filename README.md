# Backend Developer Intern Assignment

This project is a scalable REST API with Authentication & Role-Based Access Control (RBAC) and a basic frontend UI, built with Next.js and MongoDB.

## Features

- **Authentication**: User registration and login with JWT.
- **RBAC**: 'User' and 'Admin' roles.
- **Notes Management**: CRUD operations for notes.
- **User Management**: Admin can view and delete users, and switch roles.
- **Security**: Password hashing (bcrypt), JWT (httpOnly cookies), Input validation (Zod).

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT, Bcryptjs
- **Validation**: Zod
- **Styling**: CSS Modules / Global CSS

## Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env.local` file in the root directory with the following variables:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000).

## API Documentation

### Auth
- `POST /api/auth/register`: Register a new user. Body: `{ username, password, role? }`
- `POST /api/auth/login`: Login. Body: `{ username, password }`
- `POST /api/auth/logout`: Logout.
- `GET /api/auth/me`: Get current user info.

### Notes
- `GET /api/notes`: Get all notes (Admin) or own notes (User).
- `POST /api/notes`: Create a note. Body: `{ title, content }`
- `PUT /api/notes/:id`: Update a note. Body: `{ title, content }`
- `DELETE /api/notes/:id`: Delete a note.

### Users (Admin Only)
- `GET /api/users`: Get all users.
- `DELETE /api/users/:id`: Delete a user.
- `PATCH /api/users/:id`: Update user role. Body: `{ role }`

## Scalability Note

To scale this application:
1.  **Database**: Use MongoDB Atlas for auto-scaling. Implement indexing on frequently queried fields (e.g., `userId`, `username`).
2.  **Caching**: Implement Redis to cache frequent GET requests (e.g., fetching notes) to reduce DB load.
3.  **Microservices**: Extract the Authentication logic into a separate service if the user base grows significantly.
4.  **Load Balancing**: Deploy multiple instances of the Next.js app behind a load balancer (e.g., Nginx or Vercel's edge network).
5.  **Stateless Auth**: JWT is stateless, allowing easy horizontal scaling of the application servers.
