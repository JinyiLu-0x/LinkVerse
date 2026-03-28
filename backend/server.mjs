import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createUser,
  createUserRecord,
  deleteSession,
  findUserByEmail,
  getAuthenticatedUserByToken,
  getDatabaseDriver,
  getWorkspace,
  hasAccounts,
  initDatabase,
  replaceSession,
  updateUserAISettings,
  updateUserProfile,
  upsertWorkspace,
} from './db.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const DEFAULT_MODEL = 'gemini-2.5-flash';
const PORT = Number(process.env.PORT || 8787);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
};

const sendNoContent = (res) => {
  res.writeHead(204, {
    'Cache-Control': 'no-store',
  });
  res.end();
};

const sendError = (res, statusCode, message) =>
  sendJson(res, statusCode, { error: message });

const readBody = async (req) =>
  new Promise((resolveBody, rejectBody) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 5_000_000) {
        rejectBody(new Error('Payload too large.'));
      }
    });

    req.on('end', () => {
      if (!raw) {
        resolveBody({});
        return;
      }

      try {
        resolveBody(JSON.parse(raw));
      } catch {
        rejectBody(new Error('Invalid JSON body.'));
      }
    });

    req.on('error', rejectBody);
  });

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const toInitials = (displayName, email) => {
  const words = String(displayName || '').trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return String(email || 'LV').slice(0, 2).toUpperCase();
};

const hashPassword = (password, salt = randomUUID()) => ({
  passwordSalt: salt,
  passwordHash: scryptSync(password, salt, 64).toString('hex'),
});

const verifyPassword = (password, salt, expectedHash) => {
  const incomingHash = scryptSync(password, salt, 64);
  const storedHash = Buffer.from(expectedHash, 'hex');

  if (incomingHash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(incomingHash, storedHash);
};

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
  plan: user.plan,
  createdAt: user.createdAt,
  apiKey: user.apiKey || '',
  aiModel: user.aiModel || DEFAULT_MODEL,
  initials: toInitials(user.displayName, user.email),
});

const sanitizeWorkspace = (workspace) => {
  if (!workspace || typeof workspace !== 'object') {
    return null;
  }

  return {
    projects: Array.isArray(workspace.projects) ? workspace.projects : [],
    availableTags: Array.isArray(workspace.availableTags)
      ? workspace.availableTags.filter((tag) => typeof tag === 'string' && tag.trim())
      : [],
    theme: workspace.theme === 'dark' ? 'dark' : 'light',
  };
};

const getTokenFromRequest = (req) => {
  const authorization = req.headers.authorization || '';
  if (authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim();
  }
  return '';
};

const getAuthenticatedUser = async (req) => {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return getAuthenticatedUserByToken(token);
};

const allowCors = (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
};

const serveStaticAsset = async (req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const safePath = requestedPath.replace(/^\/+/, '');
  const filePath = join(DIST_DIR, safePath);

  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      throw new Error('Not a file');
    }

    const extension = extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
    });
    createReadStream(filePath).pipe(res);
    return true;
  } catch {
    try {
      const indexPath = join(DIST_DIR, 'index.html');
      await stat(indexPath);
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      createReadStream(indexPath).pipe(res);
      return true;
    } catch {
      return false;
    }
  }
};

const server = createServer(async (req, res) => {
  allowCors(req, res);

  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true, database: getDatabaseDriver() });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/meta') {
      sendJson(res, 200, { hasAccounts: await hasAccounts() });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      const body = await readBody(req);
      const displayName = String(body.displayName || '').trim();
      const email = normalizeEmail(body.email);
      const password = String(body.password || '').trim();
      const apiKey = String(body.apiKey || '').trim();
      const aiModel = String(body.aiModel || '').trim() || DEFAULT_MODEL;
      const workspace = sanitizeWorkspace(body.workspace);

      if (!displayName) {
        sendError(res, 400, 'Please enter a display name.');
        return;
      }

      if (!email) {
        sendError(res, 400, 'Please enter an email address.');
        return;
      }

      if (password.length < 6) {
        sendError(res, 400, 'Password must be at least 6 characters.');
        return;
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        sendError(res, 409, 'This email is already registered.');
        return;
      }

      const passwordRecord = hashPassword(password);
      const user = await createUser(
        createUserRecord({
          email,
          displayName,
          role: (await hasAccounts()) ? 'Member' : 'Owner',
          plan: 'Cloud Prototype',
          createdAt: Date.now(),
          apiKey,
          aiModel,
          ...passwordRecord,
        })
      );

      const token = randomUUID();
      await replaceSession({
        token,
        userId: user.id,
        createdAt: Date.now(),
      });

      if (workspace) {
        await upsertWorkspace(user.id, workspace);
      }

      sendJson(res, 201, { token, user: sanitizeUser(user) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readBody(req);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '').trim();
      const user = await findUserByEmail(email);

      if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
        sendError(res, 401, 'Incorrect email or password.');
        return;
      }

      const token = randomUUID();
      await replaceSession({
        token,
        userId: user.id,
        createdAt: Date.now(),
      });

      sendJson(res, 200, { token, user: sanitizeUser(user) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
      const auth = await getAuthenticatedUser(req);
      if (auth) {
        await deleteSession(auth.token);
      }

      sendNoContent(res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/auth/me') {
      const auth = await getAuthenticatedUser(req);
      if (!auth) {
        sendError(res, 401, 'Not authenticated.');
        return;
      }

      sendJson(res, 200, { user: sanitizeUser(auth.user) });
      return;
    }

    if (req.method === 'PATCH' && url.pathname === '/api/auth/profile') {
      const auth = await getAuthenticatedUser(req);
      if (!auth) {
        sendError(res, 401, 'Not authenticated.');
        return;
      }

      const body = await readBody(req);
      const displayName = String(body.displayName || '').trim();
      if (!displayName) {
        sendError(res, 400, 'Display name cannot be empty.');
        return;
      }

      const user = await updateUserProfile(auth.user.id, { displayName });
      sendJson(res, 200, { user: sanitizeUser(user) });
      return;
    }

    if (req.method === 'PATCH' && url.pathname === '/api/auth/ai-settings') {
      const auth = await getAuthenticatedUser(req);
      if (!auth) {
        sendError(res, 401, 'Not authenticated.');
        return;
      }

      const body = await readBody(req);
      const user = await updateUserAISettings(auth.user.id, {
        apiKey: String(body.apiKey || '').trim(),
        aiModel: String(body.model || '').trim() || DEFAULT_MODEL,
      });

      sendJson(res, 200, { user: sanitizeUser(user) });
      return;
    }

    if (req.method === 'DELETE' && url.pathname === '/api/auth/ai-settings') {
      const auth = await getAuthenticatedUser(req);
      if (!auth) {
        sendError(res, 401, 'Not authenticated.');
        return;
      }

      const user = await updateUserAISettings(auth.user.id, {
        apiKey: '',
        aiModel: DEFAULT_MODEL,
      });

      sendJson(res, 200, { user: sanitizeUser(user) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/workspace') {
      const auth = await getAuthenticatedUser(req);
      if (!auth) {
        sendError(res, 401, 'Not authenticated.');
        return;
      }

      const workspace = await getWorkspace(auth.user.id);
      sendJson(res, 200, {
        workspace: workspace?.payload || null,
      });
      return;
    }

    if (req.method === 'PUT' && url.pathname === '/api/workspace') {
      const auth = await getAuthenticatedUser(req);
      if (!auth) {
        sendError(res, 401, 'Not authenticated.');
        return;
      }

      const body = await readBody(req);
      const workspace = sanitizeWorkspace(body.workspace);
      if (!workspace) {
        sendError(res, 400, 'Workspace payload is invalid.');
        return;
      }

      const savedWorkspace = await upsertWorkspace(auth.user.id, workspace);
      sendJson(res, 200, {
        workspace: savedWorkspace.payload,
      });
      return;
    }

    const served = await serveStaticAsset(req, res);
    if (!served) {
      sendError(res, 404, 'Not found.');
    }
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Internal server error.');
  }
});

const start = async () => {
  await initDatabase();
  server.listen(PORT, () => {
    console.log(
      `LinkVerse backend listening on http://localhost:${PORT} using ${getDatabaseDriver()} storage`
    );
  });
};

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
