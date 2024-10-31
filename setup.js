#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';
import enquirer from 'enquirer';
import { fileURLToPath } from 'url';

const program = new Command();

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get the version
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

program
  .version(version)
  .option('-v, --ver', 'output the version number');

program.parse(process.argv);

const options = program.opts();

if (options.ver) {
  console.log(`create-my-app version: ${version}\n`);
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
  console.log(chalk.cyan(`Running: ${command}`));
  execSync(command, { stdio: 'inherit' });
  console.log('\n');
};

// Default ignores inspired by .gitignore and .npmignore
const defaultIgnores = ['.git', 'node_modules', 'dist', '*.log', 'coverage', 'temp'];

const shouldIgnore = (name) => {
  return defaultIgnores.some(ignore => name === ignore || name.startsWith(ignore.replace('*', '')));
};

(async () => {
  const { packageManager } = await enquirer.prompt({
    type: 'select',
    name: 'packageManager',
    message: 'Which package manager do you want to use?',
    choices: ['pnpm', 'npm'],
  });

  try {
    runCommand(`${packageManager} --version`);
  } catch (e) {
    console.log(`${packageManager} not found. Installing ${packageManager}...`);
    runCommand(`npm install -g ${packageManager}`);
  }

  fs.mkdirSync(appName);

  console.log(chalk.cyan('Setting up files for the application...'));

  const copyRecursiveSync = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.name !== scriptName && !shouldIgnore(entry.name)) {
        if (!fs.existsSync(srcPath)) {
          console.log(`File not found: ${srcPath}`);
          continue;
        }
        entry.isDirectory() ? copyRecursiveSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${path.relative(baseAppDir, srcPath)}`);
      }
    }
  };

  copyRecursiveSync(baseAppDir, appName);
  console.log('\n');

  process.chdir(appName);

  // Copy relevant lock file based on package manager
  if (packageManager === 'npm') {
    if (fs.existsSync(path.join(baseAppDir, 'pnpm-lock.yaml'))) fs.unlinkSync(path.join(baseAppDir, 'pnpm-lock.yaml'));
  } else if (packageManager === 'pnpm') {
    if (fs.existsSync(path.join(baseAppDir, 'package-lock.json'))) fs.unlinkSync(path.join(baseAppDir, 'package-lock.json'));
  }

  runCommand(`${packageManager} install`);
  runCommand(`${packageManager} exec webpack --mode="development"`);

  console.log('\n');
  // Create a .gitignore file
  fs.writeFileSync('.gitignore', 'node_modules\n');

  runCommand('git init');
  runCommand('git add .');
  runCommand(`git commit -m "Initial commit from create-my-app for ${appName}"`);

  function printEndingMessage() {
    console.log(chalk.green('\nExpress app setup complete with custom configurations!'));
    console.log(chalk.yellow('Run the following command to start the server:\n'));
    console.log(chalk.blue(`cd ${appName} && ${packageManager} run start:dev\n`));
  }

  printEndingMessage();
})();
