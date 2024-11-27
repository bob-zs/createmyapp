#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const kleur = require('kleur');
const { Command } = require('commander');
const { promptUser } = require('./modules/userInteraction');
const { setupProject } = require('./modules/setupProject');

const program = new Command();

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const packageName = packageJson.name.split('/')[1];
const version = packageJson.version;

module.exports = async () => {
  program.version(`${packageName}\nversion: ${version}`, '-v, --version', 'output the version number'); 
  program.parse(process.argv);

  const baseAppDir = path.join(__dirname, 'base-app');
  const scriptName = path.basename(process.argv[1]);
  const appName = process.argv[2] || 'my-app';

  console.log(kleur.cyan(`baseAppDir: ${path.relative(process.cwd(), baseAppDir)}`));  // Print relative path
  console.log(kleur.cyan(`appName: ${appName}`));  // Debug log

  if (fs.existsSync(appName)) {
    console.error(`Error: Directory "${appName}" already exists. Please choose a different name.`);
    process.exit(1);
  }
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
};
