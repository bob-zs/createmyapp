const inquirer = require('inquirer');

const promptUser = async () => {
  const { packageManager } = await inquirer.default.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      choices: ['pnpm', 'npm'],
    },
  ]);
  return { packageManager };
};

module.exports = { promptUser };