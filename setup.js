#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import kleur from 'kleur';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';

const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

console.log(kleur.cyan(`baseAppDir: ${path.relative(process.cwd(), baseAppDir)}`));  // Print relative path
console.log(kleur.cyan(`appName: ${appName}`));  // Debug log

if (fs.existsSync(appName)) {
  console.error(`Error: Directory "${appName}" already exists. Please choose a different name.`);
  process.exit(1);
}

const runCommand = command => {
  console.log(kleur.cyan(`Running: ${command}`));
  execSync(command, { stdio: 'inherit' });
  console.log('\n');
};

const defaultIgnores = ['.git', 'node_modules', 'dist', '*.log', 'coverage', 'temp', '.npmignore'];

const shouldIgnore = (name) => {
  return defaultIgnores.some(ignore => name.startsWith(ignore.replace('*', '')));
};

const copyRecursiveSync = (src, dest) => {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    console.log(`Processing: ${srcPath}`);  // Debug log
    if (entry.name !== scriptName && !shouldIgnore(entry.name)) {
      entry.isDirectory() ? copyRecursiveSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${path.relative(baseAppDir, srcPath)}`);
    }
  }

  // Explicitly copy and rename gitignore to .gitignore if it exists
  const gitignoreSrcPath = path.join(src, 'gitignore');
  if (fs.existsSync(gitignoreSrcPath)) {
    const gitignoreDestPath = path.join(dest, '.gitignore');
    fs.copyFileSync(gitignoreSrcPath, gitignoreDestPath);
    console.log(`Copied: .gitignore`);
  }
};

const promptUser = async () => {
  return inquirer.prompt({
    type: 'list',
    name: 'packageManager',
    message: 'Which package manager do you want to use?',
    choices: ['pnpm', 'npm'],
  });
};

const setupProject = async (packageManager) => {
  runCommand(`${packageManager} --version`);

  try {
    runCommand(`${packageManager} --version`);
  } catch (e) {
    console.log(`${packageManager} not found. Installing ${packageManager}...`);
    runCommand(`npm install -g ${packageManager}`);
  }

  fs.mkdirSync(appName);
  console.log(kleur.cyan('Setting up files for the application...'));

  copyRecursiveSync(baseAppDir, appName);
  console.log('\n');

  process.chdir(appName);

  if (packageManager === 'npm') {
    if (fs.existsSync('pnpm-lock.yaml')) fs.unlinkSync('pnpm-lock.yaml');
  } else if (packageManager === 'pnpm') {
    if (fs.existsSync('package-lock.json')) fs.unlinkSync('package-lock.json');
  }

  runCommand(`${packageManager} install`);
  runCommand(`${packageManager} exec webpack --mode="development"`);

  console.log('\n');

  runCommand('git init');
  runCommand('git add .');
  runCommand(`git commit -m "Initial commit from create-my-app for ${appName}"`);

  console.log(kleur.green('\nExpress app setup complete with custom configurations!'));
  console.log(kleur.yellow('Run the following command to start the server:\n'));
  console.log(kleur.blue(`cd ${appName} && ${packageManager} run start:dev\n`));
};

async function main() {
  try {
    const { packageManager } = await promptUser();
    await setupProject(packageManager);
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log("Prompt was interrupted. You can restart the setup by running the script again.");
    } else {
      console.error("Unexpected error:", error);
    }
  }

  console.log('End of script');
}

main();
