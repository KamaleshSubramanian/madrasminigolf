# Deployment Guide - Single Node.js Application

This project is configured as a **single deployable Node.js application** where the Express backend serves the built React frontend. This means you have just one application to deploy and manage.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│              Single Node.js App         │
├─────────────────────────────────────────┤
│  Express Server (Port 5000)            │
│  ├── API Routes (/api/*)               │
│  ├── Static Files (Built React App)    │
│  ├── Database Connection               │
│  └── Session Management                │
└─────────────────────────────────────────┘
```

## Building for Production

### Option 1: Using Build Script (Recommended)
```bash
# Run the comprehensive build script
chmod +x scripts/build-production.sh
./scripts/build-production.sh
```

### Option 2: Manual Build
```bash
# Build frontend (creates dist/public/)
npm run build

# Build backend (creates dist/index.js)
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --target=node18

# Copy necessary files
cp -r shared dist/
cp -r scripts dist/
cp drizzle.config.ts dist/
cp .env.example dist/
```

## Deployment Options

### 1. Platform-as-a-Service (Easiest)

#### Heroku
```bash
# Add to your project
echo 'web: npm start' > Procfile

# Deploy
heroku create your-mini-golf-app
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SESSION_SECRET=your_random_secret_here
heroku config:set NODE_ENV=production
git add .
git commit -m "Production build"
git push heroku main

# Run migrations
heroku run npm run db:migrate
```

#### Railway (Recommended - See RAILWAY_DEPLOYMENT.md for detailed guide)
1. Connect your GitHub repository to Railway
2. Add PostgreSQL database service (automatic DATABASE_URL)
3. Set environment variables:
   - `NODE_ENV=production`
   - `SESSION_SECRET=your_secure_random_secret`
4. Railway auto-detects Node.js and runs `npm start`
5. Initialize database: `railway run npm run db:push`
6. Access your live app at the provided Railway domain

**Complete step-by-step guide available in RAILWAY_DEPLOYMENT.md**

#### Render
1. Connect repository and select "Web Service"
2. Build Command: `npm run build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --target=node18`
3. Start Command: `npm start`
4. Add PostgreSQL database
5. Set environment variables
6. Deploy and run migrations

#### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: madras-mini-golf
services:
- name: web
  source_dir: /
  github:
    repo: your-username/madras-mini-golf
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: SESSION_SECRET
    value: your_secret_here
databases:
- engine: PG
  name: mini-golf-db
  version: "14"
```

### 2. Virtual Private Server (VPS)

#### Setup on Ubuntu/Debian
```bash
# On your server
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib nginx

# Create database
sudo -u postgres createdb madras_mini_golf
sudo -u postgres createuser --interactive mini_golf_user

# Clone and build your app
git clone your-repo-url /var/www/madras-mini-golf
cd /var/www/madras-mini-golf

# Build application
npm install
./scripts/build-production.sh

# Move to production directory
sudo mv dist /var/www/madras-mini-golf-prod
cd /var/www/madras-mini-golf-prod

# Install production dependencies
npm install --production

# Create environment file
cp .env.example .env
# Edit .env with your production settings

# Run migrations
npm run db:migrate

# Start with PM2 (process manager)
sudo npm install -g pm2
pm2 start index.js --name "mini-golf"
pm2 startup
pm2 save
```

#### Nginx Configuration (Optional Reverse Proxy)
```nginx
# /etc/nginx/sites-available/madras-mini-golf
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Docker Deployment

#### Using Docker Compose (Recommended)
```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

#### Manual Docker Commands
```bash
# Build image
docker build -t madras-mini-golf .

# Run with PostgreSQL
docker run -d --name mini-golf-db \
  -e POSTGRES_DB=madras_mini_golf \
  -e POSTGRES_USER=mini_golf_user \
  -e POSTGRES_PASSWORD=secure_password \
  postgres:14

# Run app
docker run -d --name mini-golf-app \
  --link mini-golf-db:postgres \
  -e DATABASE_URL=postgresql://mini_golf_user:secure_password@postgres:5432/madras_mini_golf \
  -e NODE_ENV=production \
  -e SESSION_SECRET=your_secret \
  -p 5000:5000 \
  madras-mini-golf
```

## Environment Variables

Required for production:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production

# Security
SESSION_SECRET=your_super_secret_session_key_minimum_32_characters

# Optional
PORT=5000
```

## Post-Deployment Checklist

1. **Database Setup**
   ```bash
   npm run db:migrate  # Run migrations
   ```

2. **Health Check**
   ```bash
   curl https://your-domain.com/health
   # Should return: {"status":"ok","timestamp":"2024-..."}
   ```

3. **Admin Access**
   - URL: `https://your-domain.com/admin`
   - Default credentials: admin / admin123
   - **Change immediately after first login!**

4. **Test Core Features**
   - Player registration
   - Game creation and scoring
   - Admin dashboard and analytics
   - Pricing management

## Monitoring and Maintenance

### Logs
```bash
# PM2 logs
pm2 logs mini-golf

# Docker logs
docker logs mini-golf-app

# Heroku logs
heroku logs --tail
```

### Database Backup
```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup-20241201.sql
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./scripts/build-production.sh
pm2 restart mini-golf

# Run new migrations if any
npm run db:migrate
```

## Performance Optimization

### Production Optimizations Included
- ✅ Static asset caching (1 year for JS/CSS/images)
- ✅ Gzipped responses
- ✅ Bundle splitting for faster loading
- ✅ Database connection pooling
- ✅ Session storage in PostgreSQL

### Additional Recommendations
- Use a CDN for global distribution
- Set up SSL/TLS certificates (Let's Encrypt)
- Configure database connection limits
- Monitor memory usage and scale as needed
- Set up automated backups
- Configure log rotation

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
./scripts/build-production.sh
```

**Database Connection Error**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check environment variables
echo $DATABASE_URL
```

**Static Files Not Serving**
- Ensure `dist/public/` directory exists after build
- Check file permissions
- Verify NODE_ENV=production is set

**Session Issues**
- Verify SESSION_SECRET is set and consistent
- Check PostgreSQL session table exists
- Ensure database user has proper permissions

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy, or cloud LB)
- Enable sticky sessions or use Redis for session storage
- Scale database with read replicas

### Vertical Scaling
- Monitor CPU/memory usage
- Increase server resources as needed
- Optimize database queries

This single-application deployment approach simplifies hosting, reduces infrastructure complexity, and provides a cohesive user experience with both the player interface and admin dashboard served from the same domain.