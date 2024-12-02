const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

describe('createMyApp', () => {
  const originalDir = process.cwd();
  let tempDir;

  beforeAll(() => {
    // Ensure we are in the original directory
    if (process.cwd() !== originalDir) {
      process.chdir(originalDir);
    }
    // Create a unique temporary directory
    const tempDirPrefix = path.join(os.tmpdir(), 'createMyApp-');
    tempDir = fs.mkdtempSync(tempDirPrefix);
  });

  afterAll(() => {
    // Clean up temp directory
    execSync(`rm -rf ${tempDir}`);
    // Confirm the temporary directory was deleted
    expect(fs.existsSync(tempDir)).toBe(false);
  });

  it('should create a new app', () => {
    try {
      // Change to the temporary directory
      process.chdir(tempDir);

      // Confirm we are in the temporary directory (normalize paths)
      expect(fs.realpathSync(process.cwd())).toBe(fs.realpathSync(tempDir));

      // Run the createMyApp command
      execSync('npx createMyApp new-app', { stdio: 'inherit' });

      // Verify the new app was created
      // const appPath = path.join(tempDir, 'new-app');
      // expect(fs.existsSync(appPath)).toBe(true);
      // Add more assertions as needed

    } finally {
      // Ensure the original directory is restored even if the test fails
      process.chdir(originalDir);

      // Confirm we are back in the original directory (normalize paths)
      expect(fs.realpathSync(process.cwd())).toBe(fs.realpathSync(originalDir));
    }
  });
});
