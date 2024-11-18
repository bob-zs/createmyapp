import { setupApp } from '../setup.js';
import fs from 'fs';
import { execSync } from 'child_process';

jest.mock('fs');
jest.mock('child_process');

describe('setupApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create the app directory and copy files', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.readdirSync.mockReturnValue([]);
    fs.mkdirSync.mockImplementation(() => {});
    execSync.mockImplementation(() => {});

    await setupApp('test-app', 'npm');

    expect(fs.mkdirSync).toHaveBeenCalledWith('test-app');
    expect(execSync).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
  });

  // Add more tests for different scenarios
});
