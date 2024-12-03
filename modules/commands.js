const { execSync } = require('node:child_process');
const kleur = require('kleur');

const runCommand = (command) => {
  try {
    console.log(kleur.cyan(`Running: ${command}`));
    execSync(command, { stdio: 'inherit', env: { ...process.env }, shell: '/bin/bash' });
    console.log('\n');
  } catch (error) {
    console.error(kleur.red(`Failed to execute command: ${command}`));
    console.error(kleur.red(error.message));
  }
};

module.exports = { runCommand };
