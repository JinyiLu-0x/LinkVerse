export type AppLanguage = 'en' | 'zh-CN';

const LANGUAGE_STORAGE_KEY = 'linkverse-ui-language';

export const getStoredLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return 'en';
  const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return raw === 'zh-CN' ? 'zh-CN' : 'en';
};

export const saveStoredLanguage = (language: AppLanguage) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};

export const UI_TEXT = {
  en: {
    language: {
      label: 'Interface Language',
      hint: 'Applies immediately in this browser. You can change it again after sign-in.',
      browserHint: 'Saved locally for this browser.',
      english: 'English',
      chinese: '简体中文',
    },
    auth: {
      login: 'Log in',
      register: 'Create account',
      stepByStep: 'Step by step',
      welcomeBack: 'Welcome back.',
      createAccountTitle: 'Create your workspace account.',
      displayNamePrompt: 'What should we call this account',
      displayNamePlaceholder: 'Display name',
      emailPrompt: 'Type the email',
      emailPlaceholder: 'name@example.com',
      passwordPrompt: 'Choose the password',
      passwordPlaceholder: 'Password',
      passwordHelper: 'Use 6 characters or more.',
      confirmPasswordPrompt: 'Confirm the password',
      confirmPasswordPlaceholder: 'Repeat password',
      apiPrompt: 'Optional: store your AI key now',
      apiHelper: 'You can also skip this and fill it later in Settings.',
      apiKeyPlaceholder: 'AI API key',
      modelPlaceholder: 'Model',
      continue: 'Continue',
      createAccountButton: 'Create account',
      pleaseWait: 'Please wait...',
      passwordMismatch: 'Passwords do not match.',
      createAccountError: 'Could not create account.',
      signInError: 'Could not sign in.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage local AI access for this browser without editing source files.',
      aiAccess: 'AI Access',
      profile: 'Profile',
      appearance: 'Appearance',
      language: 'Language',
      aiAccessSetup: 'AI Access Setup',
      aiAccessHint:
        'Your key is stored with this local test account. Deployment environment variables still work as fallback.',
      usingAccountOverride: 'Using account override',
      usingEnvironment: 'Using deployment environment variable',
      notConfigured: 'Not configured yet',
      account: 'Account',
      displayName: 'Display Name',
      email: 'Email',
      saveProfile: 'Save Profile',
      signOut: 'Sign Out',
      currentUser: 'Current User',
      localAccountHint:
        'API settings below are attached to this local account, so your test users can hold different keys later.',
      apiKey: 'API Key',
      apiKeyPlaceholder: 'Paste your AI API key',
      show: 'Show',
      hide: 'Hide',
      apiKeyHint: 'Leave this empty if you want to keep using the deployment-provided key.',
      model: 'Model',
      modelHintPrefix: 'Default is',
      saveAISettings: 'Save AI Settings',
      clearBrowserOverride: 'Clear Browser Override',
      currentRuntime: 'Current Runtime',
      engine: 'Engine',
      keySource: 'Key Source',
      status: 'Status',
      missingApiKey: 'Missing API key',
      ready: 'Ready',
      profileUpdateFailed: 'Could not update profile.',
      profileUpdated: 'Profile updated.',
      aiSettingsSaved: 'AI settings saved for this account.',
      aiOverrideCleared: 'Account API override cleared. Falling back to deployment config.',
    },
    shell: {
      loadingWorkspace: 'Loading workspace...',
      cloudSyncUnavailable: 'Cloud sync is temporarily unavailable. Your local workspace is still here.',
      cloudSeedFailed:
        'Cloud sync could not seed this account yet. The starter workspace is ready locally.',
      cloudSaveFailed: 'Cloud sync failed. Changes still remain in this browser.',
      projectSaved: 'Project saved successfully',
      signOutConfirm: 'Sign out of this account now?',
      selectProject: 'Select a project',
      workInProgress: 'Work in progress...',
      workspaceSection: 'Workspace',
      workspace: 'Workspace',
      generator: 'Generator',
      knowledge: 'Knowledge',
      library: 'Library',
      social: 'Social',
      friends: 'Friends',
      team: 'Team',
      switchToDark: 'Switch to dark mode',
      switchToLight: 'Switch to light mode',
      signOutTitle: 'Sign out',
    },
    note: {
      startTyping: 'Start typing...',
      bold: 'Bold',
      italic: 'Italic',
      highlight: 'Highlight',
      image: 'Image',
    },
  },
  'zh-CN': {
    language: {
      label: '界面语言',
      hint: '在当前浏览器即时生效，登录后也可以随时再修改。',
      browserHint: '仅保存在当前浏览器。',
      english: 'English',
      chinese: '简体中文',
    },
    auth: {
      login: '登录',
      register: '创建账户',
      stepByStep: '分步引导',
      welcomeBack: '欢迎回来。',
      createAccountTitle: '创建你的工作区账户。',
      displayNamePrompt: '这个账户怎么称呼',
      displayNamePlaceholder: '显示名称',
      emailPrompt: '输入邮箱',
      emailPlaceholder: 'name@example.com',
      passwordPrompt: '设置密码',
      passwordPlaceholder: '密码',
      passwordHelper: '至少 6 个字符。',
      confirmPasswordPrompt: '确认密码',
      confirmPasswordPlaceholder: '再输一次密码',
      apiPrompt: '可选：现在保存 AI 密钥',
      apiHelper: '也可以先跳过，登录后在设置中再填写。',
      apiKeyPlaceholder: 'AI API 密钥',
      modelPlaceholder: '模型',
      continue: '继续',
      createAccountButton: '创建账户',
      pleaseWait: '请稍候...',
      passwordMismatch: '两次输入的密码不一致。',
      createAccountError: '无法创建账户。',
      signInError: '无法登录。',
    },
    settings: {
      title: '设置',
      subtitle: '无需修改源代码，即可为当前浏览器管理本地 AI 访问配置。',
      aiAccess: 'AI 访问',
      profile: '个人资料',
      appearance: '外观',
      language: '语言',
      aiAccessSetup: 'AI 访问设置',
      aiAccessHint: '密钥会保存到当前本地测试账户；部署环境变量仍可作为回退配置。',
      usingAccountOverride: '使用账户覆盖配置',
      usingEnvironment: '使用部署环境变量',
      notConfigured: '尚未配置',
      account: '账户',
      displayName: '显示名称',
      email: '邮箱',
      saveProfile: '保存资料',
      signOut: '退出登录',
      currentUser: '当前用户',
      localAccountHint: '下方 AI 配置会绑定到当前本地账户，便于后续为不同测试账户分别保存不同密钥。',
      apiKey: 'API 密钥',
      apiKeyPlaceholder: '粘贴你的 AI API 密钥',
      show: '显示',
      hide: '隐藏',
      apiKeyHint: '如果想继续使用部署环境提供的密钥，可以留空。',
      model: '模型',
      modelHintPrefix: '默认值为',
      saveAISettings: '保存 AI 设置',
      clearBrowserOverride: '清除浏览器覆盖配置',
      currentRuntime: '当前运行配置',
      engine: '引擎',
      keySource: '密钥来源',
      status: '状态',
      missingApiKey: '缺少 API 密钥',
      ready: '已就绪',
      profileUpdateFailed: '无法更新资料。',
      profileUpdated: '资料已更新。',
      aiSettingsSaved: 'AI 设置已保存到当前账户。',
      aiOverrideCleared: '已清除账户级 API 覆盖配置，现回退到部署配置。',
    },
    shell: {
      loadingWorkspace: '正在加载工作区...',
      cloudSyncUnavailable: '云同步暂时不可用，本地工作区仍已保留。',
      cloudSeedFailed: '云同步暂时无法为该账户初始化工作区，本地启动内容已就绪。',
      cloudSaveFailed: '云同步失败，变更仍保留在当前浏览器中。',
      projectSaved: '项目已保存。',
      signOutConfirm: '确认退出当前账户吗？',
      selectProject: '请选择一个项目',
      workInProgress: '功能建设中...',
      workspaceSection: '工作区',
      workspace: '工作区',
      generator: '生成器',
      knowledge: '知识',
      library: '资料库',
      social: '协作',
      friends: '好友',
      team: '团队',
      switchToDark: '切换到深色模式',
      switchToLight: '切换到浅色模式',
      signOutTitle: '退出登录',
    },
    note: {
      startTyping: '开始输入...',
      bold: '加粗',
      italic: '斜体',
      highlight: '高亮',
      image: '图片',
    },
  },
} as const;

export const getUIText = (language: AppLanguage) => UI_TEXT[language];

export const localizeAuthMessage = (message: string, language: AppLanguage) => {
  if (language === 'en') {
    return message;
  }

  const normalized = message.trim().toLowerCase();

  if (normalized === 'passwords do not match.') return '两次输入的密码不一致。';
  if (normalized === 'could not create account.') return '无法创建账户。';
  if (normalized === 'could not sign in.') return '无法登录。';
  if (normalized === 'incorrect email or password.') return '邮箱或密码不正确。';
  if (normalized === 'this email is already registered.') return '该邮箱已被注册。';
  if (normalized === 'request failed.') return '请求失败。';
  if (normalized === 'not authenticated.') return '当前未登录。';
  if (normalized.includes('email confirmation is required')) {
    return '账户已创建，但需要先完成邮箱验证后才能登录。';
  }
  if (normalized.includes('supabase database is not ready yet')) {
    return 'Supabase 数据库尚未就绪，请先执行初始化 SQL。';
  }

  return message;
};
