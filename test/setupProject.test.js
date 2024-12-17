const kleur = require('kleur');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { setupProject } = require('../modules/setupProject');

describe('setupProject Integration Test', () => {
  let tmpDir;
  let appName;
  const originalDir = process.cwd();
  const baseAppDir = path.join(__dirname, 'base-app');

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
    // process.chdir(originalDir);

    // if (fs.existsSync(tmpDir)) {
    //   fs.rmSync(tmpDir, { recursive: true, force: true });
    //   console.log('Temporary directory removed:', tmpDir);
    // }
  });

  it('creates a directory with the app files', () => {
    const scriptName = '/Users/bobsaludo/Documents/Anti.Planner.Folders/Education/code/package.publishing/packtest/createMyApp/main.js';
    // setupProject(baseAppDir, appName, 'pnpm', 'scriptName');
  });


});
