import type { User } from '@supabase/supabase-js';
import type { WorkspaceSnapshot } from './workspace.types';
import { SUPABASE_MISSING_MESSAGE, isSupabaseConfigured, supabase } from './supabase';

const AUTH_CURRENT_USER_KEY = 'linkverse-auth-current-user';
const AUTH_META_KEY = 'linkverse-auth-meta';
const AUTH_APPEARANCE_KEY = 'linkverse-auth-appearance';
const WORKSPACE_OWNER_KEY = 'linkverse-workspace-owner';
const DEFAULT_MODEL = 'gemini-2.5-flash';

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: 'Owner' | 'Member';
  plan: string;
  createdAt: number;
  apiKey?: string;
  aiModel?: string;
  initials: string;
  avatarUrl?: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
  plan: string | null;
  api_key: string | null;
  ai_model: string | null;
  workspace: WorkspaceSnapshot | null;
  created_at: string | null;
  updated_at: string | null;
};

type StoredAppearance = {
  avatarUrl?: string;
};

const readJsonStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Failed to read ${key}.`, error);
    return fallback;
  }
};

const writeJsonStorage = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const removeStorage = (key: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
};

const cacheCurrentUser = (user: SessionUser | null) => {
  if (!user) {
    removeStorage(AUTH_CURRENT_USER_KEY);
    return;
  }

  writeJsonStorage(AUTH_CURRENT_USER_KEY, user);
};

const cacheHasAccounts = (hasAccounts: boolean) => {
  writeJsonStorage(AUTH_META_KEY, { hasAccounts });
};

const getAppearanceStore = () =>
  readJsonStorage<Record<string, StoredAppearance>>(AUTH_APPEARANCE_KEY, {});

const getStoredAppearanceForUser = (userId: string): StoredAppearance => {
  return getAppearanceStore()[userId] || {};
};

const saveStoredAppearanceForUser = (userId: string, appearance: StoredAppearance) => {
  const nextStore = getAppearanceStore();

  if (appearance.avatarUrl?.trim()) {
    nextStore[userId] = {
      avatarUrl: appearance.avatarUrl.trim(),
    };
  } else {
    delete nextStore[userId];
  }

  writeJsonStorage(AUTH_APPEARANCE_KEY, nextStore);
};

const clearSessionCache = () => {
  removeStorage(AUTH_CURRENT_USER_KEY);
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toInitials = (displayName: string, email: string) => {
  const words = String(displayName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return String(email || 'LV').slice(0, 2).toUpperCase();
};

const normalizeErrorMessage = (message?: string) => {
  if (!message) return 'Request failed.';

  const lowered = message.toLowerCase();
  if (lowered.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (lowered.includes('user already registered')) {
    return 'This email is already registered.';
  }
  if (lowered.includes('new email should be different from the old email')) {
    return 'Use a different email address.';
  }
  if (lowered.includes('password should be at least') || lowered.includes('weak password')) {
    return 'Password is too weak.';
  }
  if (lowered.includes('same password') || lowered.includes('different from the old password')) {
    return 'Choose a different password.';
  }
  if (lowered.includes('reauthentication') || lowered.includes('secure password change')) {
    return 'Please sign in again before changing your password.';
  }
  if (
    lowered.includes('relation "public.profiles" does not exist') ||
    lowered.includes('could not find the table') ||
    lowered.includes('profiles')
  ) {
    return 'Supabase database is not ready yet. Run the SQL setup first.';
  }
  if (lowered.includes('email not confirmed')) {
    return 'This account has not confirmed its email yet.';
  }

  return message;
};

const ensureSupabase = () => {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      error: SUPABASE_MISSING_MESSAGE,
    };
  }

  return { client: supabase };
};

const mapProfileToSessionUser = (user: User, profile?: ProfileRow | null): SessionUser => {
  const email = profile?.email || user.email || '';
  const displayName =
    profile?.display_name ||
    (typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : '') ||
    email.split('@')[0] ||
    'Workspace member';
  const role = profile?.role === 'Owner' ? 'Owner' : 'Member';
  const plan = profile?.plan || 'Cloud';
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).getTime()
    : user.created_at
      ? new Date(user.created_at).getTime()
      : Date.now();
  const appearance = getStoredAppearanceForUser(user.id);

  return {
    id: user.id,
    email,
    displayName,
    role,
    plan,
    createdAt,
    apiKey: profile?.api_key || '',
    aiModel: profile?.ai_model || DEFAULT_MODEL,
    initials: toInitials(displayName, email),
    avatarUrl: appearance.avatarUrl || '',
  };
};

const upsertProfile = async ({
  user,
  displayName,
  apiKey,
  aiModel,
  workspace,
  email,
  role,
  plan,
}: {
  user: User;
  displayName?: string;
  apiKey?: string;
  aiModel?: string;
  workspace?: WorkspaceSnapshot;
  email?: string;
  role?: string;
  plan?: string;
}) => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return { error: ready.error || SUPABASE_MISSING_MESSAGE };
  }

  const cachedUser = getCurrentUser();

  const payload: Record<string, unknown> = {
    id: user.id,
    email: email?.trim() || user.email || '',
    display_name:
      displayName?.trim() ||
      (typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : '') ||
      user.email?.split('@')[0] ||
      'Workspace member',
    role: role || (cachedUser?.id === user.id ? cachedUser.role : 'Member'),
    plan: plan || (cachedUser?.id === user.id ? cachedUser.plan : 'Cloud'),
    api_key: apiKey?.trim() ?? (cachedUser?.id === user.id ? cachedUser.apiKey || '' : ''),
    ai_model: aiModel?.trim() ?? (cachedUser?.id === user.id ? cachedUser.aiModel || DEFAULT_MODEL : DEFAULT_MODEL),
  };

  if (workspace !== undefined) {
    payload.workspace = workspace;
  }

  const { data, error } = await ready.client
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    return {
      error: normalizeErrorMessage(error.message),
    };
  }

  return { profile: data as ProfileRow };
};

const fetchProfile = async (user: User) => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return { error: ready.error || SUPABASE_MISSING_MESSAGE };
  }

  const { data, error } = await ready.client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return {
      error: normalizeErrorMessage(error.message),
    };
  }

  if (data) {
    const authEmail = user.email || '';
    const profileDisplayName = data.display_name?.trim() || '';
    const authDisplayName =
      typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name.trim() : '';

    if (data.email === authEmail && profileDisplayName && (!authDisplayName || profileDisplayName === authDisplayName)) {
      return {
        profile: data as ProfileRow,
      };
    }

    return {
      ...(await upsertProfile({
        user,
        email: authEmail,
        displayName: profileDisplayName || authDisplayName,
        apiKey: data.api_key || '',
        aiModel: data.ai_model || DEFAULT_MODEL,
        workspace: data.workspace || undefined,
        role: data.role || 'Member',
        plan: data.plan || 'Cloud',
      })),
    };
  }

  return upsertProfile({ user });
};

const syncCurrentUserFromSession = async (user: User) => {
  const profileResult = await fetchProfile(user);
  if (profileResult.error) {
    return {
      error: profileResult.error,
    };
  }

  const sessionUser = mapProfileToSessionUser(user, profileResult.profile);
  cacheCurrentUser(sessionUser);
  cacheHasAccounts(true);

  return { user: sessionUser };
};

export const hasAnyLocalAccount = () =>
  readJsonStorage<{ hasAccounts: boolean }>(AUTH_META_KEY, { hasAccounts: false }).hasAccounts;

export const getCurrentUser = () =>
  readJsonStorage<SessionUser | null>(AUTH_CURRENT_USER_KEY, null);

export const hydrateAuthMeta = async () => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return hasAnyLocalAccount();
  }

  const {
    data: { session },
  } = await ready.client.auth.getSession();

  const hasAccounts = Boolean(session?.user || getCurrentUser());
  cacheHasAccounts(hasAccounts);
  return hasAccounts;
};

export const hydrateCurrentUser = async () => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return getCurrentUser();
  }

  const {
    data: { session },
    error,
  } = await ready.client.auth.getSession();

  if (error || !session?.user) {
    clearSessionCache();
    return null;
  }

  const result = await syncCurrentUserFromSession(session.user);
  if (result.error || !result.user) {
    console.warn(result.error || 'Could not sync user profile.');
    return getCurrentUser();
  }

  return result.user;
};

export const registerLocalAccount = async ({
  displayName,
  email,
  password,
  apiKey,
  aiModel,
  workspace,
}: {
  displayName: string;
  email: string;
  password: string;
  apiKey?: string;
  aiModel?: string;
  workspace?: WorkspaceSnapshot;
}) => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return { error: ready.error || SUPABASE_MISSING_MESSAGE };
  }

  const { data, error } = await ready.client.auth.signUp({
    email: normalizeEmail(email),
    password,
    options: {
      data: {
        display_name: displayName.trim(),
      },
    },
  });

  if (error) {
    return { error: normalizeErrorMessage(error.message) };
  }

  if (!data.user) {
    return { error: 'Could not create account.' };
  }

  if (!data.session) {
    cacheHasAccounts(true);
    return {
      error:
        'Account created, but email confirmation is required before logging in. You can disable Confirm email in Supabase Auth settings if you want instant sign-in.',
    };
  }

  const profileResult = await upsertProfile({
    user: data.user,
    displayName,
    apiKey,
    aiModel,
    workspace,
  });

  if (profileResult.error) {
    return { error: profileResult.error };
  }

  const sessionUser = mapProfileToSessionUser(data.user, profileResult.profile);
  cacheCurrentUser(sessionUser);
  cacheHasAccounts(true);

  return { user: sessionUser };
};

export const loginLocalAccount = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return { error: ready.error || SUPABASE_MISSING_MESSAGE };
  }

  const { data, error } = await ready.client.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (error || !data.user) {
    return { error: normalizeErrorMessage(error?.message) || 'Could not sign in.' };
  }

  const result = await syncCurrentUserFromSession(data.user);
  if (result.error || !result.user) {
    return { error: result.error || 'Could not load your profile.' };
  }

  return { user: result.user };
};

export const logoutLocalAccount = async () => {
  const ready = ensureSupabase();
  if (ready.client) {
    await ready.client.auth.signOut();
  }

  clearSessionCache();
};

export const updateCurrentUserProfile = async (updates: {
  displayName?: string;
}) => {
  const ready = ensureSupabase();
  if (!ready.client) return null;

  const {
    data: { session },
  } = await ready.client.auth.getSession();

  if (!session?.user) return null;

  const displayName = updates.displayName?.trim();
  if (!displayName) return null;
  const currentUser = getCurrentUser();

  await ready.client.auth.updateUser({
    data: {
      display_name: displayName,
    },
  });

  const profileResult = await upsertProfile({
    user: session.user,
    displayName,
    email: currentUser?.email,
    apiKey: currentUser?.apiKey,
    aiModel: currentUser?.aiModel,
    role: currentUser?.role,
    plan: currentUser?.plan,
  });

  if (profileResult.error) {
    return null;
  }

  const sessionUser = mapProfileToSessionUser(session.user, profileResult.profile);
  cacheCurrentUser(sessionUser);
  return sessionUser;
};

export const updateCurrentUserEmail = async (email: string) => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return { error: ready.error || SUPABASE_MISSING_MESSAGE };
  }

  const {
    data: { session },
  } = await ready.client.auth.getSession();

  if (!session?.user) {
    return { error: 'Not authenticated.' };
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return { error: 'Email is required.' };
  }

  const { data, error } = await ready.client.auth.updateUser({
    email: normalizedEmail,
  });

  if (error) {
    return { error: normalizeErrorMessage(error.message) };
  }

  const authUser = data.user || session.user;
  const pendingEmail =
    typeof (authUser as User & { new_email?: string }).new_email === 'string'
      ? (authUser as User & { new_email?: string }).new_email?.trim() || ''
      : '';

  if (pendingEmail && pendingEmail !== authUser.email) {
    return {
      pendingEmail,
    };
  }

  const currentUser = getCurrentUser();
  const profileResult = await upsertProfile({
    user: authUser,
    displayName: currentUser?.displayName,
    email: authUser.email || normalizedEmail,
    apiKey: currentUser?.apiKey,
    aiModel: currentUser?.aiModel,
    role: currentUser?.role,
    plan: currentUser?.plan,
  });

  if (profileResult.error) {
    return { error: profileResult.error };
  }

  const sessionUser = mapProfileToSessionUser(authUser, profileResult.profile);
  cacheCurrentUser(sessionUser);

  return {
    user: sessionUser,
  };
};

export const updateCurrentUserPassword = async ({
  currentPassword,
  password,
}: {
  currentPassword?: string;
  password: string;
}) => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return { error: ready.error || SUPABASE_MISSING_MESSAGE };
  }

  const normalizedPassword = password.trim();
  if (!normalizedPassword) {
    return { error: 'New password is required.' };
  }

  const payload: {
    password: string;
    current_password?: string;
  } = {
    password: normalizedPassword,
  };

  if (currentPassword?.trim()) {
    payload.current_password = currentPassword.trim();
  }

  const { error } = await ready.client.auth.updateUser(payload);

  if (error) {
    return { error: normalizeErrorMessage(error.message) };
  }

  return { success: true };
};

export const updateCurrentUserAvatar = (avatarUrl: string) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  saveStoredAppearanceForUser(currentUser.id, {
    avatarUrl,
  });

  const updatedUser: SessionUser = {
    ...currentUser,
    avatarUrl: avatarUrl.trim(),
  };

  cacheCurrentUser(updatedUser);
  return updatedUser;
};

export const getCurrentUserAISettings = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return {};

  return {
    apiKey: currentUser.apiKey || '',
    model: currentUser.aiModel || DEFAULT_MODEL,
  };
};

export const updateCurrentUserAISettings = async ({
  apiKey,
  model,
}: {
  apiKey?: string;
  model?: string;
}) => {
  const ready = ensureSupabase();
  if (!ready.client) return null;

  const {
    data: { session },
  } = await ready.client.auth.getSession();

  if (!session?.user) return null;

  const currentUser = getCurrentUser();
  const profileResult = await upsertProfile({
    user: session.user,
    displayName: currentUser?.displayName,
    apiKey,
    aiModel: model || DEFAULT_MODEL,
  });

  if (profileResult.error) {
    return null;
  }

  const sessionUser = mapProfileToSessionUser(session.user, profileResult.profile);
  cacheCurrentUser(sessionUser);
  return sessionUser;
};

export const clearCurrentUserAISettings = async () => {
  return updateCurrentUserAISettings({
    apiKey: '',
    model: DEFAULT_MODEL,
  });
};

export const getCachedWorkspaceOwnerId = () =>
  typeof window === 'undefined' ? '' : window.localStorage.getItem(WORKSPACE_OWNER_KEY) || '';

export const setCachedWorkspaceOwnerId = (userId: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WORKSPACE_OWNER_KEY, userId);
};

export const fetchWorkspaceSnapshot = async () => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return {
      error: ready.error || SUPABASE_MISSING_MESSAGE,
    };
  }

  const {
    data: { session },
  } = await ready.client.auth.getSession();

  if (!session?.user) {
    return {
      error: 'Not authenticated.',
    };
  }

  const profileResult = await fetchProfile(session.user);
  if (profileResult.error) {
    return { error: profileResult.error };
  }

  return {
    workspace: profileResult.profile?.workspace || null,
  };
};

export const saveWorkspaceSnapshot = async (workspace: WorkspaceSnapshot) => {
  const ready = ensureSupabase();
  if (!ready.client) {
    return {
      error: ready.error || SUPABASE_MISSING_MESSAGE,
    };
  }

  const {
    data: { session },
  } = await ready.client.auth.getSession();

  if (!session?.user) {
    return {
      error: 'Not authenticated.',
    };
  }

  const currentUser = getCurrentUser();
  const profileResult = await upsertProfile({
    user: session.user,
    displayName: currentUser?.displayName,
    apiKey: currentUser?.apiKey,
    aiModel: currentUser?.aiModel,
    workspace,
  });

  if (profileResult.error) {
    return { error: profileResult.error };
  }

  const sessionUser = mapProfileToSessionUser(session.user, profileResult.profile);
  cacheCurrentUser(sessionUser);

  return {
    workspace: profileResult.profile?.workspace || workspace,
  };
};
