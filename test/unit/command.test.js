const { execSync } = require('child_process');
const kleur = require('kleur');
const { runCommand } = require('../../modules/commands');

describe('runCommand', () => {
  let execSyncMock;
  let consoleLogMock;
  let consoleErrorMock;
  let stderrWriteMock;

  beforeEach(() => {
    // Mock execSync to control its behavior
    execSyncMock = jest.spyOn(require('child_process'), 'execSync');

    // Mock console methods to verify output
    consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock process.stderr.write to suppress stderr output
    stderrWriteMock = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original methods after each test
    execSyncMock.mockRestore();
    consoleLogMock.mockRestore();
    consoleErrorMock.mockRestore();
    stderrWriteMock.mockRestore();
  });

  it('should log the running command and its output if successful', () => {
    const command = 'echo Hello, World!';
    const output = 'Hello, World!';
    execSyncMock.mockReturnValue(output);

    runCommand(command);

    expect(consoleLogMock).toHaveBeenCalledWith(kleur.cyan(`Running: ${command}`));
    expect(consoleLogMock).toHaveBeenCalledWith(output.trim());
  });

  it('should log an error if the command fails', () => {
    const command = 'invalidCommand';
    const error = new Error('Command failed: invalidCommand\n/bin/bash: invalidCommand: command not found\n');
    execSyncMock.mockImplementation(() => { throw error; });

    runCommand(command);

    expect(consoleErrorMock).toHaveBeenCalledWith(kleur.red(`Failed to execute command: ${command}`));
    expect(consoleErrorMock).toHaveBeenCalledWith(kleur.red(error.message));
  });

  it('should handle commands with multi-line output', () => {
    const command = 'echo "Hello\nWorld"';
    const output = 'Hello\nWorld';
    execSyncMock.mockReturnValue(output);

    runCommand(command);

    expect(consoleLogMock).toHaveBeenCalledWith(kleur.cyan(`Running: ${command}`));
    expect(consoleLogMock).toHaveBeenCalledWith(output.trim());
  });

  it('should handle commands with arguments', () => {
    const command = 'echo Hello';
    const output = 'Hello';
    execSyncMock.mockReturnValue(output);

    runCommand(command);

    expect(consoleLogMock).toHaveBeenCalledWith(kleur.cyan(`Running: ${command}`));
    expect(consoleLogMock).toHaveBeenCalledWith(output.trim());
  });

  it('should handle commands that produce no output', () => {
    const command = 'true';
    execSyncMock.mockReturnValue('');

    runCommand(command);

    expect(consoleLogMock).toHaveBeenCalledWith(kleur.cyan(`Running: ${command}`));
    expect(consoleLogMock).toHaveBeenCalledWith('');
  });
});
