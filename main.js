#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import kleur from 'kleur';

import { Command } from 'commander';
import { fileURLToPath } from 'url';

import { promptUser } from './modules/userInteraction.js';
import { setupProject } from './modules/setupProject.js';

const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

program
  .version(version)
  .option('-v, --ver', 'output the version number');

program.parse(process.argv);
const options = program.opts();
if (options.ver) {
  console.log(`create-my-app version: ${version}\n`);
  process.exit(0);
}

const baseAppDir = path.join(__dirname, 'base-app');
const scriptName = path.basename(process.argv[1]);
const appName = process.argv[2] || 'my-app';

console.log(kleur.cyan(`baseAppDir: ${path.relative(process.cwd(), baseAppDir)}`));  // Print relative path
console.log(kleur.cyan(`appName: ${appName}`));  // Debug log

if (fs.existsSync(appName)) {
  console.error(`Error: Directory "${appName}" already exists. Please choose a different name.`);
  process.exit(1);
}

(async () => {
  try {
    const { packageManager } = await promptUser();
    await setupProject(baseAppDir, appName, packageManager, scriptName);
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log("Prompt was interrupted. You can restart the setup by running the script again.");
    } else {
      console.error("Unexpected error:", error);
    }
  }

  console.log('End of script');
})();
