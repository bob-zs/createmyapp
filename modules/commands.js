const { execSync } = require('node:child_process');
const kleur = require('kleur');

const runCommand = command => {
  console.log(kleur.cyan(`Running: ${command}`));
  execSync(command, { stdio: 'inherit' });
  console.log('\n');
};

module.exports = { runCommand };