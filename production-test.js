#!/usr/bin/env node

/**
 * Test script to verify production build works correctly
 * This simulates how the app will run in production
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Simulate production environment
process.env.NODE_ENV = 'production';

console.log('🧪 Testing Production Build');
console.log('===========================');

// Check if dist/public exists
const distPath = path.resolve(__dirname, 'dist', 'public');
const fs = await import('fs');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist/public directory not found!');
  console.log('   Please run: npm run build');
  process.exit(1);
}

console.log('✅ Frontend build found at:', distPath);

// List files in dist/public
const files = fs.readdirSync(distPath);
console.log('📁 Built files:', files.join(', '));

// Serve static files (same as production)
app.use(express.static(distPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for React routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Production test server running!');
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('✅ This demonstrates how your app will work in production:');
  console.log('   - Single Node.js server');
  console.log('   - Frontend served as static files');
  console.log('   - API endpoints on same domain');
  console.log('');
  console.log('Press Ctrl+C to stop');
});