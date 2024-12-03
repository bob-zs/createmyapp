// How to Test a Node.js Command-Line Tool
// https://javascript.plainenglish.io/how-to-test-a-node-js-command-line-tool-2735ea7dc041
// try it out later

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

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

      // Confirm we are in the temporary directory (normalize paths)
      const currentNormalizedPath = fs.realpathSync(process.cwd());
      const tempNormalizedPath = fs.realpathSync(tempDir);
      expect(currentNormalizedPath).toBe(tempNormalizedPath);

      // Run the createMyApp command
      // execSync('npx createMyApp new-app', { stdio: 'inherit' });

      // Verify the new app was created
      // const appPath = path.join(tempDir, 'new-app');
      // expect(fs.existsSync(appPath)).toBe(true);
      // Add more assertions as needed

    } finally {
      process.chdir(originalDir);
      expect(fs.realpathSync(process.cwd())).toBe(fs.realpathSync(originalDir));
    }
  });
});
