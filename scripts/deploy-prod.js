#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const args = {};

for (let index = 0; index < process.argv.length; index += 1) {
  const arg = process.argv[index];

  if (!arg.startsWith('--')) {
    continue;
  }

  const [rawKey, ...rawValueParts] = arg.slice(2).split('=');
  const key = rawKey;
  const value = rawValueParts.join('=');

  if (value) {
    args[key] = value;
    continue;
  }

  const nextValue = process.argv[index + 1];
  if (nextValue && !nextValue.startsWith('--')) {
    args[key] = nextValue;
    index += 1;
    continue;
  }

  args[key] = true;
}

const dryRun = Boolean(args['dry-run']);
const host = args.host || process.env.PORTAL_DEPLOY_HOST || '10.3.1.142';
const user = args.user || process.env.PORTAL_DEPLOY_USER || 'deploy';
const remotePath = args.path || process.env.PORTAL_DEPLOY_PATH || '/srv/apps/portal';
const sshKey = args.key || process.env.PORTAL_DEPLOY_KEY || '';
const remote = `${user}@${host}`;
const sshPrefix = sshKey ? `ssh -i "${sshKey}"` : 'ssh';

const excludes = [
  '.git',
  'node_modules',
  'backend/node_modules',
  'frontend/node_modules',
  'backend/dist',
  'frontend/dist',
  'backend/coverage',
  'frontend/.angular',
  '.env',
  '.env.example',
  '*.log'
];

const excludeArgs = excludes.flatMap((item) => ['--exclude', item]).join(' ');
const rsyncCommand = `rsync -az --delete ${excludeArgs} "${rootDir}/" "${remote}:${remotePath}/"`;
const prepareRemoteCommand = `"mkdir -p '${remotePath}' && cd '${remotePath}' && npm --prefix backend install --omit=dev && npm --prefix frontend install --omit=dev && npm --prefix backend run build && npm --prefix frontend run build"`;
const remoteCommand = `${sshPrefix} ${remote} ${prepareRemoteCommand}`;

function run(command) {
  console.log(`$ ${command}`);
  if (dryRun) {
    return;
  }

  const result = spawnSync(command, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('Iniciando deploy para produção...');
console.log(`Host: ${host}`);
console.log(`Usuário: ${user}`);
console.log(`Destino: ${remotePath}`);

run(`${sshPrefix} ${remote} "mkdir -p '${remotePath}'"`);
run(rsyncCommand);
run(remoteCommand);

console.log('\nDeploy concluído.');
console.log('Se o serviço for gerenciado por PM2 ou systemd, reinicie o processo manualmente no servidor.');
