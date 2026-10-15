<!-- mode-switch-cobalt-orchid-731 -->
# Contributing to P-Forge

Thank you for your interest in contributing to P-Forge! This guide will help you set up the project locally and get started.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for running the database)
- PostgreSQL (if running without Docker)

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/PrasadB008/P-Forge.git
cd P-Forge
```

### 2. Start the database

Using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL database on port 5432.

### 3. Set up the database

Navigate to the database directory and run migrations:

```bash
cd src/db
npm install
npm run migrate
cd ../..
```

### 4. Start the API server

```bash
cd src/api
npm install
npm run dev
```

The API will be available at `http://localhost:3001`.

### 5. Start the web application

In a new terminal:

```bash
cd src/web
npm install
npm run dev
```

The web app will be available at `http://localhost:3000`.

## Project Structure

- `src/api/` - Express.js API server
- `src/db/` - Database migrations and configuration
- `src/web/` - Next.js web application
- `src/infrastructure/` - Infrastructure configuration

## Available Scripts

### API

- `npm run start` - Start the API server
- `npm run dev` - Start the API server in watch mode
- `npm test` - Run tests

### Web

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

### Database

- `npm run migrate` - Run pending migrations
- `npm run migrate:down` - Rollback the last migration

## Making Changes

1. Create a new branch for your feature or fix
2. Make your changes
3. Test your changes locally
4. Commit with clear, descriptive messages
5. Push your branch and create a pull request

## Testing

Before submitting a pull request, please ensure:

- All tests pass
- No lint errors exist
- Your changes follow the existing code style

## Questions?

If you have any questions, please open an issue on GitHub or reach out to the maintainers.
