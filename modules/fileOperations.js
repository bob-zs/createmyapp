const fs = require('node:fs');
const path = require('node:path');

const copyRecursiveSync = (src, dest, scriptName, shouldIgnore) => {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const shortSrcPath = path.basename(srcPath); // Use basename for shorter logs
    console.log(`Processing: ${shortSrcPath}`);  // Log with shorter path
    if (entry.name !== scriptName && !shouldIgnore(entry.name)) {
      entry.isDirectory() ? copyRecursiveSync(srcPath, destPath, scriptName, shouldIgnore) : fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${shortSrcPath}`);
    }
  }

  // Explicitly copy and rename gitignore to .gitignore if it exists
  const gitignoreSrcPath = path.join(src, 'gitignore');
  if (fs.existsSync(gitignoreSrcPath)) {
    const gitignoreDestPath = path.join(dest, '.gitignore');
    fs.copyFileSync(gitignoreSrcPath, gitignoreDestPath);
    console.log(`Copied: .gitignore`);
  }
};

const shouldIgnore = (name, defaultIgnores) => {
  return defaultIgnores.some(ignore => {
    const pattern = new RegExp(ignore.replace(/\*/g, '.*'));
    return pattern.test(name);
  });
};

module.exports = { copyRecursiveSync, shouldIgnore };
