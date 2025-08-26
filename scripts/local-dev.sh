#!/bin/bash

# Madras Mini Golf - Local Development Setup Script
# This script helps set up the project for local development

set -e

echo "🏌️ Madras Mini Golf - Local Development Setup"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Recommended: 18+"
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL CLI not found. Installing PostgreSQL is recommended."
    echo "   Alternative: Use Docker with 'docker-compose up -d postgres'"
else
    echo "✅ PostgreSQL CLI available"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo "📝 Please update .env with your database credentials before continuing."
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if database connection works
echo "🔍 Testing database connection..."
if [ -f .env ]; then
    source .env
    if [ -n "$DATABASE_URL" ]; then
        if psql "$DATABASE_URL" -c "SELECT version();" &> /dev/null; then
            echo "✅ Database connection successful"
            
            # Run migrations
            echo "🗃️  Running database migrations..."
            npx drizzle-kit migrate
            
            # Seed database
            echo "🌱 Seeding database with initial data..."
            psql "$DATABASE_URL" -f scripts/seed.sql
            
            echo "✅ Database setup complete!"
        else
            echo "❌ Database connection failed. Please check your DATABASE_URL in .env"
            echo "   To create a local database: createdb madras_mini_golf"
        fi
    else
        echo "⚠️  DATABASE_URL not set in .env file"
    fi
fi

echo ""
echo "🚀 Setup complete! Next steps:"
echo "1. Update .env with your database credentials (if not done)"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Access the app at http://localhost:5000"
echo ""
echo "Default admin credentials:"
echo "- Username: admin"
echo "- Password: admin123"
echo ""
echo "For Docker setup: docker-compose up -d"
echo "For more details, see LOCAL_SETUP.md"