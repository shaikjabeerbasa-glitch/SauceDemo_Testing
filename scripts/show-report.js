const { spawn } = require('child_process');
const net = require('net');
const { platform } = process;

function getAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const tryPort = (port) => {
      const server = net.createServer();

      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(getAvailablePort(port + 1));
          return;
        }
        reject(err);
      });

      server.once('listening', () => {
        const address = server.address();
        server.close(() => resolve(address.port));
      });

      server.listen(port, '127.0.0.1');
    };

    tryPort(startPort);
  });
}

function openBrowser(url) {
  const command = platform === 'darwin'
    ? 'open'
    : platform === 'win32'
      ? 'cmd'
      : 'xdg-open';

  const args = platform === 'darwin'
    ? [url]
    : platform === 'win32'
      ? ['/c', 'start', '', url]
      : [url];

  spawn(command, args, { stdio: 'ignore', detached: true }).unref();
}

(async () => {
  const port = await getAvailablePort(9323);
  const url = `http://127.0.0.1:${port}`;

  console.log(`Opening Playwright report at ${url}`);
  openBrowser(url);

  const npxCommand = platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(npxCommand, ['playwright', 'show-report', '--host', '127.0.0.1', '--port', String(port)], {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, PLAYWRIGHT_HTML_HOST: '127.0.0.1', PLAYWRIGHT_HTML_PORT: String(port) }
  });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
})();
