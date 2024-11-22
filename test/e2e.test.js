const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

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
    console.log(`Verdaccio started with container ID: ${verdaccioContainerId}`);
    console.log('Waiting for Verdaccio to be ready...');
    execSync('sleep 10');
    
    // Authenticate with Verdaccio using locally installed npm-cli-login
    console.log('Authenticating with Verdaccio...');
    execSync(`pnpm exec npm-cli-login -u test -p test_password -e test@domain.com -r ${registryUrl}`);
    
    // Publish the package
    console.log('Publishing package...');
    try {
      execSync(`pnpm publish --registry ${registryUrl} --loglevel silly`);
    } catch (error) {
      console.error('Failed to publish package:', error);
      throw error;
    }
  });

  afterAll(() => {
    // Stop and remove Verdaccio container
    execSync(`docker stop ${verdaccioContainerId}`);
    execSync(`docker rm ${verdaccioContainerId}`);
  });

  test('should install and run package', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-install-'));
    console.log(`Using temporary directory for test: ${tempDir}`);

    // Switch to the temporary directory
    process.chdir(tempDir);
    console.log(`Current working directory: ${process.cwd()}`);
    
    // Install the package
    execSync(`pnpm add ${packageName} --registry ${registryUrl}`);
    
    // Run the package command
    try {
      execSync(`pnpx create-my-app my-app`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to run create-my-app:', error);
    }
    
    // Verify the directory and files are created
    const appDir = path.resolve(tempDir, 'my-app');
    console.log(`Checking if directory exists: ${appDir}`);
    console.log(`Contents of tempDir: ${fs.readdirSync(tempDir)}`);
    expect(fs.existsSync(appDir)).toBe(true);
    expect(fs.readdirSync(appDir).length).toBeGreaterThan(0);
  });
});
