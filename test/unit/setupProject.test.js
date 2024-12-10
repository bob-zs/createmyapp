const { setupProject } = require('../../modules/setupProject');
const { runCommand } = require('../../modules/commands');
const { copyRecursiveSync } = require('../../modules/fileOperations');
const kleur = require('kleur');
const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('fs');
jest.mock('kleur', () => ({
  cyan: jest.fn((text) => text),
  red: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  blue: jest.fn((text) => text),
}));
jest.mock('../../modules/commands');
jest.mock('../../modules/fileOperations');

describe('setupProject', () => {
  let tmpDir;
  let appName;

  beforeEach(() => {
    jest.clearAllMocks();
    tmpDir = path.join(os.tmpdir(), `testApp-${Date.now()}`);
    appName = path.join(tmpDir, 'testApp');
    fs.mkdirSync(appName);

    console.log({ appName });
    // Mock behavior for fs.existsSync to correctly handle the temporary directory and testApp
    fs.existsSync.mockImplementation((dir) => {
      return dir === tmpDir || dir === appName; // Only the temporary directory exists by default
    });
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should simply run', () => {
    expect(5).toEqual(5);
  });

  it('should check for package manager version and install if not found', async () => {
    runCommand.mockImplementationOnce(() => { throw new Error('not found'); });
    runCommand.mockImplementationOnce(() => {});

    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    expect(runCommand).toHaveBeenCalledWith('npm --version');
    expect(runCommand).toHaveBeenCalledWith('npm install -g npm');
  });

  fit('should create the application directory', async () => {
    // Set fs.existsSync to return false for appName
    fs.existsSync.mockImplementation((dir) => dir === tmpDir);

    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    expect(fs.mkdirSync).toHaveBeenCalledWith(appName);
  });
  

  it('should copy files to the application directory', async () => {
    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    expect(copyRecursiveSync).toHaveBeenCalledWith('/base/app/dir', path.join(tmpDir, 'testApp'), 'myScript', expect.any(Function));
  });

  it('should handle removing lock files based on package manager', async () => {
    fs.existsSync.mockReturnValueOnce(true); // Mock pnpm-lock.yaml existence
    fs.unlinkSync.mockImplementation(() => {}); // Mock unlink operation

    await setupProject(tmpDir, 'testApp', 'npm', 'myScript');

    expect(fs.unlinkSync).toHaveBeenCalledWith(path.join(tmpDir, 'testApp/pnpm-lock.yaml'));
    expect(fs.unlinkSync).not.toHaveBeenCalledWith(path.join(tmpDir, 'testApp/package-lock.json'));

    fs.existsSync.mockReturnValueOnce(true); // Mock package-lock.json existence

    await setupProject(tmpDir, 'testApp', 'pnpm', 'myScript');

    expect(fs.unlinkSync).toHaveBeenCalledWith(path.join(tmpDir, 'testApp/package-lock.json'));
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
