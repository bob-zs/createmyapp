const { execSync } = require('node:child_process');
const kleur = require('kleur');
const { runCommand } = require('../modules/commands');

describe('runCommand', () => {
  let originalLog;
  let originalErrorLog;
  let logs;
  let errorLogs;

  beforeEach(() => {
    originalLog = console.log;
    originalErrorLog = console.error;
    logs = [];
    errorLogs = [];
    console.log = (output) => logs.push(output);
    console.error = (output) => errorLogs.push(output);
  });

  it('should log the correct command with kleur and execute it', () => {
    const command = 'echo "Hello, World!"';
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    console.log = originalLog;
  });

  it('should log an error message if the command fails', () => {
    const command = 'invalid_command';
    try {
      runCommand(command);
    } catch (e) {
      // Expected to fail
    }
    expect(errorLogs).toContain(kleur.red(`Failed to execute command: ${command}`));
    console.log = originalLog;
    console.error = originalErrorLog;
  });

  it('should handle commands with multiple arguments', () => {
    const command = 'echo "Hello," "World!"';
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    console.log = originalLog;
  });

  it('should handle long running commands', () => {
    const command = 'sleep 2'; // Sleep for 2 seconds
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    console.log = originalLog;
  });

  it('should capture and handle command output', () => {
    const command = 'echo "Command Output"';
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    expect(logs.some(log => log.includes('Command Output'))).toBe(true);
    console.log = originalLog;
  });

  xit('should handle commands with environment variables', () => {
    process.env.TEST_VAR = 'Hello, World!';
    const command = 'echo $TEST_VAR';
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    expect(logs.some(log => log.includes('Hello, World!'))).toBe(true);
    console.log = originalLog;
  });

  it('should handle multiple commands in sequence', () => {
    const commands = [
      'echo "First Command"',
      'echo "Second Command"',
      'echo "Third Command"'
    ];
    commands.forEach(command => runCommand(command));
    commands.forEach(command => {
      expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    });
    console.log = originalLog;
  });
});
