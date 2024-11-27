const inquirer = require('inquirer');

// Check if inquirer has a default export and adjust accordingly
const prompt = inquirer.default.prompt;

const promptUser = async () => {
  const { packageManager } = await prompt([
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
