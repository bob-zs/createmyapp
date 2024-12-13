const inquirer = require('inquirer');
const { promptUser } = require('../../modules/userInteraction'); // Adjust the path accordingly

jest.mock('inquirer');

describe('promptUser function', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Ensure no residual mocks
  });

  it('should return the selected package manager', async () => {
    // Mock the prompt method
    inquirer.prompt = jest.fn().mockResolvedValue({ packageManager: 'pnpm' });

    const result = await promptUser();
    expect(result).toEqual({ packageManager: 'pnpm' });

    // Verify the prompt was called with the expected arguments
    expect(inquirer.prompt).toHaveBeenCalledWith([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Which package manager do you want to use?',
        choices: ['pnpm', 'npm'],
      },
    ]);

    // Test for another choice
    inquirer.prompt.mockResolvedValue({ packageManager: 'npm' });

    const result2 = await promptUser();
    expect(result2).toEqual({ packageManager: 'npm' });

    // Verify the prompt was called again with the expected arguments
    expect(inquirer.prompt).toHaveBeenCalledWith([
      {
        type: 'list',
        name: 'packageManager',
        message: 'Which package manager do you want to use?',
        choices: ['pnpm', 'npm'],
      },
    ]);
  });
});
