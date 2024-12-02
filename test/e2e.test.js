const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const createMyApp = path.join(__dirname, '..', 'main.js');

describe('createMyApp', () => {
  const originalDir = process.cwd();
  let tempDir;

  beforeAll(() => {
    if (process.cwd() !== originalDir) {
      process.chdir(originalDir);
    }
    const tempDirPrefix = path.join(os.tmpdir(), 'createMyApp-');
    tempDir = fs.mkdtempSync(tempDirPrefix);
  });

  afterAll(() => {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true
    });
    expect(fs.existsSync(tempDir)).toBe(false);
  });

  it('should create a new app', () => {
    try {
      process.chdir(tempDir);
      const currentNormalizedPath = fs.realpathSync(process.cwd());
      const tempNormalizedPath = fs.realpathSync(tempDir);
      expect(currentNormalizedPath).toBe(tempNormalizedPath);

      // Set the PACKAGE_MANAGER environment variable for testing
      execSync(`node ${createMyApp} new-app`, {
        stdio: 'inherit',
        env: { ...process.env, PACKAGE_MANAGER: 'npm' }
      });

      const appPath = path.join(tempDir, 'new-app');
      expect(fs.existsSync(appPath)).toBe(true);

    } finally {
      process.chdir(originalDir);
      expect(fs.realpathSync(process.cwd())).toBe(fs.realpathSync(originalDir));
    }
  });
});
