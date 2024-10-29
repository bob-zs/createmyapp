#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseAppDir = __dirname; // Use the current directory
const scriptName = path.basename(process.argv[1]); // Get the script filename

const runCommand = command => {
  execSync(command, { stdio: 'inherit' });
};

// Check if pnpm is installed and install a specific version if not
try {
  execSync('pnpm --version', { stdio: 'ignore' });
} catch (e) {
  console.log('pnpm not found. Installing pnpm...');
  runCommand('npm install -g pnpm@9.12.3');
}

// Create the project directory
const appName = process.argv[2] || 'my-express-app';
if (fs.existsSync(appName)) {
  console.error(`Error: Directory "${appName}" already exists. Please choose a different name.`);
  process.exit(1);
}

fs.mkdirSync(appName);

const copyRecursiveSync = (src, dest) => {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.name !== scriptName) {
      entry.isDirectory() ? copyRecursiveSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
    }
  }
};

copyRecursiveSync(baseAppDir, appName);

process.chdir(appName);

runCommand('pnpm install');

console.log('Express app setup complete with custom configurations!');
