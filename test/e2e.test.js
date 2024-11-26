const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

describe('E2E Testing', () => {
  const registryUrl = 'http://localhost:4873';
  const packageName = '@bob-zs/createmyapp';
  const packageVersion = '0.3.0'; // Specify the correct version
  let verdaccioContainerId;

  beforeAll(() => {
    // Check for uncommitted changes
    try {
      const statusOutput = execSync('git status --porcelain').toString();
      if (statusOutput) {
        console.error('Uncommitted changes detected. Please commit your changes before running the test.');
        process.exit(1);
      }
    } catch (error) {
      console.error('Failed to check for uncommitted changes:', error);
      process.exit(1);
    }

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
    execSync('sleep 20'); // Increased wait time

    // Authenticate with Verdaccio using locally installed npm-cli-login
    console.log('Authenticating with Verdaccio...');
    execSync(`pnpm exec npm-cli-login -u test -p test_password -e test@domain.com -r ${registryUrl}`);

    // Publish the package
    console.log('Publishing package...');
    try {
      const result = execSync(`yes | pnpm publish --registry ${registryUrl} --no-git-checks --loglevel silly`, { stdio: 'pipe' });
      console.log(result.toString());
    } catch (error) {
      console.error('Failed to publish package:', error);
      if (error.stdout) {
        console.error('stdout:', error.stdout.toString());
      }
      if (error.stderr) {
        console.error('stderr:', error.stderr.toString());
      }
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
    
    // Install the specific version of the package
    try {
      execSync(`pnpm add -g ${packageName}@${packageVersion} --registry ${registryUrl}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to install package:', error);
      throw error;
    }

    // Run the package command
    try {
      execSync(`pnpx create-my-app my-app`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to run create-my-app:', error);
      throw error;
    }

    // Verify the directory and files are created
    const appDir = path.resolve(tempDir, 'my-app');
    console.log(`Checking if directory exists: ${appDir}`);
    console.log(`Contents of tempDir: ${fs.readdirSync(tempDir)}`);
    expect(fs.existsSync(appDir)).toBe(true);
    expect(fs.readdirSync(appDir).length).toBeGreaterThan(0);
  });
});
