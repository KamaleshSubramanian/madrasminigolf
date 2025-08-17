#!/bin/bash

# Production Build Script for Madras Mini Golf
# Creates a single deployable package with frontend bundled into backend

set -e

echo "🏌️ Building Madras Mini Golf for Production"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build frontend with Vite
echo "🎨 Building frontend..."
npm run build

# Build backend
echo "⚙️ Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --target=node18

# Copy server files that aren't bundled
echo "📋 Copying additional server files..."
cp -r server/routes.ts dist/ 2>/dev/null || true
cp -r server/storage.ts dist/ 2>/dev/null || true
cp -r server/db.ts dist/ 2>/dev/null || true
cp -r server/vite.ts dist/ 2>/dev/null || true

# Create production package.json
echo "📝 Creating production package.json..."
cat > dist/package.json << 'EOF'
{
  "name": "madras-mini-golf",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "NODE_ENV=production node index.js",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "bcryptjs": "^3.0.2",
    "connect-pg-simple": "^10.0.0",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "nanoid": "^5.0.9",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "pg": "^8.13.1",
    "ws": "^8.18.0",
    "zod": "^3.23.8"
  }
}
EOF

# Copy necessary files for deployment
echo "📋 Copying deployment files..."
cp .env.example dist/ 2>/dev/null || true
cp README.md dist/ 2>/dev/null || true
cp LOCAL_SETUP.md dist/ 2>/dev/null || true
cp drizzle.config.ts dist/ 2>/dev/null || true

# Copy shared directory (contains schemas)
if [ -d "shared" ]; then
    cp -r shared dist/
fi

# Copy scripts for database operations
if [ -d "scripts" ]; then
    cp -r scripts dist/
fi

# Copy drizzle migrations if they exist
if [ -d "drizzle" ]; then
    cp -r drizzle dist/
fi

echo ""
echo "✅ Production build completed successfully!"
echo ""
echo "📁 Build output location: ./dist/"
echo "📦 Frontend assets: ./dist/public/"
echo "⚙️ Backend entry point: ./dist/index.js"
echo ""
echo "🚀 Deployment instructions:"
echo "1. Copy the ./dist/ directory to your server"
echo "2. cd dist && npm install --production"
echo "3. Set up environment variables (.env file)"
echo "4. Run database migrations: npm run db:migrate"
echo "5. Start the application: npm start"
echo ""
echo "🌐 The application will serve both API and frontend on a single port"