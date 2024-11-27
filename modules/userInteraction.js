const inquirer = require('inquirer');

export const promptUser = async () => {
  return inquirer.prompt({
    type: 'list',
    name: 'packageManager',
    message: 'Which package manager do you want to use?',
    choices: ['pnpm', 'npm'],
  });
};
