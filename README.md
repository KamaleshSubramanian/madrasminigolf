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
- **Deployment**: Replit-ready

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd madras-mini-golf
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE madras_mini_golf;
CREATE USER mini_golf_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE madras_mini_golf TO mini_golf_user;
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

### 4. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql://mini_golf_user:your_password@localhost:5432/madras_mini_golf
PGHOST=localhost
PGPORT=5432
PGUSER=mini_golf_user
PGPASSWORD=your_password
PGDATABASE=madras_mini_golf
SESSION_SECRET=your_super_secret_session_key_here_make_it_long_and_random
```

### 5. Database Migration

Run the database migrations to set up tables:
```bash
npm run db:migrate
```

### 6. Seed Initial Data (Optional)

Create initial admin user and pricing:
```bash
npm run db:seed
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed initial data

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
└── migrations/           # Database migrations
```

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