const fs = require('fs');
const os = require('os');
const path = require('path');
const { copyRecursiveSync, shouldIgnore } = require('../../modules/fileOperations');

describe('copyRecursiveSync', () => {
  let testRootDir;
  let srcDir;
  let destDir;
  const scriptName = 'script.js';
  const defaultIgnores = ['.git', 'node_modules', 'dist'];

  beforeAll(() => {
    testRootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'testDir-'));
    srcDir = path.join(testRootDir, 'src');
    destDir = path.join(testRootDir, 'dest');
    fs.mkdirSync(srcDir);
  });

  beforeEach(() => {
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
  });

  it('should create destination directory if it does not exist', () => {
    copyRecursiveSync(srcDir, destDir, scriptName, name => shouldIgnore(name, defaultIgnores));
    expect(fs.existsSync(destDir)).toBe(true);
  });

  it('should copy files from source to destination', () => {
    const file1 = path.join(srcDir, 'file1.txt');
    const file2 = path.join(srcDir, 'file2.txt');

    fs.writeFileSync(file1, 'content1');
    fs.writeFileSync(file2, 'content2');

    copyRecursiveSync(srcDir, destDir, scriptName, name => shouldIgnore(name, defaultIgnores));

    expect(fs.existsSync(path.join(destDir, 'file1.txt'))).toBe(true);
    expect(fs.existsSync(path.join(destDir, 'file2.txt'))).toBe(true);
  });

  it('should ignore files based on scriptName and shouldIgnore function', () => {
    const file1 = path.join(srcDir, 'script.js');
    const file2 = path.join(srcDir, 'file1.txt');

    fs.writeFileSync(file1, 'content_script');
    fs.writeFileSync(file2, 'content1');

    copyRecursiveSync(srcDir, destDir, scriptName, name => shouldIgnore(name, defaultIgnores));

    expect(fs.existsSync(path.join(destDir, 'script.js'))).toBe(false);
    expect(fs.existsSync(path.join(destDir, 'file1.txt'))).toBe(true);
  });

  it('should copy directories recursively', () => {
    const dir1 = path.join(srcDir, 'dir1');
    const file3 = path.join(dir1, 'file3.txt');
    fs.mkdirSync(dir1);
    fs.writeFileSync(file3, 'content3');

    copyRecursiveSync(srcDir, destDir, scriptName, name => shouldIgnore(name, defaultIgnores));

    expect(fs.existsSync(path.join(destDir, 'dir1'))).toBe(true);
    expect(fs.existsSync(path.join(destDir, 'dir1', 'file3.txt'))).toBe(true);
  });

  it('should copy gitignore file and rename it to .gitignore', () => {
    const gitignoreSrcPath = path.join(srcDir, 'gitignore');
    fs.writeFileSync(gitignoreSrcPath, 'content_gitignore');

    copyRecursiveSync(srcDir, destDir, scriptName, name => shouldIgnore(name, defaultIgnores));

    expect(fs.existsSync(path.join(destDir, '.gitignore'))).toBe(true);
    expect(fs.readFileSync(path.join(destDir, '.gitignore'), 'utf8')).toBe('content_gitignore');
  });
});

describe('shouldIgnore', () => {
  const defaultIgnores = ['.git', 'node_modules', 'dist'];

  it('should return true for ignored names', () => {
    expect(shouldIgnore('.git', defaultIgnores)).toBe(true);
    expect(shouldIgnore('node_modules', defaultIgnores)).toBe(true);
    expect(shouldIgnore('dist', defaultIgnores)).toBe(true);
  });

  it('should return false for non-ignored names', () => {
    expect(shouldIgnore('src', defaultIgnores)).toBe(false);
    expect(shouldIgnore('index.js', defaultIgnores)).toBe(false);
  });

  it('should handle wildcard ignores', () => {
    const wildcardIgnores = ['*.log', '*.tmp'];
    expect(shouldIgnore('error.log', wildcardIgnores)).toBe(true);
    expect(shouldIgnore('debug.tmp', wildcardIgnores)).toBe(true);
    expect(shouldIgnore('index.js', wildcardIgnores)).toBe(false);
  });
});
