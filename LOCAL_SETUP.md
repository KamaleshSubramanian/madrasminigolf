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

### Database Management
- Use `drizzle-kit studio` for a web-based database GUI
- Check `server/db.ts` for database connection configuration
- Migrations are in the `drizzle/` folder

### API Testing
- Backend runs on http://localhost:5000
- API endpoints are prefixed with `/api`
- Admin routes require authentication

### Frontend Development
- React app is served by Vite in development
- Proxy configuration handles API requests
- Hot reload works for all file changes

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

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Set these in your production environment:
- `DATABASE_URL` - Production PostgreSQL URL
- `SESSION_SECRET` - Strong random string
- `NODE_ENV=production`

### Deploy to Various Platforms

#### Heroku
```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SESSION_SECRET=your_secret_here

# Deploy
git push heroku main
```

#### DigitalOcean/Railway/Render
1. Connect your repository
2. Set environment variables in platform settings
3. Platform auto-deploys on push

#### VPS/Custom Server
```bash
# Build and start
npm run build
npm run start

# Or use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name "madras-mini-golf"
```

## Support

For issues or questions:
1. Check this guide first
2. Verify database connection and environment variables
3. Check server logs for specific error messages
4. Ensure all dependencies are installed

The application is designed to work seamlessly in local development with the same features available in the cloud environment.