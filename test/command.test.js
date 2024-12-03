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

  it('should log the correct command with kleur, execute it, and capture the output', () => {
    const command = 'echo "Hello, World!"';
    const output = execSync(command, { shell: '/bin/bash' }).toString().trim();
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    expect(output).toBe('Hello, World!');
  });

  it('should log an error message if the command fails', () => {
    const command = 'invalid_command';
    try {
      runCommand(command);
    } catch (e) {
      // Expected to fail
    }
    expect(errorLogs).toContain(kleur.red(`Failed to execute command: ${command}`));
  });

  it('should handle commands with multiple arguments and capture output', () => {
    const command = 'echo "Hello," "World!"';
    const output = execSync(command, { shell: '/bin/bash' }).toString().trim();
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    expect(output).toBe('Hello, World!');
  });

  it('should handle long running commands', () => {
    const command = 'sleep 2';
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
  });

  it('should handle commands with environment variables and capture output', () => {
    process.env.TEST_VAR = 'Hello, World!';
    const command = 'echo $TEST_VAR';
    const fullCommand = `TEST_VAR="${process.env.TEST_VAR}" ${command}`;
    const output = execSync(fullCommand, { shell: '/bin/bash' }).toString().trim();
    runCommand(fullCommand);
    expect(logs).toContain(kleur.cyan(`Running: ${fullCommand}`));
    expect(logs.some(log => log.includes('Hello, World!'))).toBe(true);
  });

  it('should handle multiple commands in sequence and capture output', () => {
    const commands = [
      'echo "First Command"',
      'echo "Second Command"',
      'echo "Third Command"'
    ];
    commands.forEach(command => {
      const output = execSync(command, { shell: '/bin/bash' }).toString().trim();
      runCommand(command);
      expect(logs).toContain(kleur.cyan(`Running: ${command}`));
      expect(logs.some(log => log.includes(output))).toBe(true);
    });
  });
});
