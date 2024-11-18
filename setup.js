import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import kleur from 'kleur';
import enquirer from 'enquirer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

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
    if (entry.name !== scriptName && !shouldIgnore(entry.name)) {
      if (!fs.existsSync(srcPath)) {
        console.log(`File not found: ${srcPath}`);
        continue;
      }
      entry.isDirectory() ? copyRecursiveSync(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${path.relative(baseAppDir, srcPath)}`);
    }
  }

  const gitignoreSrcPath = path.join(src, 'gitignore');
  if (fs.existsSync(gitignoreSrcPath)) {
    const gitignoreDestPath = path.join(dest, '.gitignore');
    fs.copyFileSync(gitignoreSrcPath, gitignoreDestPath);
    console.log(`Copied: .gitignore`);
  }
};

export const setupApp = async (appName, packageManager) => {
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
