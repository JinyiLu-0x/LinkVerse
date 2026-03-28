import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const DB_FILE = join(DATA_DIR, 'auth-db.json');
const DEFAULT_MODEL = 'gemini-2.5-flash';
const DATABASE_URL = String(process.env.DATABASE_URL || '').trim();
const USE_POSTGRES = Boolean(DATABASE_URL);

let pool = null;

const defaultFileDatabase = () => ({
  users: [],
  sessions: [],
  workspaces: [],
});

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const mapUserRow = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name ?? row.displayName,
    role: row.role,
    plan: row.plan,
    createdAt: Number(row.created_at ?? row.createdAt),
    apiKey: row.api_key ?? row.apiKey ?? '',
    aiModel: row.ai_model ?? row.aiModel ?? DEFAULT_MODEL,
    passwordSalt: row.password_salt ?? row.passwordSalt,
    passwordHash: row.password_hash ?? row.passwordHash,
  };
};

const createPool = () => {
  if (pool || !USE_POSTGRES) {
    return pool;
  }

  const isLocalConnection =
    DATABASE_URL.includes('localhost') ||
    DATABASE_URL.includes('127.0.0.1') ||
    DATABASE_URL.includes('sslmode=disable');

  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isLocalConnection ? false : { rejectUnauthorized: false },
  });

  pool.on('error', (error) => {
    console.error('Postgres pool error:', error);
  });

  return pool;
};

const ensureFileDatabase = async () => {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await access(DB_FILE);
  } catch {
    await writeFile(DB_FILE, JSON.stringify(defaultFileDatabase(), null, 2), 'utf8');
  }
};

const readFileDatabase = async () => {
  await ensureFileDatabase();
  const raw = await readFile(DB_FILE, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
    };
  } catch {
    const fallback = defaultFileDatabase();
    await writeFile(DB_FILE, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
};

const writeFileDatabase = async (database) => {
  await ensureFileDatabase();
  await writeFile(DB_FILE, JSON.stringify(database, null, 2), 'utf8');
};

export const getDatabaseDriver = () => (USE_POSTGRES ? 'postgres' : 'file');

export const createUserRecord = ({
  email,
  displayName,
  role,
  plan,
  createdAt,
  apiKey = '',
  aiModel = DEFAULT_MODEL,
  passwordSalt,
  passwordHash,
}) => ({
  id: `acct-${randomUUID()}`,
  email,
  displayName,
  role,
  plan,
  createdAt,
  apiKey,
  aiModel,
  passwordSalt,
  passwordHash,
});

export const initDatabase = async () => {
  if (!USE_POSTGRES) {
    await ensureFileDatabase();
    return;
  }

  const activePool = createPool();
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL,
      plan TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      api_key TEXT NOT NULL DEFAULT '',
      ai_model TEXT NOT NULL DEFAULT '${DEFAULT_MODEL}',
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at BIGINT NOT NULL
    )
  `);
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      payload JSONB NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `);
  await activePool.query(`
    CREATE INDEX IF NOT EXISTS sessions_user_id_idx
    ON sessions(user_id)
  `);
};

export const hasAccounts = async () => {
  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    return database.users.length > 0;
  }

  const activePool = createPool();
  const result = await activePool.query('SELECT COUNT(*)::int AS count FROM users');
  return Number(result.rows[0]?.count || 0) > 0;
};

export const findUserByEmail = async (email) => {
  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    return mapUserRow(database.users.find((user) => user.email === email) || null);
  }

  const activePool = createPool();
  const result = await activePool.query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return mapUserRow(result.rows[0] || null);
};

export const createUser = async (user) => {
  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    database.users.push(user);
    await writeFileDatabase(database);
    return cloneJson(user);
  }

  const activePool = createPool();
  const result = await activePool.query(
    `
      INSERT INTO users (
        id,
        email,
        display_name,
        role,
        plan,
        created_at,
        api_key,
        ai_model,
        password_salt,
        password_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
    [
      user.id,
      user.email,
      user.displayName,
      user.role,
      user.plan,
      user.createdAt,
      user.apiKey || '',
      user.aiModel || DEFAULT_MODEL,
      user.passwordSalt,
      user.passwordHash,
    ]
  );

  return mapUserRow(result.rows[0]);
};

export const replaceSession = async ({ userId, token, createdAt }) => {
  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    database.sessions = database.sessions.filter((session) => session.userId !== userId);
    database.sessions.push({ token, userId, createdAt });
    await writeFileDatabase(database);
    return { token, userId, createdAt };
  }

  const activePool = createPool();
  await activePool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  await activePool.query(
    'INSERT INTO sessions (token, user_id, created_at) VALUES ($1, $2, $3)',
    [token, userId, createdAt]
  );
  return { token, userId, createdAt };
};

export const deleteSession = async (token) => {
  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    database.sessions = database.sessions.filter((session) => session.token !== token);
    await writeFileDatabase(database);
    return;
  }

  const activePool = createPool();
  await activePool.query('DELETE FROM sessions WHERE token = $1', [token]);
};

export const getAuthenticatedUserByToken = async (token) => {
  if (!token) return null;

  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    const session = database.sessions.find((item) => item.token === token);
    if (!session) return null;

    const user = database.users.find((item) => item.id === session.userId);
    if (!user) return null;

    return {
      token,
      session: cloneJson(session),
      user: mapUserRow(user),
    };
  }

  const activePool = createPool();
  const result = await activePool.query(
    `
      SELECT
        s.token AS session_token,
        s.user_id AS session_user_id,
        s.created_at AS session_created_at,
        u.*
      FROM sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token = $1
      LIMIT 1
    `,
    [token]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    token,
    session: {
      token: row.session_token,
      userId: row.session_user_id,
      createdAt: Number(row.session_created_at),
    },
    user: mapUserRow(row),
  };
};

export const updateUserProfile = async (userId, updates) => {
  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    const user = database.users.find((item) => item.id === userId);
    if (!user) return null;

    user.displayName = updates.displayName;
    await writeFileDatabase(database);
    return mapUserRow(user);
  }

  const activePool = createPool();
  const result = await activePool.query(
    'UPDATE users SET display_name = $2 WHERE id = $1 RETURNING *',
    [userId, updates.displayName]
  );
  return mapUserRow(result.rows[0] || null);
};

export const updateUserAISettings = async (userId, updates) => {
  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    const user = database.users.find((item) => item.id === userId);
    if (!user) return null;

    user.apiKey = updates.apiKey || '';
    user.aiModel = updates.aiModel || DEFAULT_MODEL;
    await writeFileDatabase(database);
    return mapUserRow(user);
  }

  const activePool = createPool();
  const result = await activePool.query(
    `
      UPDATE users
      SET api_key = $2, ai_model = $3
      WHERE id = $1
      RETURNING *
    `,
    [userId, updates.apiKey || '', updates.aiModel || DEFAULT_MODEL]
  );
  return mapUserRow(result.rows[0] || null);
};

export const getWorkspace = async (userId) => {
  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    const workspace = database.workspaces.find((item) => item.userId === userId);
    if (!workspace) return null;

    return {
      payload: cloneJson(workspace.payload),
      updatedAt: Number(workspace.updatedAt),
    };
  }

  const activePool = createPool();
  const result = await activePool.query(
    'SELECT payload, updated_at FROM workspaces WHERE user_id = $1 LIMIT 1',
    [userId]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    payload: cloneJson(row.payload),
    updatedAt: Number(row.updated_at),
  };
};

export const upsertWorkspace = async (userId, payload) => {
  const updatedAt = Date.now();

  if (!USE_POSTGRES) {
    const database = await readFileDatabase();
    const existingWorkspace = database.workspaces.find((item) => item.userId === userId);

    if (existingWorkspace) {
      existingWorkspace.payload = cloneJson(payload);
      existingWorkspace.updatedAt = updatedAt;
    } else {
      database.workspaces.push({
        userId,
        payload: cloneJson(payload),
        updatedAt,
      });
    }

    await writeFileDatabase(database);

    return {
      payload: cloneJson(payload),
      updatedAt,
    };
  }

  const activePool = createPool();
  const result = await activePool.query(
    `
      INSERT INTO workspaces (user_id, payload, updated_at)
      VALUES ($1, $2::jsonb, $3)
      ON CONFLICT (user_id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at
      RETURNING payload, updated_at
    `,
    [userId, JSON.stringify(payload), updatedAt]
  );

  return {
    payload: cloneJson(result.rows[0].payload),
    updatedAt: Number(result.rows[0].updated_at),
  };
};
