import fs from 'node:fs';
import path from 'node:path';

export const copyRecursiveSync = (src, dest, scriptName, shouldIgnore) => {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relativeSrcPath = path.relative(process.cwd(), srcPath);
    console.log(`Processing: ${relativeSrcPath}`);  // Debug log with relative path
    if (entry.name !== scriptName && !shouldIgnore(entry.name)) {
      entry.isDirectory() ? copyRecursiveSync(srcPath, destPath, scriptName, shouldIgnore) : fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${relativeSrcPath}`);
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

export const shouldIgnore = (name, defaultIgnores) => {
  return defaultIgnores.some(ignore => name.startsWith(ignore.replace('*', '')));
};
