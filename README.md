# Madras Mini Golf Management System

A comprehensive mini golf management application featuring dual flows for players and administrators with robust data visualization and user experience features.

## Features

### Player Experience
- QR code accessible landing page
- Player registration system
- 7-hole interactive gameplay with score tracking
- Real-time results and leaderboards
- Responsive mobile-first design

### Admin Dashboard
- Secure admin authentication
- Sales analytics with multiple time periods
- Pricing management (weekday/weekend rates)
- Game history and player statistics
- Revenue tracking and reporting

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt
- **Build Tool**: Vite
- **Deployment**: Single Node.js application serving frontend and backend

## Architecture

This application is built as a **single deployable Node.js application**:
- The Express backend serves the built React frontend as static files
- All API endpoints are served from the same domain/port
- Production builds create a unified application for easy deployment
- No separate frontend server required

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Quick Start

### Development Setup
```bash
git clone <your-repo-url>
cd madras-mini-golf
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### Production Deployment (Railway - Recommended)
```bash
# See RAILWAY_DEPLOYMENT.md for complete step-by-step guide
# 1. Push to GitHub
# 2. Connect repository to Railway
# 3. Add PostgreSQL database
# 4. Set environment variables
# 5. Deploy automatically
```

### Production Build (Local)
```bash
npm run build                    # Build frontend and backend
# Single deployable application created in ./dist/
```

## Deployment Options

### Railway (Recommended)
Railway provides the easiest deployment with integrated PostgreSQL:

1. **Quick Deploy:** See `RAILWAY_DEPLOYMENT.md` for complete step-by-step guide
2. **Zero Configuration:** Automatic Node.js detection and database integration
3. **Built-in PostgreSQL:** Database service with automatic connection
4. **Free Tier Available:** Perfect for testing and small-scale deployment

### Other Platforms
- **Heroku:** See `DEPLOYMENT.md` for Heroku-specific instructions
- **Render:** Full deployment guide in `DEPLOYMENT.md`
- **DigitalOcean App Platform:** Supported with minor configuration
- **Vercel/Netlify:** Not recommended (require separate database hosting)

## Local Development Setup

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd madras-mini-golf
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL, then:
createdb madras_mini_golf
createuser -P mini_golf_user  # Set password when prompted
```

#### Option B: Docker (Recommended)
```bash
docker-compose up -d postgres
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Database Setup and Start
```bash
npx drizzle-kit migrate         # Create database tables
npm run dev                     # Start development server
```

**Development URLs:**
- Application: http://localhost:5000 (unified frontend + API)
- Admin: http://localhost:5000/admin (admin/admin123)

## Production Deployment

### Build Process
The application builds into a **single Node.js application**:
```bash
npm run build
# Creates ./dist/ with:
# - index.js (Express server)
# - public/ (built React frontend)
# - All necessary files for deployment
```

### Deployment Options

#### Platform as a Service (Easiest)
```bash
# Heroku
heroku create your-app-name
heroku addons:create heroku-postgresql
git push heroku main

# Railway/Render/DigitalOcean
# Connect repo, set environment variables, deploy
```

#### VPS/Docker
```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Manual VPS
scp -r dist/ user@server:/path/to/app
ssh user@server "cd /path/to/app && npm install --production && npm start"
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides.

## Available Scripts

### Development
- `npm run dev` - Start development server (Vite + Express)
- `npm run build` - Build unified production application
- `npm run start` - Start production server from build

### Database
- `npx drizzle-kit migrate` - Run database migrations
- `npx drizzle-kit studio` - Open database GUI
- `psql $DATABASE_URL -f scripts/seed.sql` - Seed initial data

### Deployment
- `./scripts/build-production.sh` - Complete production build
- `node production-test.js` - Test production build locally

## Project Structure

```
├── client/                 # React frontend (dev only)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   ├── index.ts          # Server entry point
│   └── vite.ts           # Frontend/backend integration
├── shared/               # Shared types and schemas
├── scripts/              # Build and deployment scripts
├── dist/                 # Production build output
│   ├── index.js          # Built server (backend + static serving)
│   ├── public/           # Built frontend assets
│   └── package.json      # Production dependencies
└── DEPLOYMENT.md         # Comprehensive deployment guide
```

### Development vs Production

**Development Mode (`npm run dev`):**
- Vite dev server serves React frontend with HMR
- Express server handles API routes
- Two processes, single port (5000)

**Production Mode (`npm run build` + `npm start`):**
- Single Express server serves everything
- Built React app served as static files
- One process, one port, easy deployment

## Admin Access

Default admin credentials (change after first login):
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Public Routes
- `GET /` - Landing page
- `POST /api/players` - Register new player
- `POST /api/games` - Create new game
- `GET /api/pricing` - Get current pricing

### Admin Routes (Authentication Required)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `GET /api/admin/sales/*` - Sales analytics
- `POST /api/admin/pricing` - Update pricing

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SESSION_SECRET` | Session encryption key | Required |
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |

## Production Deployment

### Database Setup
1. Create production PostgreSQL database
2. Run migrations: `npm run db:migrate`
3. Seed initial data: `npm run db:seed`

### Build and Deploy
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection credentials in `.env`
- Ensure database exists and user has permissions

### Port Conflicts
- Change `PORT` in `.env` if 5000 is in use
- Update any hardcoded references

### Migration Errors
- Check database permissions
- Verify schema changes don't conflict
- Reset database if needed: `DROP DATABASE madras_mini_golf; CREATE DATABASE madras_mini_golf;`

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

This project is licensed under the MIT License.