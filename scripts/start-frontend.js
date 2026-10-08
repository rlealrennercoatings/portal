const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const child = spawn(npmCommand, ['run', 'start', '--', '--host', '0.0.0.0', '--port', '4200'], {
  cwd: path.join(rootDir, 'frontend'),
  shell: isWindows,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
