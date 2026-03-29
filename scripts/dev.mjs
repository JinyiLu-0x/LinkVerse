import { execFileSync, spawn } from 'node:child_process';
import net from 'node:net';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const DEFAULT_BACKEND_PORT = Number(process.env.LINKVERSE_BACKEND_PORT || process.env.PORT || 8787);
const MAX_PORT_SCAN = 20;

const isPortAvailableWithSocket = (port) =>
  new Promise((resolve) => {
    const socket = net.createConnection({
      host: '127.0.0.1',
      port,
    });

    const finalize = (available) => {
      if (!socket.destroyed) {
        socket.destroy();
      }
      resolve(available);
    };

    socket.once('connect', () => finalize(false));
    socket.once('error', (error) => {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 'ECONNREFUSED' || error.code === 'EHOSTUNREACH' || error.code === 'ETIMEDOUT')
      ) {
        finalize(true);
        return;
      }

      finalize(false);
    });
  });

const isPortAvailable = async (port) => {
  if (process.platform !== 'win32') {
    try {
      execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], {
        stdio: 'ignore',
      });
      return false;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 1) {
        return true;
      }

      if (!(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')) {
        return false;
      }
    }
  }

  return isPortAvailableWithSocket(port);
};

const isReusableLinkVerseBackend = async (port) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    return Boolean(payload && payload.ok === true);
  } catch {
    return false;
  }
};

const findAvailablePort = async (preferredPort) => {
  for (let offset = 0; offset < MAX_PORT_SCAN; offset += 1) {
    const candidate = preferredPort + offset;
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Could not find an open backend port between ${preferredPort} and ${preferredPort + MAX_PORT_SCAN - 1}.`
  );
};

const spawnProcess = (args, envOverrides = {}) =>
  spawn(npmCommand, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...envOverrides,
    },
  });

let backendPort = DEFAULT_BACKEND_PORT;
let shouldSpawnBackend = true;

if (!(await isPortAvailable(DEFAULT_BACKEND_PORT))) {
  if (await isReusableLinkVerseBackend(DEFAULT_BACKEND_PORT)) {
    shouldSpawnBackend = false;
    console.log(`[dev] Reusing existing LinkVerse backend on port ${DEFAULT_BACKEND_PORT}.`);
  } else {
    backendPort = await findAvailablePort(DEFAULT_BACKEND_PORT + 1);
    console.log(
      `[dev] Port ${DEFAULT_BACKEND_PORT} is already in use. Starting the optional backend on ${backendPort} instead.`
    );
  }
}

const proxyTarget = process.env.VITE_API_PROXY_TARGET || `http://127.0.0.1:${backendPort}`;

console.log(`[dev] Frontend proxy target: ${proxyTarget}`);

const processes = [
  ...(shouldSpawnBackend
    ? [
        spawnProcess(['run', 'dev:backend'], {
          PORT: String(backendPort),
        }),
      ]
    : []),
  spawnProcess(['run', 'dev:frontend'], {
    VITE_API_PROXY_TARGET: proxyTarget,
  }),
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
