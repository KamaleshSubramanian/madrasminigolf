#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏌️ Setting up Madras Mini Golf for local development...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created! Please update it with your database credentials.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion < 18) {
  console.log('⚠️  Warning: Node.js 18+ is recommended. Current version:', nodeVersion);
} else {
  console.log('✅ Node.js version:', nodeVersion);
}

// Check if PostgreSQL is available (basic check)
try {
  execSync('psql --version', { stdio: 'ignore' });
  console.log('✅ PostgreSQL CLI available');
} catch (error) {
  console.log('⚠️  PostgreSQL CLI not found. Make sure PostgreSQL is installed.');
}

console.log('\n🚀 Setup complete! Next steps:');
console.log('1. Update .env file with your database credentials');
console.log('2. Create PostgreSQL database: createdb madras_mini_golf');
console.log('3. Run migrations: npm run db:migrate');
console.log('4. Start development server: npm run dev');
console.log('\nFor detailed instructions, see README.md');