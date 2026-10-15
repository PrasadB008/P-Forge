# Quick Start: Authentication Implementation

## What Changed?

Your to-do list application now has **complete JWT authentication** with user registration, login, and per-user task isolation.

## Key Features

✅ **User Registration** - Create new accounts with email and password  
✅ **User Login** - Authenticate and receive JWT token  
✅ **Protected Tasks** - Each user only sees their own tasks  
✅ **Secure Passwords** - Bcryptjs hashing with 10 salt rounds  
✅ **Token-based Auth** - JWT tokens with 7-day expiration  
✅ **Data Isolation** - Complete separation between users  

## New Pages

### `/login`
- Login with email and password
- Link to registration page
- Error handling for invalid credentials

### `/register`
- Create new account
- Email and password validation
- Password confirmation
- Link to login page

### `/` (Home)
- Protected page (redirects to login if not authenticated)
- Shows logged-in user's email
- Logout button
- User-specific task list

## API Changes

### New Endpoints
```
POST /auth/register    - Register new user
POST /auth/login       - Login and get token
```

### Updated Endpoints
All task endpoints now:
- Require `Authorization: Bearer <token>` header
- Only return user's own tasks
- Prevent access to other users' tasks

## How to Use

### 1. Start the Application
```bash
docker-compose up
```

### 2. Register a New Account
- Go to http://localhost:3000/register
- Enter email and password
- Click "Register"
- You'll be logged in automatically

### 3. Create Tasks
- Enter task title in the input field
- Click "Add"
- Task appears in your list

### 4. Manage Tasks
- Click checkbox to mark complete/incomplete
- Click trash icon to delete
- Only you can see your tasks

### 5. Logout
- Click "Logout" button in top right
- You'll be redirected to login page

## Testing with curl

### Register
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response includes token:
# {"user":{"id":1,"email":"user@example.com"},"token":"eyJ..."}
```

### Get Tasks (use token from login)
```bash
curl -X GET http://localhost:3001/tasks \
  -H "Authorization: Bearer eyJ..."
```

### Create Task
```bash
curl -X POST http://localhost:3001/tasks \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"title":"My task"}'
```

## Environment Variables

### Required
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/tasks_db
JWT_SECRET=your-secret-key-change-in-production
```

### Optional
```
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Database Migrations

The application automatically runs migrations on startup. If you need to manually migrate:

```bash
cd src/db
npm install
npm run migrate
```

## File Structure

### Backend Changes
```
src/api/
├── index.js              (Updated: auth endpoints + middleware)
├── auth.js               (New: JWT utilities)
├── middleware.js         (New: authentication middleware)
└── package.json          (Updated: added jwt & bcryptjs)

src/db/migrations/
├── 1718500000000_initial-schema.js  (Updated: users table)
└── 1718500001000_create-tasks.js    (Updated: user_id in tasks)
```

### Frontend Changes
```
src/web/app/
├── page.tsx              (Updated: protected page with logout)
├── layout.tsx            (Updated: added AuthProvider)
├── actions.ts            (Updated: added auth token to requests)
├── auth-context.tsx      (New: authentication state management)
├── login/page.tsx        (New: login form)
└── register/page.tsx     (New: registration form)
```

## Security Highlights

🔒 **Password Security**
- Bcryptjs hashing with 10 salt rounds
- Passwords never stored in plain text
- Secure comparison to prevent timing attacks

🔒 **Token Security**
- JWT tokens with 7-day expiration
- Tokens stored in browser localStorage
- Automatic logout on token expiration

🔒 **Data Isolation**
- Each user only sees their own tasks
- Authorization checks on all operations
- 404 returned for unauthorized access

🔒 **API Security**
- CORS properly configured
- Parameterized SQL queries (SQL injection protection)
- Input validation on all endpoints
- Secure error messages

## Common Issues

### "Missing authorization token"
**Solution**: Make sure you're including the `Authorization: Bearer <token>` header

### "Invalid or expired token"
**Solution**: Login again to get a fresh token

### "Email already registered"
**Solution**: Use a different email or login with existing credentials

### Tasks not appearing
**Solution**: Make sure you're logged in as the correct user

### "Cannot GET /tasks" (404)
**Solution**: Make sure the API server is running on port 3001

## Next Steps

1. **Test the authentication flow** - Register, login, create tasks
2. **Review AUTHENTICATION.md** - Detailed API documentation
3. **Review SECURITY.md** - Security best practices
4. **Review ENV_SETUP.md** - Environment configuration

## Production Deployment

Before deploying to production:

1. ✅ Change `JWT_SECRET` to a strong random value
2. ✅ Enable HTTPS/TLS on all endpoints
3. ✅ Configure CORS for your domain
4. ✅ Set up database backups
5. ✅ Enable audit logging
6. ✅ Review SECURITY.md for additional recommendations

## Support

For detailed information:
- **API Documentation**: See `AUTHENTICATION.md`
- **Security Best Practices**: See `SECURITY.md`
- **Environment Setup**: See `ENV_SETUP.md`

## Summary of Changes

### Backend
- ✅ Added JWT authentication
- ✅ Added user registration and login
- ✅ Added authentication middleware
- ✅ Updated all task endpoints to require auth
- ✅ Added user_id to tasks table
- ✅ Added CORS configuration

### Frontend
- ✅ Added authentication context
- ✅ Added login page
- ✅ Added registration page
- ✅ Updated home page to require auth
- ✅ Added logout functionality
- ✅ Updated task actions to include auth token

### Database
- ✅ Created users table with password_hash
- ✅ Added user_id foreign key to tasks
- ✅ Added index on tasks.user_id

All changes are backward compatible with the existing task management functionality!
