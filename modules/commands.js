const { execSync } = require('node:child_process');
const kleur = require('kleur');

const runCommand = (command) => {
  try {
    console.log(kleur.cyan(`Running: ${command}`));
    const output = execSync(command, { encoding: 'utf-8', shell: '/bin/bash' });
    console.log(output.trim());
  } catch (error) {
    console.error(kleur.red(`Failed to execute command: ${command}`));
    console.error(kleur.red(error.message));
  }
};

module.exports = { runCommand };
