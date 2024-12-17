const inquirer = require('inquirer');
const { promptUser } = require('../../modules/userInteraction');

jest.mock('inquirer');

const mockPromptWithResponse = async (response) => {
  inquirer.prompt = jest.fn().mockResolvedValue(response);
  const result = await promptUser();
  expect(result.packageManager).toBe(response.packageManager);
  expect(inquirer.prompt).toHaveBeenCalledWith([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      choices: ['pnpm', 'npm'],
    },
  ]);
};

describe('userInteraction', () => {
  it('should allow users to select pnpm', async () => {
    await mockPromptWithResponse({ packageManager: 'pnpm' });
  });

  it('should allow users to select npm', async () => {
    await mockPromptWithResponse({ packageManager: 'npm' });
  });

  it('should handle errors gracefully', async () => {
    const mockPrompt = jest.fn().mockRejectedValue(new Error('Something went wrong'));
    inquirer.prompt = mockPrompt;

    await expect(promptUser()).rejects.toThrow('Something went wrong');

    expect(mockPrompt).toHaveBeenCalledWith([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Which package manager do you want to use?',
        choices: ['pnpm', 'npm'],
      },
    ]);
  });
});
