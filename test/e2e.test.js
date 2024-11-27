const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const createMyApp = require('../createMyApp');

describe('jest', () => {
  it('basically still works', () => {
    expect(true).toBe(true);
  });
  it('can run a shell command', async () => {
    const { stdout } = await exec('echo hello');
    expect(stdout.trim()).toBe('hello');
  });
});

describe('createMyApp', () => {
  it('can output version number', async () => {
    const { stdout } = await exec(`node ${createMyApp} --version`);
    // expect(stdout.trim()).toMatch(/createmyapp\nversion: \d+\.\d+\.\d+/);
  });
});
