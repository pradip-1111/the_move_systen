#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Vercel build process...');

// Change to frontend directory
process.chdir(path.join(__dirname, 'frontend'));

try {
  console.log('Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Building React app...');
  execSync('npx react-scripts build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}