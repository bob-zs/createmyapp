import { execSync } from 'node:child_process';
import kleur from 'kleur';

export const runCommand = command => {
  console.log(kleur.cyan(`Running: ${command}`));
  execSync(command, { stdio: 'inherit' });
  console.log('\n');
};
