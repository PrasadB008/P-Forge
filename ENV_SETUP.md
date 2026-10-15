# Environment Variables Setup

## API Server (.env or docker-compose.yml)

```bash
# Database connection string
DATABASE_URL=postgresql://postgres:postgres@db:5432/tasks_db

# JWT secret for token signing (change this in production!)
JWT_SECRET=your-super-secret-key-change-in-production-12345

# Server port
PORT=3001
```

## Frontend (.env.local)

```bash
# API URL (adjust based on your deployment)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Docker Compose Setup

The `docker-compose.yml` file already includes:
- PostgreSQL database
- API server with environment variables
- Frontend web server

Just ensure the `DATABASE_URL` and `JWT_SECRET` are set in the compose file.

## Production Recommendations

### JWT_SECRET
Generate a strong random secret:
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database URL
Use a secure, managed database service:
- AWS RDS
- Google Cloud SQL
- Azure Database
- Heroku Postgres
- DigitalOcean Managed Databases

### API URL
Update `NEXT_PUBLIC_API_URL` to your production API domain:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Verification

After setting up environment variables:

1. **Test API health**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

2. **Test registration**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Test protected endpoint without token**
```bash
curl http://localhost:3001/tasks
# Should return: {"error":"Missing authorization token"}
```
