const inquirer = require('inquirer');
const { promptUser } = require('../../modules/userInteraction'); // Adjust the path accordingly

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

describe('promptUser', () => {
  it('should return the selected package manager', async () => {
    // Mock the prompt method
    inquirer.prompt.mockResolvedValue({ packageManager: 'pnpm' });

    const result = await promptUser();
    expect(result).toEqual({ packageManager: 'pnpm' });

    // Test for another choice
    inquirer.prompt.mockResolvedValue({ packageManager: 'npm' });

    const result2 = await promptUser();
    expect(result2).toEqual({ packageManager: 'npm' });
  });
});