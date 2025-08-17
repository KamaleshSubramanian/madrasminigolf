# Local Development Setup Guide

Follow these steps to run the Madras Mini Golf application locally on your machine.

## Application Architecture

This project is designed as a **single Node.js application** where:
- In **development**: Vite dev server handles frontend, Express handles API
- In **production**: Express serves both the built frontend and API endpoints
- Frontend is bundled and served as static files from the backend
- Single port deployment for simplified hosting

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Git

## Quick Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd madras-mini-golf
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb madras_mini_golf

# Create user (optional)
psql -c "CREATE USER mini_golf_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE madras_mini_golf TO mini_golf_user;"
```

#### Option B: Docker PostgreSQL
```bash
docker run --name madras-mini-golf-db \
  -e POSTGRES_DB=madras_mini_golf \
  -e POSTGRES_USER=mini_golf_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Update `.env` file:
```env
DATABASE_URL=postgresql://mini_golf_user:your_password@localhost:5432/madras_mini_golf
PGHOST=localhost
PGPORT=5432
PGUSER=mini_golf_user
PGPASSWORD=your_password
PGDATABASE=madras_mini_golf
SESSION_SECRET=your_super_secret_session_key_here_make_it_long_and_random
NODE_ENV=development
PORT=5000
```

### 4. Database Migration and Seeding

```bash
# Run migrations to create tables
npx drizzle-kit migrate

# Seed initial data (admin user and pricing)
psql $DATABASE_URL -f scripts/seed.sql
```

### 5. Start Development Server

```bash
npm run dev
```

Access the application at: http://localhost:5000

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

**Important**: Change these credentials after first login!

## Available Development Commands

Since package.json cannot be modified in this environment, here are the commands you can run locally:

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Database (install drizzle-kit globally first: npm install -g drizzle-kit)
drizzle-kit generate          # Generate new migrations
drizzle-kit migrate           # Run migrations
drizzle-kit studio            # Open database GUI
drizzle-kit push              # Push schema changes directly

# Manual database operations
psql $DATABASE_URL -f scripts/seed.sql     # Seed database
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"  # Reset database
```

## Project Structure for Local Development

```
madras-mini-golf/
├── .env                      # Your local environment variables
├── .env.example              # Template for environment variables
├── README.md                 # Full project documentation
├── LOCAL_SETUP.md           # This file
├── scripts/
│   ├── setup-local.js       # Local setup helper
│   └── seed.sql             # Database seed data
├── client/                  # Frontend React app
├── server/                  # Backend Express app
├── shared/                  # Shared types and schemas
└── dist/                    # Production build output
```

## Local Development Tips

### Development Architecture
- **Single Port**: Everything runs on http://localhost:5000
- **Frontend**: Vite dev server with HMR for React development
- **Backend**: Express server handling API routes and serving static files
- **Database**: PostgreSQL connection with auto-detection (Neon vs local)

### Database Management
- Use `npx drizzle-kit studio` for web-based database GUI
- Check `server/db.ts` - auto-detects Neon vs local PostgreSQL
- Migrations handled by Drizzle Kit

### API Testing
- All endpoints available at http://localhost:5000/api/*
- Admin routes require session authentication
- Health check: http://localhost:5000/health

### Production Testing
Run production build locally:
```bash
npm run build
NODE_ENV=production npm start
# Or use: node production-test.js
```

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check if PostgreSQL is running
pg_ctl status
```

### Port Conflicts
If port 5000 is in use, change PORT in `.env`:
```env
PORT=3000
```

### Migration Issues
Reset database if migrations fail:
```bash
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
drizzle-kit migrate
psql $DATABASE_URL -f scripts/seed.sql
```

### Build Issues
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

The application builds into a **single deployable Node.js application**.

### Build Process
```bash
npm run build
# Creates ./dist/ containing:
# - index.js (unified Express server)
# - public/ (built React frontend)  
# - package.json (production dependencies only)
# - All necessary runtime files
```

### Deployment Workflow
```bash
# 1. Build the application
npm run build

# 2. Deploy the ./dist/ directory to your server
scp -r dist/ user@server:/path/to/app/

# 3. Install production dependencies
ssh user@server "cd /path/to/app && npm install --production"

# 4. Set environment variables and start
ssh user@server "cd /path/to/app && NODE_ENV=production npm start"
```

### Platform Deployment

#### Heroku (Zero Config)
```bash
git push heroku main  # Automatically builds and deploys
```

#### Railway/Render/DigitalOcean
1. Connect repository
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Set environment variables
5. Deploy automatically

#### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
NODE_ENV=production
SESSION_SECRET=your_secure_random_secret_minimum_32_chars
PORT=5000  # Optional, defaults to 5000
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides including VPS setup, Docker configuration, and platform-specific instructions.

## Support

For issues or questions:
1. Check this guide first
2. Verify database connection and environment variables
3. Check server logs for specific error messages
4. Ensure all dependencies are installed

The application is designed to work seamlessly in local development with the same features available in the cloud environment.