const { execSync } = require('node:child_process');
const kleur = require('kleur');
const { runCommand } = require('../../modules/commands');

describe('runCommand', () => {
  let originalLog;
  let originalErrorLog;
  let logs;
  let errorLogs;
  let originalStdoutWrite;
  let originalStderrWrite;
  let stdoutOutput;
  let stderrOutput;

  beforeEach(() => {
    originalLog = console.log;
    originalErrorLog = console.error;
    logs = [];
    errorLogs = [];
    stdoutOutput = '';
    stderrOutput = '';

    console.log = (output) => logs.push(output);
    console.error = (output) => errorLogs.push(output);

    // Capture stdout and stderr
    originalStdoutWrite = process.stdout.write;
    originalStderrWrite = process.stderr.write;
    process.stdout.write = (chunk) => { stdoutOutput += chunk.toString(); };
    process.stderr.write = (chunk) => { stderrOutput += chunk.toString(); };

    // Restore original implementations after each test implicitly by reassigning in beforeEach
    return () => {
      console.log = originalLog;
      console.error = originalErrorLog;
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
    };
  });

  it('should log the correct command with kleur, execute it, and capture the output', () => {
    const command = 'echo "Hello, World!"';
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    expect(stdoutOutput.trim()).toContain('Hello, World!');
  });

  it('should log an error message if the command fails', () => {
    const command = 'invalid_command';
    try {
      runCommand(command);
    } catch (e) {
      // Expected to fail
    }
    expect(errorLogs).toContain(kleur.red(`Failed to execute command: ${command}`));
    expect(stderrOutput).toContain('command not found');
  });

  it('should handle commands with multiple arguments and capture output', () => {
    const command = 'echo "Hello," "World!"';
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    expect(stdoutOutput.trim()).toContain('Hello, World!');
  });

  it('should handle long running commands', () => {
    const command = 'sleep 2'; // Sleep for 2 seconds
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
  });

  it('should handle commands with environment variables and capture output', () => {
    process.env.TEST_VAR = 'Hello, World!';
    const command = 'echo $TEST_VAR';
    runCommand(command);
    expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    expect(stdoutOutput.trim()).toContain('Hello, World!');
  });

  it('should handle multiple commands in sequence and capture output', () => {
    const commands = [
      'echo "First Command"',
      'echo "Second Command"',
      'echo "Third Command"'
    ];
    commands.forEach(command => {
      runCommand(command);
      expect(logs).toContain(kleur.cyan(`Running: ${command}`));
    });
    expect(stdoutOutput.trim()).toContain('First Command');
    expect(stdoutOutput.trim()).toContain('Second Command');
    expect(stdoutOutput.trim()).toContain('Third Command');
  });
});
