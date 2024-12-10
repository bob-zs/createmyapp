const { setupProject } = require('../../modules/setupProject');
const { runCommand } = require('../../modules/commands');
const { copyRecursiveSync } = require('../../modules/fileOperations');
const kleur = require('kleur');
const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('kleur', () => ({
  cyan: jest.fn((text) => text),
  red: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  blue: jest.fn((text) => text),
}));
jest.mock('../../modules/commands');
jest.mock('../../modules/fileOperations');

describe('setupProject Integration Test', () => {
  let tmpDir;
  let appName;
  const originalDir = process.cwd();

  beforeAll(() => {
    tmpDir = path.join(os.tmpdir(), `integrationTest-${Date.now()}`);
    appName = path.join(tmpDir, 'testApp');

    // Create the tmpDir using the real implementation
    fs.mkdirSync(tmpDir, { recursive: true });
    console.log('Temporary directory created:', tmpDir);

    // Check if the tmpDir exists
    if (!fs.existsSync(tmpDir)) {
      throw new Error(`Temporary directory ${tmpDir} was not created.`);
    }

    // Change the working directory to the temporary directory
    process.chdir(tmpDir);
    console.log('Current working directory:', process.cwd());
  });

  afterAll(() => {
    // Revert to the original working directory
    process.chdir(originalDir);

    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log('Temporary directory removed:', tmpDir);
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs, 'mkdirSync');
    jest.spyOn(fs, 'existsSync');
    jest.spyOn(fs, 'rmSync');
    jest.spyOn(fs, 'unlinkSync');
  });
  afterEach(() => {
    // Restore the original fs methods
    fs.mkdirSync.mockRestore();
    fs.existsSync.mockRestore();
    fs.rmSync.mockRestore();
    fs.unlinkSync.mockRestore();
  });

  it('should check for package manager version and install if not found', async () => {
    runCommand.mockImplementationOnce(() => { throw new Error('not found'); });
    runCommand.mockImplementationOnce(() => {});

    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    expect(runCommand).toHaveBeenCalledWith('npm --version');
    expect(runCommand).toHaveBeenCalledWith('npm install -g npm');
  });
  it('should create the application directory', async () => {
    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    // Check that the directory was created
    expect(fs.mkdirSync).toHaveBeenCalledWith('testApp');
    expect(fs.existsSync(appName)).toBe(true);
  });
  it('should copy files to the application directory', async () => {
    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    expect(copyRecursiveSync).toHaveBeenCalledWith(tmpDir, 'testApp', 'myScript', expect.any(Function));
  });
  it('should handle removing lock files based on package manager', async () => {
    fs.existsSync.mockImplementation((file) => file === 'pnpm-lock.yaml');

    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    expect(fs.unlinkSync).toHaveBeenCalledWith('pnpm-lock.yaml');
    expect(fs.unlinkSync).not.toHaveBeenCalledWith('package-lock.json');

    fs.existsSync.mockImplementation((file) => file === 'package-lock.json');

    await setupProject(tmpDir, 'testApp', 'pnpm', 'myScript');

    expect(fs.unlinkSync).toHaveBeenCalledWith('package-lock.json');
  });
  it('should execute the appropriate commands for project setup', async () => {
    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    expect(runCommand).toHaveBeenCalledWith('npm install');
    expect(runCommand).toHaveBeenCalledWith('npm exec webpack --mode="development"');
    expect(runCommand).toHaveBeenCalledWith('git init');
    expect(runCommand).toHaveBeenCalledWith('git add .');
    expect(runCommand).toHaveBeenCalledWith('git commit -m "Initial commit from create-my-app for testApp"');
  });
});
