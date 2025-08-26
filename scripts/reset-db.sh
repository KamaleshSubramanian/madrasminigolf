#!/bin/bash

# Reset database script for local development
# Use with caution - this will delete all data!

set -e

echo "⚠️  WARNING: This will delete ALL data in your database!"
echo "This should only be used in development."
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found!"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env file"
    exit 1
fi

echo "🗑️  Dropping and recreating database schema..."
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "🗃️  Running migrations..."
npx drizzle-kit migrate

echo "🌱 Seeding database..."
psql "$DATABASE_URL" -f scripts/seed.sql

echo "✅ Database reset complete!"
echo ""
echo "Default admin credentials:"
echo "- Username: admin"
echo "- Password: admin123"