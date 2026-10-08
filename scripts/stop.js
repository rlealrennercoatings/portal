const { execSync } = require('child_process');

const ports = [3000, 4200];

function stopListeningPorts() {
  if (process.platform === 'win32') {
    const command = [
      '$ports = @(3000, 4200);',
      'foreach ($port in $ports) {',
      "  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |",
      "    Where-Object { $_.State -eq 'Listen' } |",
      "    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }",
      '}'
    ].join(' ');

    execSync(`powershell -NoProfile -Command "${command}"`, { stdio: 'inherit' });
    return;
  }

  execSync(`lsof -ti tcp:3000,tcp:4200 2>/dev/null | xargs -r kill -9`, { stdio: 'inherit' });
}

stopListeningPorts();
console.log('Portas 3000 e 4200 liberadas.');
