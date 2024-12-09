const { setupProject } = require('../../modules/setupProject');
const { runCommand } = require('../../modules/commands');
const { copyRecursiveSync } = require('../../modules/fileOperations');
const kleur = require('kleur');
const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('fs');
jest.mock('kleur', () => ({
  cyan: jest.fn((text) => text),
  red: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  blue: jest.fn((text) => text),
}));
jest.mock('../../modules/commands');
jest.mock('../../modules/fileOperations');

describe('setupProject', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = path.join(os.tmpdir(), `testApp-${Date.now()}`);
    fs.mkdirSync(tmpDir);
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false); // Mock directory does not exist by default
    fs.mkdirSync.mockImplementation((dir) => {
      if (dir === path.join(tmpDir, 'testApp')) {
        const err = new Error('EEXIST: file already exists, mkdir \'testApp\'');
        err.code = 'EEXIST';
        throw err;
      }
    }); // Mock directory creation to throw EEXIST error if dir exists
  });

  it('should run a test', () => {
    expect(5).toEqual(5);
  });
});
