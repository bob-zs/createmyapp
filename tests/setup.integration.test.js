import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.join(__dirname, '../setup.js');

const runCommand = (command, options = {}) => {
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (err) {
    console.error(`Failed to execute: ${command}`);
  }
};

const testAppDir = path.join(__dirname, 'test-app');

beforeEach(() => {
  if (fs.existsSync(testAppDir)) {
    fs.rmdirSync(testAppDir, { recursive: true });
  }
});

afterEach(() => {
  if (fs.existsSync(testAppDir)) {
    fs.rmdirSync(testAppDir, { recursive: true });
  }
});

test('Setup script works end-to-end', async () => {
  process.argv = ['node', scriptPath, 'test-app'];
  await import(scriptPath);

  expect(fs.existsSync(testAppDir)).toBe(true);
  expect(fs.existsSync(path.join(testAppDir, 'package.json'))).toBe(true);
  expect(fs.existsSync(path.join(testAppDir, 'src/index.js'))).toBe(true);

  runCommand('pnpm install', { cwd: testAppDir });
  expect(fs.existsSync(path.join(testAppDir, 'node_modules'))).toBe(true);

  runCommand('git init', { cwd: testAppDir });
  runCommand('git add .', { cwd: testAppDir });
  runCommand(`git commit -m "Test commit"`, { cwd: testAppDir });
  expect(fs.existsSync(path.join(testAppDir, '.git'))).toBe(true);
  expect(fs.existsSync(path.join(testAppDir, '.gitignore'))).toBe(true);
});
