'use strict';

const { execa } = require('execa');
const { mkdirSync, writeFileSync, existsSync, readdirSync, rmSync } = require('fs');
const { join } = require('path');
const { describe, expect, it, beforeAll, afterAll, jest } = require('@jest/globals');

const createmyappCLI = require('../createMyApp');

// Set longer timeout for tests
jest.setTimeout(1000 * 60 * 5);

const projectName = 'test-app';
const genPath = join(__dirname, projectName);

const generatedFiles = [
  '.gitignore',
  'README.md',
  'node_modules',
  'package.json',
  'public',
  'src',
  'package-lock.json',
];

const removeGenPath = () => {
  if (existsSync(genPath)) {
    rmSync(genPath, {
      recursive: true,
      force: true,
    });
  }
};

beforeAll(() => removeGenPath());
afterAll(() => removeGenPath());

const run = async (args, options) => {
  const result = execa('node', [createmyappCLI].concat(args), options);
  result.stdout.pipe(process.stdout);
  const childProcessResult = await result;
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

describe('createmyappCLI', () => {
  it('outputs the version number', async () => {
    const { exitCode, stdout } = await execa('node', [createmyappCLI, '--ver']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('create-my-app version:');
  });

  // it('requires a project name', async () => {
  //   const { exitCode, stderr, files } = await run([], { reject: false });
  //   expect(exitCode).toBe(1);
  //   expect(stderr).toContain('Please specify the project directory');
  //   expect(files).toBe(null);
  // });

  // it('creates a new project', async () => {
  //   const { exitCode, files } = await run([projectName], { cwd: __dirname });
  //   expect(exitCode).toBe(0);
  //   expectAllFiles(files, generatedFiles);
  // });

  // it('warns about existing directory', async () => {
  //   mkdirSync(genPath);
  //   const pkgJson = join(genPath, 'package.json');
  //   writeFileSync(pkgJson, '{ "foo": "bar" }');
  //   const { exitCode, stdout, files } = await run([projectName], { cwd: __dirname, reject: false });
  //   expect(exitCode).toBe(1);
  //   expect(stdout).toContain(`Error: Directory "${projectName}" already exists`);
  //   expectAllFiles(files, ['package.json']);
  // });

  // it('creates a project in the current directory', async () => {
  //   mkdirSync(genPath);
  //   const { exitCode, files } = await run(['.'], { cwd: genPath });
  //   expect(exitCode).toBe(0);
  //   expectAllFiles(files, generatedFiles);
  // });

  // Add more tests as needed
});
