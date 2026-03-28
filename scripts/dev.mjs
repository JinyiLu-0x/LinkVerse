import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const processes = [
  spawn(npmCommand, ['run', 'dev:backend'], { stdio: 'inherit' }),
  spawn(npmCommand, ['run', 'dev:frontend'], { stdio: 'inherit' }),
];

const shutdown = () => {
  processes.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

processes.forEach((child) => {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
    shutdown();
  });
});
