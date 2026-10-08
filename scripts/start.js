const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const backend = spawn(npmCommand, ['run', 'start:dev'], {
  cwd: path.join(rootDir, 'backend'),
  shell: isWindows,
  stdio: 'inherit',
});

const frontend = spawn(npmCommand, ['run', 'start', '--', '--host', '0.0.0.0', '--port', '4200'], {
  cwd: path.join(rootDir, 'frontend'),
  shell: isWindows,
  stdio: 'inherit',
});

const stopAll = (code) => {
  backend.kill();
  frontend.kill();
  process.exit(code ?? 0);
};

backend.on('exit', (code) => stopAll(code ?? 0));
frontend.on('exit', (code) => stopAll(code ?? 0));

console.log('Portal iniciado. Backend em http://localhost:3000 e frontend em http://localhost:4200');
