'use strict';

const execa = require('execa');
const { mkdirp, writeFileSync, existsSync, readdirSync } = require('fs-extra');
const { join, resolve } = require('path');
const { rmSync, mkdtempSync, readdirSync, statSync } = require('fs');
const os = require('os');

jest.setTimeout(1000 * 60 * (process.env.RUNNER_OS === 'macOS' ? 10 : 5));

const registryUrl = 'http://localhost:4873';
const packageName = '@bob-zs/createmyapp';
const packageVersion = '0.3.0'; // Specify the correct version

const projectName = 'my-app';
const tempDir = mkdtempSync(join(os.tmpdir(), 'test-install-'));
const genPath = join(tempDir, projectName);

beforeAll(async () => {
  // Check for uncommitted changes
  try {
    const statusOutput = await execa.command('git status --porcelain');
    if (statusOutput.stdout) {
      console.error('Uncommitted changes detected. Please commit your changes before running the test.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to check for uncommitted changes:', error);
    process.exit(1);
  }

  // Stop any existing Verdaccio containers
  try {
    await execa.command('docker ps -q --filter "ancestor=verdaccio/verdaccio" | xargs -r docker stop');
    await execa.command('docker ps -a -q --filter "ancestor=verdaccio/verdaccio" | xargs -r docker rm');
  } catch (error) {
    console.log('No existing Verdaccio containers found.');
  }

  // Start Verdaccio in Docker
  const verdaccioContainer = await execa.command('docker run -d -p 4873:4873 verdaccio/verdaccio');
  console.log(`Verdaccio started with container ID: ${verdaccioContainer.stdout.trim()}`);
  console.log('Waiting for Verdaccio to be ready...');
  await new Promise(resolve => setTimeout(resolve, 20000)); // Increased wait time

  // Authenticate with Verdaccio using locally installed npm-cli-login
  console.log('Authenticating with Verdaccio...');
  await execa.command(`pnpm exec npm-cli-login -u test -p test_password -e test@domain.com -r ${registryUrl}`);

  // Publish the package
  console.log('Publishing package...');
  try {
    const result = await execa.command(`yes | pnpm publish --registry ${registryUrl} --no-git-checks --loglevel silly`);
    console.log(result.stdout);
  } catch (error) {
    console.error('Failed to publish package:', error);
    throw error;
  }
});

afterAll(async () => {
  // Stop and remove Verdaccio container
  try {
    const verdaccioContainer = await execa.command('docker ps -q --filter "ancestor=verdaccio/verdaccio"');
    if (verdaccioContainer.stdout) {
      await execa.command(`docker stop ${verdaccioContainer.stdout.trim()}`);
      await execa.command(`docker rm ${verdaccioContainer.stdout.trim()}`);
    }
  } catch (error) {
    console.error('Failed to stop or remove Verdaccio container:', error);
  }
});

const run = async (args, options) => {
  process.stdout.write(
    `::group::Test "${
      expect.getState().currentTestName
    }" - "pnpm dlx ${args.join(' ')}" output:\n`
  );
  const result = execa('pnpm', ['dlx'].concat(args), options);
  result.stdout.on('data', chunk =>
    process.stdout.write(chunk.toString('utf8'))
  );
  result.stderr.on('data', chunk =>
    process.stderr.write(chunk.toString('utf8'))
  );
  const childProcessResult = await result;
  process.stdout.write(`ExitCode: ${childProcessResult.exitCode}\n`);
  process.stdout.write('::endgroup::\n');
  const files = existsSync(genPath)
    ? readdirSync(genPath).filter(f => existsSync(join(genPath, f)))
    : null;
  return {
    ...childProcessResult,
    files,
  };
};

const expectAllFiles = (arr1, arr2) =>
  expect([...arr1].sort()).toEqual([...arr2].sort());

describe('create-my-app', () => {
  it('should create a project with pnpm dlx', async () => {
    console.log(`Using temporary directory for test: ${tempDir}`);
    process.chdir(tempDir);
    console.log(`Current working directory: ${process.cwd()}`);

    const { exitCode, stdout, stderr, files } = await run([`${packageName}@${packageVersion}`, projectName], {
      cwd: tempDir,
    });

    if (exitCode !== 0) {
      console.error('pnpm dlx command failed:', stdout, stderr);
    }

    expect(exitCode).toBe(0);

    console.log(`Checking if directory exists: ${genPath}`);
    console.log(`Contents of tempDir: ${readdirSync(tempDir)}`);

    const tempDirContents = readdirSync(tempDir);
    tempDirContents.forEach(file => {
      const fullPath = join(tempDir, file);
      const stats = statSync(fullPath);
      console.log(`${file}: ${stats.isDirectory() ? 'directory' : 'file'}, ${stats.size} bytes`);
    });

    expect(fs.existsSync(genPath)).toBe(true);
    expect(readdirSync(genPath).length).toBeGreaterThan(0);

    const genPathContents = existsSync(genPath) ? readdirSync(genPath) : [];
    console.log(`Contents of genPath: ${genPathContents.join(', ')}`);
  });
});
