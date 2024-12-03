const { execSync } = require('node:child_process');
const kleur = require('kleur');
const { runCommand } = require('../modules/commands');

describe('runCommand', () => {
  it('should log the correct command with kleur and execute it', () => {
    const command = 'echo "Hello, World!"';
    const log = console.log;
    const logs = [];
    console.log = (output) => logs.push(output);
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    console.log = log;
  });

  it('should log an error message if the command fails', () => {
    const command = 'invalid_command';
    const log = console.log;
    const errorLog = console.error;
    const logs = [];
    const errorLogs = [];

    console.log = (output) => logs.push(output);
    console.error = (output) => errorLogs.push(output);

    try {
      runCommand(command);
    } catch (e) {
      // Expected to fail
    }

    expect(errorLogs).toContain(kleur.red(`Failed to execute command: ${command}`));
    console.log = log;
    console.error = errorLog;
  });
});
