const fs = require('node:fs');
const { setupProject } = require('../../modules/setupProject');
const { copyRecursiveSync } = require('../../modules/fileOperations');
const { runCommand } = require('../../modules/commands');
const kleur = require('kleur');

// Mock dependencies
jest.mock('node:fs');
jest.mock('../../modules/fileOperations');
jest.mock('../../modules/commands');
jest.mock('kleur', () => ({
  cyan: jest.fn((msg) => msg),
  green: jest.fn((msg) => msg),
  yellow: jest.fn((msg) => msg),
  blue: jest.fn((msg) => msg),
}));

// Mock console.log to suppress logs during test
global.console = {
  log: jest.fn(),
  error: console.error, // Keep error output for debugging
};

// Mock process.chdir to prevent directory change errors
const originalChdir = process.chdir;
process.chdir = jest.fn();

describe('setupProject', () => {
  const baseAppDir = 'baseAppDir';
  const appName = 'appName';
  const packageManager = 'npm';
  const scriptName = 'scriptName';
  const defaultIgnores = ['.git', 'gitignore', 'node_modules', 'dist'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.chdir = originalChdir; // Restore original function
  });

  it('should setup project directory and install dependencies', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.readdirSync.mockReturnValue([{ name: 'file1', isDirectory: () => false }]);
    runCommand.mockImplementation(() => {});

    await setupProject(baseAppDir, appName, packageManager, scriptName);

    expect(fs.mkdirSync).toHaveBeenCalledWith(appName);
    expect(copyRecursiveSync).toHaveBeenCalledWith(baseAppDir, appName, scriptName, defaultIgnores);
    expect(process.chdir).toHaveBeenCalledWith(appName);
    expect(runCommand).toHaveBeenCalledWith(`${packageManager} install`);
    expect(runCommand).toHaveBeenCalledWith(`${packageManager} exec webpack --mode="development"`);
    expect(runCommand).toHaveBeenCalledWith('git init');
    expect(runCommand).toHaveBeenCalledWith('git add .');
    expect(runCommand).toHaveBeenCalledWith(`git commit -m "Initial commit from create-my-app for ${appName}"`);
  });

  it('should install package manager if not found', async () => {
    runCommand.mockImplementationOnce(() => { throw new Error('not found'); });

    await setupProject(baseAppDir, appName, packageManager, scriptName);

    expect(runCommand).toHaveBeenCalledWith(`npm install -g ${packageManager}`);
  });

  it('should remove pnpm-lock.yaml if package manager is npm', async () => {
    fs.existsSync.mockReturnValue(true);

    await setupProject(baseAppDir, appName, 'npm', scriptName);

    expect(fs.unlinkSync).toHaveBeenCalledWith('pnpm-lock.yaml');
  });

  it('should remove package-lock.json if package manager is pnpm', async () => {
    fs.existsSync.mockReturnValue(true);

    await setupProject(baseAppDir, appName, 'pnpm', scriptName);

    expect(fs.unlinkSync).toHaveBeenCalledWith('package-lock.json');
  });
});
