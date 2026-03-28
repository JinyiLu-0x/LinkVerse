import {
  clearCurrentUserAISettings,
  getCurrentUserAISettings,
  updateCurrentUserAISettings,
} from './auth';

const LOCAL_API_KEY_FALLBACK = 'PASTE_YOUR_GEMINI_API_KEY_HERE';
const DEFAULT_MODEL = 'gemini-2.5-flash';

type StoredAISettings = {
  apiKey?: string;
  model?: string;
};

type ResolvedAIConfig = {
  provider: 'gemini';
  providerLabel: 'Gemini';
  model: string;
  apiKey: string;
  localApiKeyFallback: string;
  missingConfigMessage: string;
  source: 'browser' | 'environment' | 'placeholder';
};

const runtimeProcessEnv =
  typeof globalThis !== 'undefined' && 'process' in globalThis
    ? (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    : undefined;

export const AI_CONFIG = {
  provider: 'gemini',
  providerLabel: 'Gemini',
  defaultModel: DEFAULT_MODEL,
  localApiKeyFallback: LOCAL_API_KEY_FALLBACK,
  missingConfigMessage:
    'AI is not configured yet. Set VITE_AI_API_KEY in .env.local, or keep using your existing GEMINI_API_KEY / API_KEY deployment config.',
} as const;

export const getStoredAISettings = (): StoredAISettings => {
  return getCurrentUserAISettings();
};

export const saveStoredAISettings = async (settings: StoredAISettings) => {
  return updateCurrentUserAISettings({
    apiKey: settings.apiKey,
    model: settings.model || DEFAULT_MODEL,
  });
};

export const clearStoredAISettings = async () => {
  return clearCurrentUserAISettings();
};

export const getResolvedAIConfig = (): ResolvedAIConfig => {
  const storedSettings = getStoredAISettings();
  const environmentApiKey =
    import.meta.env.VITE_AI_API_KEY ||
    runtimeProcessEnv?.GEMINI_API_KEY ||
    runtimeProcessEnv?.API_KEY ||
    '';
  const environmentModel =
    import.meta.env.VITE_AI_MODEL ||
    runtimeProcessEnv?.AI_MODEL ||
    DEFAULT_MODEL;

  const storedApiKey = storedSettings.apiKey?.trim() || '';
  const resolvedApiKey = storedApiKey || environmentApiKey || LOCAL_API_KEY_FALLBACK;
  const resolvedModel = storedSettings.model?.trim() || environmentModel || DEFAULT_MODEL;

  let source: ResolvedAIConfig['source'] = 'placeholder';
  if (storedApiKey) source = 'browser';
  else if (environmentApiKey) source = 'environment';

  return {
    provider: 'gemini',
    providerLabel: 'Gemini',
    model: resolvedModel,
    apiKey: resolvedApiKey,
    localApiKeyFallback: LOCAL_API_KEY_FALLBACK,
    missingConfigMessage: AI_CONFIG.missingConfigMessage,
    source,
  };
};

export const hasConfiguredAI = (config = getResolvedAIConfig()) => {
  const key = config.apiKey.trim();
  return key.length > 0 && key !== LOCAL_API_KEY_FALLBACK;
};
