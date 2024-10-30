#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

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
  console.log(`Copying from ${src} to ${dest}`);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    console.log(`Copying ${srcPath} to ${destPath}`);
    if (entry.name !== scriptName) {
      if (!fs.existsSync(srcPath)) {
        console.log(`File not found: ${srcPath}`);
        continue;
      }
      entry.isDirectory() ? copyRecursiveSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
    }
  }
};

copyRecursiveSync(baseAppDir, appName);

process.chdir(appName);

runCommand('pnpm install');
runCommand('pnpm exec webpack --mode="development"');
runCommand('cd ..');

function printEndingMessage() {
  console.log('\n\n');
  console.log(chalk.green('Express app setup complete with custom configurations!'));
  console.log(chalk.yellow('Run the following command to start the server:\n'));
  console.log(chalk.blue(`cd ${appName} && pnpm start\n`));
}

printEndingMessage();
