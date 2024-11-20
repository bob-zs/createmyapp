const { execSync } = require('child_process');
const path = require('path');

describe('E2E Testing', () => {
  const registryUrl = 'http://localhost:4873';
  const packageName = 'your-package-name';
  let verdaccioContainerId;

  beforeAll(() => {
    // Start Verdaccio in Docker
    verdaccioContainerId = execSync(`docker run -d -p 4873:4873 verdaccio/verdaccio`).toString().trim();
    // Wait for Verdaccio to be ready
    execSync('sleep 10');
    // Authenticate with Verdaccio
    execSync(`npm adduser --registry ${registryUrl} --always-auth`, {
      input: 'test\ntest_password\ntest@domain.com\n',
    });
    // Publish the package
    execSync(`npm publish --registry ${registryUrl}`);
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
    execSync(`npm install ${packageName} --registry ${registryUrl}`);
    // Run the package command
    execSync(`npx ${packageName}`);
  });
});
