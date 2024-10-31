#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

// Read package.json to get the version
import packageJson from './package.json' assert { type: 'json' };
const version = packageJson.version;

// Check for --version flag
if (process.argv.includes('--version')) {
  console.log(`create-my-app version: ${version}`);
  process.exit(0);
}

const baseAppDir = path.join(__dirname, 'base-app');
const scriptName = path.basename(process.argv[1]);
const appName = process.argv[2] || 'my-app';

if (fs.existsSync(appName)) {
  console.error(`Error: Directory "${appName}" already exists. Please choose a different name.`);
  process.exit(1);
}

const runCommand = command => {
  execSync(command, { stdio: 'inherit' });
};

try {
  execSync('pnpm --version', { stdio: 'ignore' });
} catch (e) {
  console.log('pnpm not found. Installing pnpm...');
  runCommand('npm install -g pnpm@9.12.3');
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
    if (entry.name !== scriptName && entry.name !== '.git') {
      if (!fs.existsSync(srcPath)) {
        console.log(`File not found: ${srcPath}`);
        continue;
      }
      entry.isDirectory() ? copyRecursiveSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${entry.name}`);
    }
  }
};

copyRecursiveSync(baseAppDir, appName);

process.chdir(appName);
runCommand('pnpm install');
runCommand('pnpm exec webpack --mode="development"');

// Create a .gitignore file
fs.writeFileSync('.gitignore', 'node_modules\n');

runCommand('git init');
runCommand('git add .');
runCommand('git commit -m "Initial commit from create-my-app"');

function printEndingMessage() {
  console.log('\n\n');
  console.log(chalk.green('Express app setup complete with custom configurations!'));
  console.log(chalk.yellow('Run the following command to start the server:\n'));
  console.log(chalk.blue(`cd ${appName} && pnpm start\n`));
}

printEndingMessage();
