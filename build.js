#!/usr/bin/env node

/**
 * Production build script for Madras Mini Golf
 * Builds both frontend and backend for single deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function log(message) {
  console.log(`[BUILD] ${message}`);
}

function executeCommand(command, description) {
  log(description);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`);
  } catch (error) {
    log(`❌ ${description} failed`);
    process.exit(1);
  }
}

// Clean previous build
log('🧹 Cleaning previous build...');
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
}

// Build frontend with Vite
executeCommand('npx vite build', '🎨 Building frontend');

// Build backend with esbuild
executeCommand(
  'npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --target=node18',
  '⚙️  Building backend'
);

// Copy necessary files for production
log('📦 Copying production files...');

// Copy package.json with only production dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const prodPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  type: packageJson.type,
  scripts: {
    start: 'NODE_ENV=production node index.js'
  },
  dependencies: packageJson.dependencies
};

fs.writeFileSync(
  path.join(__dirname, 'dist', 'package.json'), 
  JSON.stringify(prodPackageJson, null, 2)
);

// Copy additional files needed for deployment
const filesToCopy = [
  'README.md',
  '.env.example',
  'drizzle.config.ts'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(__dirname, 'dist', file));
    log(`📋 Copied ${file}`);
  }
});

// Copy scripts directory
if (fs.existsSync('scripts')) {
  fs.cpSync('scripts', path.join(__dirname, 'dist', 'scripts'), { recursive: true });
  log('📋 Copied scripts directory');
}

// Copy shared directory  
if (fs.existsSync('shared')) {
  fs.cpSync('shared', path.join(__dirname, 'dist', 'shared'), { recursive: true });
  log('📋 Copied shared directory');
}

log('✅ Build completed successfully!');
log('📁 Production files are in the ./dist directory');
log('🚀 To deploy: cd dist && npm install --production && npm start');