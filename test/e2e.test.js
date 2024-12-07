const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const packageJsonPath = path.join(__dirname, 'package.json');

describe('E2E Testing', () => {
  const registryUrl = 'http://localhost:4873';
  const packageName = '@bob-zs/createmyapp';
  let verdaccioContainerId;

  beforeAll(() => {
    // Stop any existing Verdaccio containers
    try {
      execSync('docker ps -q --filter "ancestor=verdaccio/verdaccio" | xargs -r docker stop');
      execSync('docker ps -a -q --filter "ancestor=verdaccio/verdaccio" | xargs -r docker rm');
    } catch (error) {
      console.log('No existing Verdaccio containers found.');
    }

    // Start Verdaccio in Docker
    verdaccioContainerId = execSync(`docker run -d -p 4873:4873 verdaccio/verdaccio`).toString().trim();
    // Wait for Verdaccio to be ready
    execSync('sleep 10');
    
    // Authenticate with Verdaccio using locally installed npm-cli-login
    execSync(`pnpm exec npm-cli-login -u test -p test_password -e test@domain.com -r ${registryUrl}`);
    
    // Publish the package
    execSync(`pnpm publish --registry ${registryUrl}`);
  });

  afterAll(() => {
    // Stop and remove Verdaccio container
    execSync(`docker stop ${verdaccioContainerId}`);
    execSync(`docker rm ${verdaccioContainerId}`);
  });

  test('should install and run package', () => {
    const testDir = path.resolve(__dirname, 'test-install');
    // Create a test directory
    execSync(`mkdir -p ${testDir}`);
    process.chdir(testDir);
    // Install the package
    execSync(`pnpm add ${packageName} --registry ${registryUrl}`);
    // Run the package command
    execSync(`pnpx create-my-app my-app`);
    // Verify the directory and files are created
    const appDir = path.resolve(testDir, 'my-app');
    expect(fs.existsSync(appDir)).toBe(true);
    expect(fs.readdirSync(appDir).length).toBeGreaterThan(0);
  });
});
