# Authentication Implementation Guide

## Overview

This application now includes **JWT-based authentication** with secure user registration, login, and per-user task isolation. All task endpoints are protected and require valid authentication tokens.

## Security Features Implemented

### ✅ Authentication
- **JWT (JSON Web Tokens)** for stateless authentication
- **Password Hashing** with bcryptjs (10 salt rounds)
- **Token Expiration** (7 days)
- **Secure Token Storage** in browser localStorage

### ✅ Authorization
- **User-scoped Tasks** - Each task belongs to a specific user
- **Authorization Checks** - Users can only access/modify their own tasks
- **Protected Endpoints** - All task operations require valid JWT token

### ✅ API Security
- **CORS Configuration** - Properly configured for cross-origin requests
- **Input Validation** - Email format and password length validation
- **Error Handling** - Secure error messages that don't leak information
- **Parameterized Queries** - Protection against SQL injection

## Architecture

### Backend (Node.js/Express)

#### Authentication Endpoints (No Auth Required)
```
POST /auth/register
POST /auth/login
```

#### Task Endpoints (Auth Required)
```
GET /tasks
POST /tasks
PATCH /tasks/:id
DELETE /tasks/:id
```

#### Middleware
- `authMiddleware` - Validates JWT token and extracts userId
- CORS middleware - Handles cross-origin requests

### Frontend (Next.js)

#### Authentication Context
- `AuthProvider` - Global state management for user and token
- `useAuth()` - Hook to access authentication state and methods

#### Pages
- `/login` - User login form
- `/register` - User registration form
- `/` - Protected task list (redirects to login if not authenticated)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX ON tasks(user_id);
```

## API Documentation

### Registration
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response (201):
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response (200):
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Tasks (Protected)
```bash
GET /tasks
Authorization: Bearer <token>

Response (200):
[
  {
    "id": 1,
    "title": "Buy groceries",
    "completed": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Create Task (Protected)
```bash
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New task"
}

Response (201):
{
  "id": 2,
  "title": "New task",
  "completed": false,
  "created_at": "2024-01-15T10:35:00Z"
}
```

### Update Task (Protected)
```bash
PATCH /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true,
  "title": "Updated task"
}

Response (200):
{
  "id": 1,
  "title": "Updated task",
  "completed": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Delete Task (Protected)
```bash
DELETE /tasks/:id
Authorization: Bearer <token>

Response (204): No Content
```

## Environment Variables

### API (.env or docker-compose)
```
DATABASE_URL=postgresql://user:password@localhost:5432/tasks_db
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Running the Application

### With Docker Compose
```bash
docker-compose up
```

### Manual Setup

1. **Database Migration**
```bash
cd src/db
npm install
npm run migrate
```

2. **API Server**
```bash
cd src/api
npm install
npm start
```

3. **Frontend**
```bash
cd src/web
npm install
npm run dev
```

## Security Best Practices

### ✅ Implemented
- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with 7-day expiration
- User-scoped data isolation
- CORS properly configured
- Input validation on all endpoints
- Parameterized SQL queries
- Secure error messages

### 🔒 Recommended for Production
1. **Use HTTPS** - All communication should be encrypted
2. **Secure JWT Secret** - Use a strong, randomly generated secret
3. **Rate Limiting** - Implement rate limiting on auth endpoints
4. **CORS Whitelist** - Restrict to specific domains instead of `*`
5. **Refresh Tokens** - Implement refresh token rotation
6. **CSRF Protection** - Add CSRF tokens for state-changing operations
7. **Audit Logging** - Log authentication events
8. **2FA** - Consider implementing two-factor authentication
9. **Password Policy** - Enforce stronger password requirements
10. **Token Rotation** - Implement automatic token refresh

## Testing the Authentication Flow

### 1. Register a new user
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Create a task (use token from login response)
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"My first task"}'
```

### 4. Get tasks
```bash
curl -X GET http://localhost:3001/tasks \
  -H "Authorization: Bearer <token>"
```

## Error Handling

### Authentication Errors
- `400 Bad Request` - Missing or invalid email/password
- `401 Unauthorized` - Invalid credentials or expired token
- `409 Conflict` - Email already registered

### Task Errors
- `400 Bad Request` - Invalid task data
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Task doesn't exist or doesn't belong to user
- `500 Internal Server Error` - Server error

## Frontend Usage

### Using the Auth Context
```typescript
import { useAuth } from './auth-context';

function MyComponent() {
  const { user, token, login, register, logout } = useAuth();

  // Check if user is authenticated
  if (!token) {
    return <div>Please login</div>;
  }

  return <div>Welcome, {user?.email}</div>;
}
```

### Protected Routes
The main page (`/`) automatically redirects to `/login` if the user is not authenticated.

## Migration from Unauthenticated to Authenticated

If you had existing tasks without user_id:

1. Create a default user or assign tasks to specific users
2. Run migration to add user_id column
3. Update existing tasks with user_id values
4. Add NOT NULL constraint to user_id

```sql
-- Temporary: allow NULL for migration
ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Assign existing tasks to a user (e.g., user_id = 1)
UPDATE tasks SET user_id = 1 WHERE user_id IS NULL;

-- Make NOT NULL
ALTER TABLE tasks ALTER COLUMN user_id SET NOT NULL;
```

## Troubleshooting

### "Missing authorization token"
- Ensure you're including the `Authorization: Bearer <token>` header
- Check that the token is valid and not expired

### "Invalid or expired token"
- Token may have expired (7 days)
- Re-login to get a new token
- Check that JWT_SECRET matches between requests

### "Email already registered"
- Use a different email address
- Or login with existing credentials

### Tasks not appearing
- Ensure you're logged in as the correct user
- Each user only sees their own tasks
- Check browser console for errors

## Files Changed

### Backend
- `src/api/package.json` - Added JWT and bcryptjs
- `src/api/index.js` - Added auth endpoints and middleware
- `src/api/auth.js` - JWT utilities
- `src/api/middleware.js` - Authentication middleware
- `src/db/migrations/1718500000000_initial-schema.js` - Updated users table
- `src/db/migrations/1718500001000_create-tasks.js` - Added user_id to tasks

### Frontend
- `src/web/app/layout.tsx` - Added AuthProvider
- `src/web/app/page.tsx` - Protected page with logout
- `src/web/app/login/page.tsx` - Login form
- `src/web/app/register/page.tsx` - Registration form
- `src/web/app/auth-context.tsx` - Authentication context
- `src/web/app/actions.ts` - Updated to include auth token
