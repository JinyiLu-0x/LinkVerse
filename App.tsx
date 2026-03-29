
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  Edge
} from 'reactflow';
import {
  createDefaultWorkspaceSnapshot,
  DATABASE_COLOR_SPECTRUM,
  getWorkspaceSnapshotFromState,
  normalizeWorkspaceSnapshot,
  useStore,
} from './store/useStore';
import BrandLogo from './components/BrandLogo';
import MindNode from './components/MindNode';
import { ProjectType, CopilotThread, Friend, Theme, DatabaseDefinition } from './types';
import {
  AI_CONFIG,
  clearStoredAISettings,
  getResolvedAIConfig,
  getStoredAISettings,
  saveStoredAISettings,
} from './ai.config';
import {
  getCurrentUser,
  getCachedWorkspaceOwnerId,
  hasAnyLocalAccount,
  fetchWorkspaceSnapshot,
  hydrateAuthMeta,
  hydrateCurrentUser,
  loginLocalAccount,
  logoutLocalAccount,
  registerLocalAccount,
  saveWorkspaceSnapshot,
  setCachedWorkspaceOwnerId,
  updateCurrentUserAvatar,
  updateCurrentUserEmail,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
  type SessionUser,
} from './auth';
import {
    getStoredLanguage,
    getUIText,
    localizeAuthMessage,
    saveStoredLanguage,
    type AppLanguage,
} from './i18n';

// --- Icons (Zinc/Gray styled) ---
const IconFile = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconDatabase = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IconUsers = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconUser = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPlus = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const IconMagic = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;
const IconHome = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const IconGraph = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Open Network Structure (Graph) - Mirrors Logo Logic */}
    <path d="M12 12V6" />
    <path d="M12 12l5 5" />
    <path d="M12 12l-5 5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="12" cy="5" r="2" />
    <circle cx="17" cy="17" r="2" />
    <circle cx="7" cy="17" r="2" />
  </svg>
);
const IconEdit = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconLink = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconSend = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconSidebar = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>;
const IconExternal = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>;
const IconX = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconGrid = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconList = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconMore = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
const IconTrash = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconShare = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IconCheck = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>;
const IconSave = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconDownload = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconImage = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconSettings = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconSun = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IconMoon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconFolder = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>;
const IconArrowRight = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const IconLayers = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const IconRefresh = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>;
const IconEye = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
const IconLogOut = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M13 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8"/></svg>;
const IconMail = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
const IconLock = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>;
const IconUpload = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></svg>;
const IconPalette = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22a1 1 0 0 0 1-1v-1a2 2 0 0 1 2-2h1a4 4 0 0 0 0-8h-1"/><path d="M8 18H6a4 4 0 0 1 0-8h1"/><path d="M12 2a10 10 0 1 0 0 20"/><circle cx="8.5" cy="8.5" r=".5" fill="currentColor"/><circle cx="15.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="16.5" cy="14.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="14.5" r=".5" fill="currentColor"/></svg>;

// --- Components ---

const AuthCursor = ({ tone = 'default' }: { tone?: 'default' | 'strong' }) => (
    <span
        aria-hidden="true"
        className={`auth-cursor ${tone === 'strong' ? 'auth-cursor--strong' : ''}`}
    />
);

const AuthLoopingTitle = ({
    text,
    animate,
}: {
    text: string,
    animate: boolean,
}) => {
    const [visibleLength, setVisibleLength] = useState(animate ? 0 : text.length);
    const [direction, setDirection] = useState<1 | -1>(1);

    useEffect(() => {
        if (!animate) {
            setVisibleLength(text.length);
            setDirection(1);
            return;
        }

        setVisibleLength(0);
        setDirection(1);
    }, [animate, text]);

    useEffect(() => {
        if (!animate) {
            return;
        }

        let delay = direction === 1 ? 54 : 34;

        if (direction === 1 && visibleLength === 0) {
            delay = 280;
        } else if (direction === 1 && visibleLength >= text.length) {
            delay = 1200;
        } else if (direction === -1 && visibleLength === 0) {
            delay = 320;
        }

        const timer = window.setTimeout(() => {
            if (direction === 1) {
                if (visibleLength < text.length) {
                    setVisibleLength((current) => Math.min(current + 1, text.length));
                    return;
                }

                setDirection(-1);
                return;
            }

            if (visibleLength > 0) {
                setVisibleLength((current) => Math.max(current - 1, 0));
                return;
            }

            setDirection(1);
        }, delay);

        return () => window.clearTimeout(timer);
    }, [animate, direction, text, visibleLength]);

    return (
        <span className="inline-flex items-end gap-1 whitespace-pre-wrap break-words">
            <span>{text.slice(0, visibleLength)}</span>
            {animate && <AuthCursor tone="strong" />}
        </span>
    );
};

const AuthField = ({
    step,
    prompt,
    active,
    helper,
    children,
}: {
    step: string,
    prompt: string,
    active?: boolean,
    helper?: string,
    children: React.ReactNode,
}) => (
    <div className="auth-step rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/70 p-4">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center justify-center">
                {step}
            </div>
            <div className="min-w-0 flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {prompt}
                {active && <AuthCursor />}
            </div>
        </div>
        {children}
        {helper && <p className="mt-2 text-xs text-zinc-400">{helper}</p>}
    </div>
);

const LanguageToggle = ({
    language,
    onChange,
    label,
    hint,
}: {
    language: AppLanguage,
    onChange: (language: AppLanguage) => void,
    label?: string,
    hint?: string,
}) => {
    const copy = getUIText(language);

    return (
        <div className="space-y-2">
            {label && <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</div>}
            <div className="inline-flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                <button
                    type="button"
                    onClick={() => onChange('en')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        language === 'en'
                            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100'
                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                >
                    {copy.language.english}
                </button>
                <button
                    type="button"
                    onClick={() => onChange('zh-CN')}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        language === 'zh-CN'
                            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100'
                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                >
                    {copy.language.chinese}
                </button>
            </div>
            {hint && <p className="text-xs text-zinc-400">{hint}</p>}
        </div>
    );
};

type SettingsSectionId = 'profile' | 'account' | 'appearance' | 'language' | 'ai';

const AVATAR_EXPORT_SIZE = 256;

const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.readAsDataURL(file);
    });

const loadImageElement = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Could not load image.'));
        image.src = src;
    });

const prepareAvatarDataUrl = async (file: File) => {
    const rawDataUrl = await readFileAsDataUrl(file);
    const image = await loadImageElement(rawDataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_EXPORT_SIZE;
    canvas.height = AVATAR_EXPORT_SIZE;

    const context = canvas.getContext('2d');
    if (!context) {
        return rawDataUrl;
    }

    const scale = Math.max(
        AVATAR_EXPORT_SIZE / image.width,
        AVATAR_EXPORT_SIZE / image.height
    );
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const offsetX = (AVATAR_EXPORT_SIZE - scaledWidth) / 2;
    const offsetY = (AVATAR_EXPORT_SIZE - scaledHeight) / 2;

    context.fillStyle = '#f4f4f5';
    context.fillRect(0, 0, AVATAR_EXPORT_SIZE, AVATAR_EXPORT_SIZE);
    context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    return canvas.toDataURL('image/jpeg', 0.88);
};

const AvatarBadge = ({
    avatarUrl,
    initials,
    name,
    className = '',
    textClassName = '',
}: {
    avatarUrl?: string,
    initials: string,
    name: string,
    className?: string,
    textClassName?: string,
}) => {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className={`object-cover ${className}`}
            />
        );
    }

    return (
        <div
            className={`flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 ${textClassName} ${className}`}
        >
            {initials}
        </div>
    );
};

const SettingsSectionButton = ({
    active,
    icon,
    title,
    collapsed,
    onClick,
}: {
    active: boolean,
    icon: React.ReactNode,
    title: string,
    collapsed?: boolean,
    onClick: () => void,
}) => (
    <button
        type="button"
        onClick={onClick}
        title={collapsed ? title : undefined}
        aria-label={title}
        aria-pressed={active}
        className={`group relative ${
            collapsed
                ? 'mx-auto flex h-12 w-12 items-center justify-center rounded-2xl transition-all'
                : 'flex w-full items-center rounded-2xl px-3.5 py-2.5 text-left text-sm font-medium transition-all'
        } ${
            active
                ? `${SOFT_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-50`
                : collapsed
                    ? `border border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`
                    : `border border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`
        }`}
    >
        {collapsed && (
            <span
                className={`absolute -left-3 h-6 w-1 rounded-r-full transition-all ${
                    active
                        ? 'bg-zinc-300 opacity-100 dark:bg-white/[0.32]'
                        : 'bg-zinc-300 opacity-0 group-hover:opacity-60 dark:bg-zinc-600'
                }`}
            />
        )}
        <div
            className={`flex items-center ${
                collapsed ? 'justify-center' : 'w-full gap-3'
            }`}
        >
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active
                        ? 'bg-white/[0.7] text-current dark:bg-white/[0.08]'
                        : 'text-zinc-400 dark:text-zinc-500'
                }`}
            >
                {icon}
            </div>
            {!collapsed && (
                <>
                    <div className="min-w-0 flex-1 truncate">{title}</div>
                    {active && <div className="h-2 w-2 rounded-full bg-current opacity-70" />}
                </>
            )}
        </div>
    </button>
);

const SettingsCard = ({
    title,
    description,
    children,
}: {
    title: string,
    description: string,
    children: React.ReactNode,
}) => (
    <section>
        <div className="mb-6">
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
        <div className="space-y-8">{children}</div>
    </section>
);

const SettingsDivider = () => <div className="border-t border-zinc-200 dark:border-white/[0.08]" />;

const SOFT_ACTIVE_SURFACE =
    'border border-zinc-200/80 bg-white/[0.76] shadow-[0_16px_38px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.08] dark:shadow-[0_14px_30px_rgba(0,0,0,0.18)]';

const SOFT_HOVER_SURFACE =
    'hover:border-zinc-200/80 hover:bg-white/[0.64] dark:hover:border-white/[0.08] dark:hover:bg-white/[0.06]';

const DATABASE_RAIL_ACTIVE_SURFACE =
    'border-zinc-200/80 bg-white/[0.88] shadow-[0_16px_34px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-[0_14px_28px_rgba(0,0,0,0.16)]';

const DATABASE_RAIL_HOVER_SURFACE =
    'hover:border-zinc-200/70 hover:bg-white/[0.72] dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]';

type DatabaseDraft = {
    mode: 'create' | 'edit',
    originalName?: string,
    name: string,
    color: string,
    iconType: DatabaseDefinition['iconType'],
    emoji: string,
};

const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '').trim();
    const full = normalized.length === 3
        ? normalized.split('').map((char) => `${char}${char}`).join('')
        : normalized;

    if (full.length !== 6) {
        return `rgba(99, 102, 241, ${alpha})`;
    }

    const value = Number.parseInt(full, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getDatabaseInteractionStyle = (
    color: string,
    state: 'rest' | 'hover' | 'selected'
): React.CSSProperties => {
    if (state === 'selected') {
        return {
            borderColor: hexToRgba(color, 0.18),
            boxShadow: '0 16px 34px rgba(15, 23, 42, 0.05)',
        };
    }

    if (state === 'hover') {
        return {
            borderColor: hexToRgba(color, 0.12),
        };
    }

    return {};
};

const getDatabaseBadgeStyle = (
    color: string,
    emphasis: 'soft' | 'medium' = 'soft'
): React.CSSProperties => ({
    backgroundColor: hexToRgba(color, emphasis === 'medium' ? 0.14 : 0.1),
    borderColor: hexToRgba(color, emphasis === 'medium' ? 0.24 : 0.16),
    color,
});

const createDatabaseDraft = (
    database?: DatabaseDefinition,
    mode: 'create' | 'edit' = 'create'
): DatabaseDraft => ({
    mode,
    originalName: database?.name,
    name: database?.name || '',
    color: database?.color || DATABASE_COLOR_SPECTRUM[0],
    iconType: database?.iconType || 'folder',
    emoji: database?.emoji || '✨',
});

const DatabaseGlyph = ({
    database,
    className = '',
    textClassName = '',
}: {
    database?: DatabaseDefinition | null,
    className?: string,
    textClassName?: string,
}) => {
    if (database?.iconType === 'emoji' && database.emoji) {
        return <span className={textClassName}>{database.emoji}</span>;
    }

    return <IconFolder className={className} />;
};

const markdownTokenPattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

const renderInlineMarkdown = (text: string) => {
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    for (const match of text.matchAll(markdownTokenPattern)) {
        const matchIndex = match.index ?? 0;

        if (matchIndex > lastIndex) {
            nodes.push(text.slice(lastIndex, matchIndex));
        }

        if (match[1] && match[2]) {
            nodes.push(
                <a
                    key={`md-link-${key++}`}
                    href={match[2]}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition-colors hover:text-indigo-500 dark:text-indigo-300 dark:decoration-indigo-500/40"
                >
                    {match[1]}
                </a>
            );
        } else if (match[3]) {
            nodes.push(
                <code
                    key={`md-code-${key++}`}
                    className="rounded-md bg-zinc-950 px-1.5 py-0.5 font-mono text-[11px] text-zinc-100 dark:bg-zinc-800 dark:text-zinc-200"
                >
                    {match[3]}
                </code>
            );
        } else if (match[4]) {
            nodes.push(
                <strong
                    key={`md-strong-${key++}`}
                    className="font-semibold text-zinc-950 dark:text-white"
                >
                    {match[4]}
                </strong>
            );
        } else if (match[5]) {
            nodes.push(
                <em key={`md-em-${key++}`} className="italic text-zinc-700 dark:text-zinc-200">
                    {match[5]}
                </em>
            );
        }

        lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }

    return nodes.length > 0 ? nodes : text;
};

const ChatMarkdown = ({ content }: { content: string }) => {
    const lines = content.replace(/\r/g, '').split('\n');
    const blocks: React.ReactNode[] = [];
    let cursor = 0;
    let key = 0;

    const isBulletLine = (line: string) => /^[-*]\s+/.test(line);
    const isNumberedLine = (line: string) => /^\d+\.\s+/.test(line);
    const isHeadingLine = (line: string) => /^#{1,3}\s+/.test(line);
    const isQuoteLine = (line: string) => /^>\s?/.test(line);
    const isBlockStart = (line: string) =>
        isBulletLine(line) || isNumberedLine(line) || isHeadingLine(line) || isQuoteLine(line);

    while (cursor < lines.length) {
        const currentLine = lines[cursor];
        const trimmed = currentLine.trim();

        if (!trimmed) {
            cursor += 1;
            continue;
        }

        if (isHeadingLine(trimmed)) {
            const level = Math.min((trimmed.match(/^#+/)?.[0].length || 1), 3);
            const text = trimmed.replace(/^#{1,3}\s+/, '');
            const headingClass =
                level === 1
                    ? 'text-sm font-semibold tracking-tight text-zinc-950 dark:text-white'
                    : level === 2
                      ? 'text-[13px] font-semibold text-zinc-900 dark:text-zinc-100'
                      : 'text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400';

            blocks.push(
                <h4 key={`md-heading-${key++}`} className={headingClass}>
                    {renderInlineMarkdown(text)}
                </h4>
            );
            cursor += 1;
            continue;
        }

        if (isBulletLine(trimmed)) {
            const items: string[] = [];
            while (cursor < lines.length && isBulletLine(lines[cursor].trim())) {
                items.push(lines[cursor].trim().replace(/^[-*]\s+/, ''));
                cursor += 1;
            }

            blocks.push(
                <ul key={`md-ul-${key++}`} className="space-y-2 pl-5 text-[13px] leading-6 text-zinc-700 dark:text-zinc-200 list-disc marker:text-zinc-400 dark:marker:text-zinc-500">
                    {items.map((item, itemIndex) => (
                        <li key={`md-ul-item-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
                    ))}
                </ul>
            );
            continue;
        }

        if (isNumberedLine(trimmed)) {
            const items: string[] = [];
            while (cursor < lines.length && isNumberedLine(lines[cursor].trim())) {
                items.push(lines[cursor].trim().replace(/^\d+\.\s+/, ''));
                cursor += 1;
            }

            blocks.push(
                <ol key={`md-ol-${key++}`} className="space-y-2 pl-5 text-[13px] leading-6 text-zinc-700 dark:text-zinc-200 list-decimal marker:text-zinc-400 dark:marker:text-zinc-500">
                    {items.map((item, itemIndex) => (
                        <li key={`md-ol-item-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
                    ))}
                </ol>
            );
            continue;
        }

        if (isQuoteLine(trimmed)) {
            const quoteLines: string[] = [];
            while (cursor < lines.length && isQuoteLine(lines[cursor].trim())) {
                quoteLines.push(lines[cursor].trim().replace(/^>\s?/, ''));
                cursor += 1;
            }

            blocks.push(
                <blockquote
                    key={`md-quote-${key++}`}
                    className="border-l-2 border-zinc-200 pl-4 text-[13px] leading-6 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                >
                    {renderInlineMarkdown(quoteLines.join(' '))}
                </blockquote>
            );
            continue;
        }

        const paragraphLines: string[] = [];
        while (cursor < lines.length) {
            const paragraphLine = lines[cursor];
            if (!paragraphLine.trim()) {
                break;
            }
            if (paragraphLines.length > 0 && isBlockStart(paragraphLine.trim())) {
                break;
            }
            paragraphLines.push(paragraphLine.trim());
            cursor += 1;
        }

        blocks.push(
            <p key={`md-p-${key++}`} className="text-[13px] leading-6 text-zinc-700 dark:text-zinc-200">
                {renderInlineMarkdown(paragraphLines.join(' '))}
            </p>
        );
    }

    return <div className="space-y-3">{blocks}</div>;
};

const formatCopilotThreadTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

const buildCopilotShareText = (projectTitle: string, thread: CopilotThread) => {
    const transcript = thread.messages
        .map((message) => {
            const speaker = message.role === 'user' ? 'You' : 'Copilot';
            const time = new Date(message.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
            return `**${speaker}** (${time})\n${message.text}`;
        })
        .join('\n\n');

    return `# ${projectTitle}\n\n## ${thread.title}\n\n${transcript}`;
};

const AuthView = ({
    onAuthenticated,
    hasAccounts,
    onHasAccountsChange,
    language,
    onLanguageChange,
}: {
    onAuthenticated: (user: SessionUser) => void,
    hasAccounts: boolean,
    onHasAccountsChange: (hasAccounts: boolean) => void,
    language: AppLanguage,
    onLanguageChange: (language: AppLanguage) => void,
}) => {
    const copy = getUIText(language);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState(AI_CONFIG.defaultModel);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            if (mode === 'register') {
                if (password !== confirmPassword) {
                    setErrorMessage(copy.auth.passwordMismatch);
                    return;
                }

                const result = await registerLocalAccount({
                    displayName,
                    email,
                    password,
                    apiKey,
                    aiModel: model,
                    workspace: createDefaultWorkspaceSnapshot(),
                });

                if (result.error || !result.user) {
                    setErrorMessage(localizeAuthMessage(result.error || copy.auth.createAccountError, language));
                    return;
                }

                onHasAccountsChange(true);
                onAuthenticated(result.user);
                return;
            }

            const result = await loginLocalAccount({ email, password });
            if (result.error || !result.user) {
                setErrorMessage(localizeAuthMessage(result.error || copy.auth.signInError, language));
                return;
            }

            onAuthenticated(result.user);
        } finally {
            setIsSubmitting(false);
        }
    };

    const showEmailStep = mode === 'login' || Boolean(displayName.trim());
    const showPasswordStep = Boolean(email.trim());
    const showConfirmStep = mode === 'register' && Boolean(password.trim());
    const showApiStep = mode === 'register' && Boolean(confirmPassword.trim());
    const hasStartedForm = Boolean(
        displayName.trim() ||
        email.trim() ||
        password.trim() ||
        confirmPassword.trim() ||
        apiKey.trim()
    );

    return (
        <div className="h-screen w-screen overflow-y-auto bg-[linear-gradient(180deg,#f7f7f8_0%,#ffffff_100%)] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            <div className="min-h-full px-5 py-8 sm:px-8 sm:py-12 flex items-start justify-center sm:items-center">
                <div className="w-full max-w-xl">
                    <div className="rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-white/92 dark:bg-zinc-900/92 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-6 sm:p-8">
                        <div className="mb-7 flex items-center gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm">
                                    <BrandLogo className="w-5 h-5" />
                                </div>
                                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">LinkVerse</div>
                            </div>
                            <div className="ml-auto">
                                <LanguageToggle language={language} onChange={onLanguageChange} />
                            </div>
                        </div>

                        <div className="flex gap-2 mb-8 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                            <button
                                onClick={() => setMode('login')}
                                disabled={isSubmitting}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                            >
                                {copy.auth.login}
                            </button>
                            <button
                                onClick={() => setMode('register')}
                                disabled={isSubmitting}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${mode === 'register' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}
                            >
                                {copy.auth.register}
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-400 mb-3">{copy.auth.stepByStep}</div>
                            <h1 className="text-3xl sm:text-[2rem] leading-tight font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                                <AuthLoopingTitle
                                    key={`auth-title-${mode}`}
                                    text={mode === 'login' ? copy.auth.welcomeBack : copy.auth.createAccountTitle}
                                    animate={!hasStartedForm}
                                />
                            </h1>
                        </div>

                        {errorMessage && (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'register' && (
                                <AuthField
                                    step="01"
                                    prompt={copy.auth.displayNamePrompt}
                                    active={!displayName.trim()}
                                >
                                    <input
                                        className="w-full px-3 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder={copy.auth.displayNamePlaceholder}
                                        disabled={isSubmitting}
                                    />
                                </AuthField>
                            )}

                            {showEmailStep && (
                                <AuthField
                                    step={mode === 'login' ? '01' : '02'}
                                    prompt={copy.auth.emailPrompt}
                                    active={Boolean((mode === 'login' ? !email.trim() : displayName.trim() && !email.trim()))}
                                >
                                    <input
                                        type="email"
                                        className="w-full px-3 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={copy.auth.emailPlaceholder}
                                        autoComplete="email"
                                        disabled={isSubmitting}
                                    />
                                </AuthField>
                            )}

                            {showPasswordStep && (
                                <AuthField
                                    step={mode === 'login' ? '02' : '03'}
                                    prompt={copy.auth.passwordPrompt}
                                    active={Boolean(email.trim() && !password.trim())}
                                    helper={copy.auth.passwordHelper}
                                >
                                    <input
                                        type="password"
                                        className="w-full px-3 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={copy.auth.passwordPlaceholder}
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                        disabled={isSubmitting}
                                    />
                                </AuthField>
                            )}

                            {showConfirmStep && (
                                <AuthField
                                    step="04"
                                    prompt={copy.auth.confirmPasswordPrompt}
                                    active={Boolean(password.trim() && !confirmPassword.trim())}
                                >
                                    <input
                                        type="password"
                                        className="w-full px-3 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={copy.auth.confirmPasswordPlaceholder}
                                        autoComplete="new-password"
                                        disabled={isSubmitting}
                                    />
                                </AuthField>
                            )}

                            {showApiStep && (
                                <AuthField
                                    step="05"
                                    prompt={copy.auth.apiPrompt}
                                    active={!apiKey.trim()}
                                    helper={copy.auth.apiHelper}
                                >
                                    <div className="space-y-3">
                                        <input
                                            type="password"
                                            className="w-full px-3 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder={copy.auth.apiKeyPlaceholder}
                                            disabled={isSubmitting}
                                        />
                                        <input
                                            className="w-full px-3 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm"
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            placeholder={copy.auth.modelPlaceholder}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </AuthField>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
                            >
                                {isSubmitting ? copy.auth.pleaseWait : mode === 'login' ? copy.auth.continue : copy.auth.createAccountButton}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 right-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-[100] animate-bounce-in flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-green-400 dark:text-green-600" />
            {message}
        </div>
    );
};

const DatabaseMenu = ({ tag, onRename, onDelete, onShare, language }: any) => {
    const copy = getUIText(language);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-400 transition-all"
            >
                <IconMore className="w-3.5 h-3.5" />
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-6 w-32 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 py-1 overflow-hidden">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onShare(tag); }}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <IconShare className="w-3 h-3" /> {copy.common.share}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onRename(tag); }}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <IconEdit className="w-3 h-3" /> {copy.common.edit}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(tag); }}
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                            <IconTrash className="w-3 h-3" /> {copy.common.delete}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const ProjectMenu = ({ project, onRename, onDelete, onShare, language }: any) => {
    const copy = getUIText(language);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
            >
                <IconMore />
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }} 
                    />
                    <div className="absolute right-0 top-6 min-w-[150px] bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 py-1 overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onShare(project);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 whitespace-nowrap"
                        >
                            <IconShare className="w-3.5 h-3.5" /> {copy.common.share}
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onRename(project);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 whitespace-nowrap"
                        >
                            <IconEdit className="w-3.5 h-3.5" /> {copy.common.rename}
                        </button>
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onDelete(project.id);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 whitespace-nowrap"
                        >
                            <IconTrash className="w-3.5 h-3.5" /> {copy.common.delete}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const ProjectCard = ({ project, onClick, onRename, onDelete, onShare, language }: any) => {
    let Icon = IconFile;
    let bgColor = 'bg-zinc-100 dark:bg-zinc-800';
    let textColor = 'text-zinc-600 dark:text-zinc-400';
    let decoColor = 'bg-zinc-200 dark:bg-zinc-800';
    
    if (project.type === 'graph') {
        Icon = IconGraph;
        bgColor = 'bg-blue-50 dark:bg-blue-900/30';
        textColor = 'text-blue-700 dark:text-blue-300';
        decoColor = 'bg-blue-100 dark:bg-blue-900/20';
    } else if (project.type === 'note') {
        Icon = IconEdit;
        bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
        textColor = 'text-yellow-700 dark:text-yellow-300';
        decoColor = 'bg-yellow-100 dark:bg-yellow-900/20';
    } else if (project.type === 'resource') {
        Icon = IconLink;
        bgColor = 'bg-emerald-50 dark:bg-emerald-900/30';
        textColor = 'text-emerald-700 dark:text-emerald-300';
        decoColor = 'bg-emerald-100 dark:bg-emerald-900/20';
    }

    const displayTags = project.databaseTags;

    return (
        <div 
            onClick={onClick}
            className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer h-40 relative"
        >
             <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                 <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                     <div className={`w-24 h-24 rounded-full ${decoColor}`} />
                 </div>
             </div>

             <div className="relative z-10 flex flex-col h-full p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg ${bgColor} ${textColor} flex items-center justify-center`}>
                        <Icon />
                    </div>
                    <div className="flex items-center gap-1 z-20">
                        <ProjectMenu 
                            project={project}
                            onRename={onRename}
                            onDelete={onDelete}
                            onShare={onShare}
                            language={language}
                        />
                    </div>
                </div>
                
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mb-1 truncate pr-4">{project.title}</h3>
                <div className="flex gap-1 mb-2 overflow-hidden flex-wrap h-6 content-start">
                    {displayTags.slice(0, 3).map((t: string) => (
                        <span
                            key={t}
                            className="inline-flex items-center whitespace-nowrap rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
                        >
                            {t}
                        </span>
                    ))}
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-auto truncate">{project.updatedAt}</p>
             </div>
        </div>
    );
};

const ProjectRow = ({ project, onClick, onRename, onDelete, onShare, language }: any) => {
    let Icon = IconFile;
    let bgColor = 'bg-zinc-50 dark:bg-zinc-800';
    let textColor = 'text-zinc-500 dark:text-zinc-400';
    if (project.type === 'graph') Icon = IconGraph;
    if (project.type === 'graph') {
        bgColor = 'bg-blue-50 dark:bg-blue-900/30';
        textColor = 'text-blue-600 dark:text-blue-300';
    } else if (project.type === 'note') {
        Icon = IconEdit;
        bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
        textColor = 'text-yellow-600 dark:text-yellow-300';
    } else if (project.type === 'resource') {
        Icon = IconLink;
        bgColor = 'bg-emerald-50 dark:bg-emerald-900/30';
        textColor = 'text-emerald-600 dark:text-emerald-300';
    }

    return (
        <div 
            onClick={onClick}
            className="group flex items-center p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all cursor-pointer relative"
        >
            <div className={`p-2 rounded-lg mr-3 transition-colors ${bgColor} ${textColor}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{project.title}</h3>
            </div>
            <div className="hidden md:flex gap-2 mr-4">
                {project.databaseTags.map((t: string) => (
                    <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
                    >
                        {t}
                    </span>
                ))}
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-600 mr-4 w-24 text-right">{project.updatedAt}</div>
            <div className="z-10 relative">
                <ProjectMenu 
                    project={project}
                    onRename={onRename}
                    onDelete={onDelete}
                    onShare={onShare}
                    language={language}
                />
            </div>
        </div>
    );
};

const NodeEditModal = () => {
    const editingNodeId = useStore(s => s.editingNodeId);
    const setEditingNode = useStore(s => s.setEditingNode);
    const nodes = useStore(s => s.nodes);
    const updateNodeData = useStore(s => s.updateNodeData);

    const node = useMemo(() => nodes.find(n => n.id === editingNodeId), [nodes, editingNodeId]);
    const [label, setLabel] = useState('');
    const [summary, setSummary] = useState('');

    useEffect(() => {
        if (node) { setLabel(node.data.label || ''); setSummary(node.data.summary || ''); }
    }, [node]);

    if (!editingNodeId || !node) return null;

    const handleSave = () => {
        updateNodeData(editingNodeId, { label, summary });
        setEditingNode(null);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100">Edit Concept</h3>
                    <button onClick={() => setEditingNode(null)} className="text-zinc-400 hover:text-zinc-600"><IconX /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Concept Name</label>
                        <input className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-zinc-900 dark:text-zinc-100" value={label} onChange={e => setLabel(e.target.value)} autoFocus />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
                        <textarea className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-zinc-900 dark:text-zinc-100 resize-none" rows={4} value={summary} onChange={e => setSummary(e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setEditingNode(null)} className="px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm">Save Changes</button>
                </div>
             </div>
        </div>
    );
};

const EdgeLabelModal = ({ edge, onClose }: { edge: Edge, onClose: () => void }) => {
    const updateEdgeLabel = useStore(s => s.updateEdgeLabel);
    const deleteEdge = useStore(s => s.deleteEdge);
    const [label, setLabel] = useState(edge.label as string || '');

    const handleSave = () => {
        updateEdgeLabel(edge.id, label);
        onClose();
    };

    const handleDelete = () => {
        deleteEdge(edge.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm p-5 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">Edit Connection</h3>
                <input 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-4 text-zinc-900 dark:text-zinc-100" 
                    placeholder="Describe relationship..."
                    value={label} 
                    onChange={e => setLabel(e.target.value)} 
                    autoFocus 
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <div className="flex justify-between">
                    <button onClick={handleDelete} className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-1"><IconTrash className="w-3 h-3" /> Delete Line</button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg">Save</button>
                    </div>
                </div>
             </div>
        </div>
    );
};

const NewProjectModal = ({ onClose }: { onClose: () => void }) => {
    const createProject = useStore(s => s.createProject);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ProjectType>('graph');
    const [url, setUrl] = useState('');

    const handleSubmit = async () => {
        if (!title) return;
        await createProject(title, type, url);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Create New</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                  <button onClick={() => setType('graph')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${type === 'graph' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}><IconGraph /><span className="text-xs font-medium">Mind Graph</span></button>
                  <button onClick={() => setType('note')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${type === 'note' ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 text-yellow-700 dark:text-yellow-300' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}><IconEdit /><span className="text-xs font-medium">Note</span></button>
                  <button onClick={() => setType('resource')} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${type === 'resource' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}><IconLink /><span className="text-xs font-medium">Resource</span></button>
              </div>
              <div className="space-y-4">
                 <div><label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Title</label><input className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-zinc-900 dark:text-zinc-100" placeholder="Project Name" value={title} onChange={e => setTitle(e.target.value)} autoFocus /></div>
                 {type === 'resource' && (
                     <div><label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">URL</label><input className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-zinc-900 dark:text-zinc-100" placeholder="https://example.com/research-notes" value={url} onChange={e => setUrl(e.target.value)} /></div>
                 )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                 <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
                 <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm">Create</button>
              </div>
           </div>
        </div>
    );
};

const RenameModal = ({ project, onClose, language }: { project: any, onClose: () => void, language: AppLanguage }) => {
    const copy = getUIText(language);
    const updateTitle = useStore(s => s.updateProjectTitle);
    const [title, setTitle] = useState(project.title);

    const handleSubmit = () => {
        if (title.trim()) {
            updateTitle(project.id, title);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm p-5 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100 mb-4">{copy.common.rename}</h3>
                <input className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-4 text-zinc-900 dark:text-zinc-100" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">{copy.common.cancel}</button>
                    <button onClick={handleSubmit} className="px-3 py-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg">{copy.common.save}</button>
                </div>
            </div>
        </div>
    );
};

const ShareModal = ({ entity, type, onClose, language }: { entity: any, type: 'project' | 'database', onClose: () => void, language: AppLanguage }) => {
    const copy = getUIText(language);
    const friends = useStore(s => s.friends);
    const shareProject = useStore(s => s.shareProject);
    const shareDatabase = useStore(s => s.shareDatabase);
    
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'friends' | 'link'>('friends');
    const [copied, setCopied] = useState(false);
    const showLinkTab = type === 'project';

    const handleShare = () => {
        if (selectedFriends.length > 0) {
            if (type === 'project') shareProject(entity.id, selectedFriends);
            else shareDatabase(entity, selectedFriends);
            onClose();
        }
    };

    const toggleFriend = (id: string) => {
        if (selectedFriends.includes(id)) setSelectedFriends(selectedFriends.filter(fid => fid !== id));
        else setSelectedFriends([...selectedFriends, id]);
    };

    const copyLink = () => {
        const url = type === 'project' ? `https://linkverse.app/p/${entity.id}` : `https://linkverse.app/db/${entity}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const title =
        type === 'project'
            ? copy.shareModal.shareProject.replace('{title}', entity.title)
            : copy.shareModal.shareDatabase.replace('{name}', entity);

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{title}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><IconX /></button>
                </div>
                {showLinkTab && (
                    <div className="flex border-b border-zinc-100 dark:border-zinc-800">
                        <button onClick={() => setActiveTab('friends')} className={`m-1 flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium text-center transition-all ${activeTab === 'friends' ? `${SOFT_ACTIVE_SURFACE} text-blue-600 dark:text-blue-300` : `border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE}`}`}>{copy.common.friends}</button>
                        <button onClick={() => setActiveTab('link')} className={`m-1 flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium text-center transition-all ${activeTab === 'link' ? `${SOFT_ACTIVE_SURFACE} text-blue-600 dark:text-blue-300` : `border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE}`}`}>{copy.common.inviteViaLink}</button>
                    </div>
                )}
                <div className="p-4 min-h-[200px]">
                    {activeTab === 'friends' ? (
                        <div className="space-y-2">
                             {type === 'database' && (<div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 text-[10px] text-blue-600 dark:text-blue-300">ℹ️ {copy.shareModal.databaseHint}</div>)}
                            {friends.map(f => (
                                <div key={f.id} onClick={() => toggleFriend(f.id)} className={`flex items-center p-2 rounded-2xl cursor-pointer border transition-all ${selectedFriends.includes(f.id) ? `${SOFT_ACTIVE_SURFACE}` : `bg-transparent border-transparent ${SOFT_HOVER_SURFACE}`}`}>
                                    <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 mr-3">{f.avatar}</div>
                                    <div className="flex-1"><div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{f.name}</div><div className="text-[10px] text-zinc-400">{f.status}</div></div>
                                    {selectedFriends.includes(f.id) && <div className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-300"></div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 items-center justify-center h-full pt-4">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-full text-zinc-400"><IconLink className="w-8 h-8" /></div>
                            <p className="text-xs text-center text-zinc-500 px-4">{copy.shareModal.linkHint}</p>
                            <button onClick={copyLink} className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">{copied ? copy.common.copied : copy.common.copyLink}</button>
                        </div>
                    )}
                </div>
                {activeTab === 'friends' && (
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end">
                        <button onClick={handleShare} disabled={selectedFriends.length === 0} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${selectedFriends.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>{copy.shareModal.sendInvite} ({selectedFriends.length})</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const DatabaseEditorModal = ({
    draft,
    onChange,
    onClose,
    onSave,
    onDelete,
    language,
}: {
    draft: DatabaseDraft,
    onChange: (nextDraft: DatabaseDraft) => void,
    onClose: () => void,
    onSave: () => void,
    onDelete?: () => void,
    language: AppLanguage,
}) => {
    const copy = getUIText(language);
    const isEmoji = draft.iconType === 'emoji';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/28 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[30px] border border-zinc-200/90 bg-white/96 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/96">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                            {copy.libraryView.databases}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {draft.mode === 'create' ? copy.libraryView.createTitle : copy.libraryView.editTitle}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                        <IconX className="w-4 h-4" />
                    </button>
                </div>

                <div className="mb-6 flex items-center gap-4 rounded-[24px] border border-zinc-200/80 bg-zinc-50/90 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                    <div
                        className="relative flex h-12 w-12 items-center justify-center rounded-[18px] border text-lg shadow-sm"
                        style={getDatabaseBadgeStyle(draft.color, 'medium')}
                    >
                        <DatabaseGlyph
                            database={{
                                name: draft.name || 'Database',
                                color: draft.color,
                                iconType: draft.iconType,
                                emoji: draft.emoji,
                            }}
                            className="h-5 w-5"
                            textClassName="text-lg"
                        />
                        <span
                            className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900"
                            style={{ backgroundColor: draft.color }}
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {draft.name.trim() || copy.libraryView.databaseName}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {isEmoji ? copy.libraryView.emojiIcon : copy.libraryView.folderIcon}
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            {copy.libraryView.databaseName}
                        </label>
                        <input
                            autoFocus
                            value={draft.name}
                            onChange={(event) => onChange({ ...draft, name: event.target.value })}
                            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
                            placeholder={copy.libraryView.dbName}
                        />
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            {copy.libraryView.iconLabel}
                        </div>
                        <div className="grid grid-cols-2 gap-1 rounded-[20px] border border-zinc-200/80 bg-zinc-50/90 p-1 dark:border-zinc-800 dark:bg-zinc-950/70">
                            <button
                                type="button"
                                onClick={() => onChange({ ...draft, iconType: 'folder' })}
                                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                                    draft.iconType === 'folder'
                                        ? 'border-zinc-200/80 bg-white text-zinc-900 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-100'
                                        : 'border-transparent bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                                }`}
                            >
                                {copy.libraryView.folderIcon}
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange({ ...draft, iconType: 'emoji' })}
                                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                                    draft.iconType === 'emoji'
                                        ? 'border-zinc-200/80 bg-white text-zinc-900 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-100'
                                        : 'border-transparent bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                                }`}
                            >
                                {copy.libraryView.emojiIcon}
                            </button>
                        </div>
                        {isEmoji && (
                            <input
                                value={draft.emoji}
                                onChange={(event) => onChange({ ...draft, emoji: event.target.value.slice(0, 4) })}
                                className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
                                placeholder={copy.libraryView.emojiPlaceholder}
                            />
                        )}
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            {copy.libraryView.colorLabel}
                        </div>
                        <div className="rounded-[20px] border border-zinc-200/80 bg-zinc-50/90 p-3 dark:border-zinc-800 dark:bg-zinc-950/70">
                            <div className="grid grid-cols-7 gap-2">
                            {DATABASE_COLOR_SPECTRUM.map((color) => {
                                const selected = color === draft.color;
                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => onChange({ ...draft, color })}
                                        className={`relative h-9 w-9 rounded-full border shadow-sm transition-transform hover:scale-[1.04] ${
                                            selected
                                                ? 'scale-[1.08] border-zinc-900 dark:border-zinc-100'
                                                : 'border-white dark:border-zinc-800'
                                        }`}
                                        style={{ backgroundColor: color }}
                                        aria-label={color}
                                    >
                                        {selected && (
                                            <span className="absolute inset-[9px] rounded-full border border-white/80 bg-white/25 dark:border-zinc-900/70 dark:bg-zinc-900/20" />
                                        )}
                                    </button>
                                );
                            })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between gap-3">
                    <div>
                        {onDelete && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/20"
                            >
                                <IconTrash className="w-4 h-4" />
                                {copy.common.delete}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                            {copy.common.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={!draft.name.trim() || (draft.iconType === 'emoji' && !draft.emoji.trim())}
                            className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {copy.libraryView.saveDatabase}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GeneratorView = ({ language }: { language: AppLanguage }) => {
    const copy = getUIText(language);
    const generateGraph = useStore(s => s.generateGraphFromDatabases);
    const databases = useStore(s => s.databases);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
        else setSelectedTags([...selectedTags, tag]);
    };

    const handleGenerate = async () => {
        if (selectedTags.length === 0) return;
        setIsGenerating(true);
        await generateGraph(selectedTags);
        setIsGenerating(false);
    };

    return (
         <div className="flex items-center justify-center h-full flex-col bg-[#FDFDFD] dark:bg-zinc-950 p-4">
             <div className="p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 max-w-lg w-full text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6"><IconGraph className="w-8 h-8" /></div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{copy.generatorView.title}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">{copy.generatorView.subtitle}</p>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5 mb-8 text-left">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 tracking-wider">{copy.generatorView.selectSources}</h4>
                    <div className="flex flex-wrap gap-2">
                        {databases.map(database => (
                            <button
                                key={database.name}
                                onClick={() => toggleTag(database.name)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-medium transition-all border ${
                                    selectedTags.includes(database.name)
                                        ? `text-zinc-900 dark:text-zinc-100 ${DATABASE_RAIL_ACTIVE_SURFACE}`
                                        : `bg-white/80 dark:bg-zinc-950/80 text-zinc-600 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 ${DATABASE_RAIL_HOVER_SURFACE}`
                                }`}
                                style={selectedTags.includes(database.name) ? getDatabaseInteractionStyle(database.color, 'selected') : undefined}
                            >
                                <span
                                    className="flex h-6 w-6 items-center justify-center rounded-xl border"
                                    style={getDatabaseBadgeStyle(database.color)}
                                >
                                    <DatabaseGlyph database={database} className="h-3 w-3" textClassName="text-xs" />
                                </span>
                                <span>{database.name}</span>
                            </button>
                        ))}
                        {databases.length === 0 && <span className="text-xs text-zinc-400 italic">{copy.generatorView.noDatabases}</span>}
                    </div>
                </div>
                <button onClick={handleGenerate} disabled={selectedTags.length === 0 || isGenerating} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${selectedTags.length > 0 ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-[1.02] shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>
                    {isGenerating ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> {copy.generatorView.generating}</> : <><IconMagic className="w-4 h-4" /> {copy.generatorView.generate}</>}
                </button>
             </div>
         </div>
    );
};

const DashboardView = ({ onCreateProject, onRename, onDelete, onShare, language }: any) => {
    const copy = getUIText(language);
    const projects = useStore(s => s.projects);
    const openProject = useStore(s => s.openProject);

    // Filter top 10 for Recent Files
    // Assuming projects are already sorted by recency (newest first) as per store implementation
    const recentProjects = projects.slice(0, 10);
    
    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto bg-[#FDFDFD] dark:bg-zinc-950">
             {/* Header */}
             <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{copy.dashboard.title}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">{copy.dashboard.subtitle}</p>
                 </div>
                 <button onClick={onCreateProject} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"><IconPlus /> {copy.dashboard.newProject}</button>
             </div>

             {/* Recent Files - Top Section (Grid/Cards) */}
             <div className="mb-10">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{copy.dashboard.recentFiles}</h4>
                 </div>
                 {recentProjects.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {recentProjects.map(p => (
                            <ProjectCard 
                                key={`recent-${p.id}`} 
                                project={p} 
                                onClick={() => openProject(p.id)} 
                                onRename={onRename} 
                                onDelete={onDelete} 
                                onShare={onShare} 
                                language={language}
                            />
                        ))}
                    </div>
                 ) : (
                    <div className="text-sm text-zinc-400 italic">{copy.dashboard.noRecentFiles}</div>
                 )}
             </div>

             {/* All Files - Bottom Section (List/Rows) */}
             <div>
                 <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{copy.dashboard.allFiles}</h4>
                 </div>
                 <div className="flex flex-col gap-2 pb-10">
                     {projects.length > 0 ? (
                        projects.map(p => (
                            <ProjectRow 
                                key={`all-${p.id}`} 
                                project={p} 
                                onClick={() => openProject(p.id)} 
                                onRename={onRename} 
                                onDelete={onDelete} 
                                onShare={onShare} 
                                language={language}
                            />
                        ))
                     ) : (
                        <div className="text-sm text-zinc-400 italic">{copy.dashboard.noFilesFound}</div>
                     )}
                 </div>
             </div>
        </div>
    );
};

const StackPreview = ({ tag, projects, x, y }: { tag: string, projects: any[], x: number, y: number }) => {
    const recentProjects = projects.slice(0, 3);
    const style = { top: y, left: x + 20 };
    return (
        <div className="fixed z-[9999] pointer-events-none transition-opacity duration-200" style={style}>
            <div className="relative w-48 h-32">
                {recentProjects.length > 0 ? recentProjects.map((p, index) => {
                    const offset = index * 8; 
                    const scale = 1 - (index * 0.08);
                    const opacity = 1 - (index * 0.15);
                    const zIndex = 10 - index;
                    let bg = 'bg-white dark:bg-zinc-800';
                    let border = 'border-zinc-200 dark:border-zinc-700';
                    if (p.type === 'graph') { bg = 'bg-blue-50 dark:bg-blue-900'; border = 'border-blue-100 dark:border-blue-800'; } 
                    else if (p.type === 'note') { bg = 'bg-yellow-50 dark:bg-yellow-900'; border = 'border-yellow-100 dark:border-yellow-800'; }
                    return (
                        <div 
                            key={p.id}
                            className={`absolute w-44 h-24 rounded-xl border shadow-xl p-3 ${bg} ${border} transition-transform duration-300 ease-out flex flex-col`}
                            style={{ top: offset, transform: `scale(${scale})`, transformOrigin: 'top center', zIndex: zIndex, opacity: opacity, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        >
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                                <div className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 truncate">{p.title}</div>
                            </div>
                            <div className="space-y-1.5 opacity-40 mt-auto">
                                <div className="h-1 w-full bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
                                <div className="h-1 w-2/3 bg-zinc-400 dark:bg-zinc-500 rounded-full"></div>
                            </div>
                        </div>
                    );
                }) : (
                     <div className="absolute top-0 left-0 w-44 h-24 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 flex items-center justify-center text-xs text-zinc-400 shadow-xl backdrop-blur-sm">Empty Folder</div>
                )}
            </div>
        </div>
    );
};

const LibraryView = ({ onRename, onDelete, onShare, onShareDatabase, language }: any) => {
    const copy = getUIText(language);
    const projects = useStore(s => s.projects);
    const databases = useStore(s => s.databases);
    const openProject = useStore(s => s.openProject);
    const createDatabase = useStore(s => s.createDatabase);
    const updateDatabase = useStore(s => s.updateDatabase);
    const deleteDatabase = useStore(s => s.deleteDatabase);
    const isLibrarySidebarCollapsed = useStore(s => s.isLibrarySidebarCollapsed);
    const toggleLibrarySidebar = useStore(s => s.toggleLibrarySidebar);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [hoveredDB, setHoveredDB] = useState<{ tag: string, x: number, y: number } | null>(null);
    const [databaseDraft, setDatabaseDraft] = useState<DatabaseDraft | null>(null);
    const databaseMap = useMemo(() => new Map(databases.map((database) => [database.name, database])), [databases]);
    const activeDatabase = selectedTag && selectedTag !== 'Inbox' ? databaseMap.get(selectedTag) || null : null;
    const databaseCounts = useMemo(
        () =>
            new Map(
                databases.map((database) => [
                    database.name,
                    projects.filter((project) => project.databaseTags.includes(database.name)).length,
                ])
            ),
        [databases, projects]
    );
    const databaseProjects = useMemo(() => projects.filter(p => { if (selectedTag && selectedTag !== 'Inbox') return p.databaseTags.includes(selectedTag); if (selectedTag === 'Inbox') return false; const isOnlyInbox = p.databaseTags.length === 1 && p.databaseTags[0] === 'Inbox'; const isNoTag = p.databaseTags.length === 0; return !isOnlyInbox && !isNoTag; }), [projects, selectedTag]);
    const drafts = useMemo(() => projects.filter(p => { const isOnlyInbox = p.databaseTags.length === 1 && p.databaseTags[0] === 'Inbox'; const isNoTag = p.databaseTags.length === 0; if (selectedTag && selectedTag !== 'Inbox') return false; return isOnlyInbox || isNoTag; }), [projects, selectedTag]);

    useEffect(() => {
        if (selectedTag && selectedTag !== 'Inbox' && !databaseMap.has(selectedTag)) {
            setSelectedTag(null);
        }
    }, [databaseMap, selectedTag]);

    const handleSaveDatabase = () => {
        if (!databaseDraft) return;

        const payload: DatabaseDefinition = {
            name: databaseDraft.name.trim(),
            color: databaseDraft.color,
            iconType: databaseDraft.iconType,
            emoji: databaseDraft.iconType === 'emoji' ? databaseDraft.emoji.trim() : undefined,
        };

        if (!payload.name) return;

        const duplicateExists =
            payload.name !== (databaseDraft.originalName || '') &&
            databaseMap.has(payload.name);

        if (duplicateExists) {
            window.alert(copy.libraryView.duplicateName);
            return;
        }

        if (databaseDraft.mode === 'create') {
            createDatabase(payload.name, payload);
        } else {
            updateDatabase(databaseDraft.originalName || payload.name, payload);
            if (selectedTag === databaseDraft.originalName && databaseDraft.originalName !== payload.name) {
                setSelectedTag(payload.name);
            }
        }

        setDatabaseDraft(null);
    };

    const handleDeleteDatabase = () => {
        if (!databaseDraft?.originalName) return;
        const shouldDelete = window.confirm(copy.libraryView.deleteConfirm.replace('{name}', databaseDraft.originalName));
        if (!shouldDelete) return;
        deleteDatabase(databaseDraft.originalName);
        if (selectedTag === databaseDraft.originalName) {
            setSelectedTag(null);
        }
        setDatabaseDraft(null);
    };

    return (
        <div className="flex h-full relative">
            {hoveredDB && <StackPreview tag={hoveredDB.tag} projects={projects.filter(p => p.databaseTags.includes(hoveredDB.tag))} x={hoveredDB.x} y={hoveredDB.y} />}
            <div className={`border-r border-zinc-200/80 dark:border-zinc-800 bg-[#F7F7F4]/90 dark:bg-zinc-950/92 transition-all duration-300 ease-in-out flex flex-col backdrop-blur-xl ${isLibrarySidebarCollapsed ? 'w-12' : 'w-[280px]'}`}>
                <div className="flex items-center justify-between p-4 mb-2">
                     {!isLibrarySidebarCollapsed && <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 text-sm"><IconDatabase className="w-4 h-4" /> {copy.libraryView.databases}</h3>}
                     <div className="flex gap-1">
                        {!isLibrarySidebarCollapsed && <button onClick={() => setDatabaseDraft(createDatabaseDraft(undefined, 'create'))} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500" title={copy.libraryView.createDatabase}><IconPlus className="w-3.5 h-3.5" /></button>}
                        <button onClick={toggleLibrarySidebar} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500" title={isLibrarySidebarCollapsed ? "Expand" : "Collapse"}>{isLibrarySidebarCollapsed ? <IconArrowRight className="w-3.5 h-3.5" /> : <IconSidebar className="w-3.5 h-3.5" />}</button>
                     </div>
                </div>
                {!isLibrarySidebarCollapsed && (
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        <div className="space-y-2">
                            <button 
                                onClick={() => setSelectedTag(null)} 
                                className={`w-full text-left px-3 py-2.5 rounded-[22px] border text-sm flex items-center gap-3 transition-all ${
                                    selectedTag === null
                                        ? `${DATABASE_RAIL_ACTIVE_SURFACE} font-medium text-zinc-900 dark:text-zinc-100`
                                        : `border-transparent text-zinc-600 dark:text-zinc-400 ${DATABASE_RAIL_HOVER_SURFACE}`
                                }`}
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-zinc-200/80 bg-white/80 text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300">
                                    <IconGrid className="w-4 h-4" />
                                </span>
                                <span>{copy.libraryView.allKnowledge}</span>
                            </button>

                            {databases.map((database) => {
                                const isActive = selectedTag === database.name;
                                const isHovered = hoveredDB?.tag === database.name;
                                const stateStyle = getDatabaseInteractionStyle(
                                    database.color,
                                    isActive ? 'selected' : isHovered ? 'hover' : 'rest'
                                );
                                const databaseCount = databaseCounts.get(database.name) || 0;

                                return (
                                    <div key={database.name} className="relative group flex items-center" onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setHoveredDB({ tag: database.name, x: rect.right, y: rect.top }); }} onMouseLeave={() => setHoveredDB(null)}>
                                        <button
                                            onClick={() => setSelectedTag(database.name === selectedTag ? null : database.name)}
                                            className={`relative z-10 flex flex-1 items-center justify-between rounded-[22px] border px-3 py-2.5 text-left text-sm transition-all ${
                                                isActive
                                                    ? `${DATABASE_RAIL_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-100`
                                                    : `border-transparent text-zinc-500 dark:text-zinc-400 ${DATABASE_RAIL_HOVER_SURFACE}`
                                            }`}
                                            style={stateStyle}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border shadow-sm"
                                                    style={getDatabaseBadgeStyle(database.color)}
                                                >
                                                    <DatabaseGlyph
                                                        database={database}
                                                        className="h-4 w-4"
                                                        textClassName="text-sm"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium text-zinc-800 dark:text-zinc-100">{database.name}</div>
                                                </div>
                                            </div>
                                            <div className="rounded-full border border-zinc-200/80 bg-white/80 px-2 py-1 text-[10px] font-semibold text-zinc-400 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-500">
                                                {databaseCount}
                                            </div>
                                        </button>
                                        <div className={`absolute right-2 z-20 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <DatabaseMenu
                                                tag={database.name}
                                                language={language}
                                                onRename={() => setDatabaseDraft(createDatabaseDraft(database, 'edit'))}
                                                onDelete={(name: string) => {
                                                    const shouldDelete = window.confirm(copy.libraryView.deleteConfirm.replace('{name}', name));
                                                    if (!shouldDelete) return;
                                                    deleteDatabase(name);
                                                    if (selectedTag === name) setSelectedTag(null);
                                                }}
                                                onShare={(name: string) => onShareDatabase(name)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                                <button onClick={() => setSelectedTag('Inbox')} className={`w-full text-left px-3 py-2.5 rounded-[22px] border text-sm flex items-center justify-between group transition-all ${
                                    selectedTag === 'Inbox'
                                        ? `${DATABASE_RAIL_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-100 font-medium`
                                        : `border-transparent text-zinc-500 dark:text-zinc-400 ${DATABASE_RAIL_HOVER_SURFACE}`
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-zinc-200/80 bg-white/80 text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300">
                                            <IconFolder className="w-4 h-4" />
                                        </span>
                                        <span>Inbox</span>
                                    </div>
                                    <div className="rounded-full border border-zinc-200/80 bg-white/80 px-2 py-1 text-[10px] font-semibold text-zinc-400 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-500">{drafts.length}</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto bg-[#FCFCFA] px-8 py-8 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="mb-3 flex items-center gap-3">
                            {activeDatabase && (
                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-[18px] border shadow-sm"
                                    style={getDatabaseBadgeStyle(activeDatabase.color, 'medium')}
                                >
                                    <DatabaseGlyph
                                        database={activeDatabase}
                                        className="h-5 w-5"
                                        textClassName="text-lg"
                                    />
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">{selectedTag || copy.libraryView.allKnowledge}</h2>
                                <p className="text-zinc-400 text-sm">{copy.libraryView.subtitle}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}><IconGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}><IconList className="w-4 h-4" /></button>
                    </div>
                </div>
                {selectedTag !== 'Inbox' && (
                    <div className="mb-10">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">{copy.libraryView.projects} ({databaseProjects.length})</h4>
                        {databaseProjects.length === 0 ? <div className="text-sm text-zinc-400 italic">{copy.libraryView.noProjectsFound}</div> : (viewMode === 'grid' ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{databaseProjects.map(p => <ProjectCard key={p.id} project={p} language={language} onClick={() => openProject(p.id)} onRename={onRename} onDelete={onDelete} onShare={onShare} />)}</div> : <div className="flex flex-col gap-2">{databaseProjects.map(p => <ProjectRow key={p.id} project={p} language={language} onClick={() => openProject(p.id)} onRename={onRename} onDelete={onDelete} onShare={onShare} />)}</div>)}
                    </div>
                )}
                {(!selectedTag || selectedTag === 'Inbox') && (
                    <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">{copy.libraryView.inboxDrafts} ({drafts.length})</h4>
                        {drafts.length === 0 ? <div className="text-sm text-zinc-400 italic">{copy.libraryView.noDrafts}</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{drafts.map(p => <div key={p.id} onClick={() => openProject(p.id)} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer group"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span><h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-200 truncate max-w-[150px]">{p.title}</h4></div><span className="text-[10px] text-zinc-400">{copy.libraryView.draft}</span></div><p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-3">{p.content || p.summary || copy.libraryView.noContent}</p><div className="flex justify-between items-center"><div className="flex gap-1"><span className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[9px] text-orange-400">Inbox</span></div><span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">{copy.libraryView.openAction} &rarr;</span></div></div>)}</div>}
                    </div>
                )}
            </div>
            {databaseDraft && (
                <DatabaseEditorModal
                    draft={databaseDraft}
                    onChange={setDatabaseDraft}
                    onClose={() => setDatabaseDraft(null)}
                    onSave={handleSaveDatabase}
                    onDelete={databaseDraft.mode === 'edit' ? handleDeleteDatabase : undefined}
                    language={language}
                />
            )}
        </div>
    );
};

const FriendsView = ({ mode, language }: { mode: 'friends' | 'team', language: AppLanguage }) => {
    const copy = getUIText(language);
    // ... (Existing implementation)
    const friends = useStore(s => s.friends);
    const groups = useStore(s => s.groups);
    const directMessages = useStore(s => s.directMessages);
    const sendDirectMessage = useStore(s => s.sendDirectMessage);
    const exportChatToProject = useStore(s => s.exportChatToProject);
    const downloadChatAsTxt = useStore(s => s.downloadChatAsTxt);
    const openProject = useStore(s => s.openProject);
    const setView = useStore(s => s.setView);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);

    const displayList = useMemo(() => { if (mode === 'team') return groups; return friends; }, [mode, friends, groups]);

    useEffect(() => {
        if (mode === 'team' && groups.length > 0 && !groups.some(g => g.id === selectedId)) setSelectedId(groups[0].id);
        else if (mode === 'friends' && friends.length > 0 && !friends.some(f => f.id === selectedId)) setSelectedId(friends[0].id);
    }, [mode, groups, friends]);

    const isGroup = groups.some(g => g.id === selectedId);
    const activeEntity: any = isGroup ? groups.find(g => g.id === selectedId) : friends.find(f => f.id === selectedId);
    const conversation = useMemo(() => { if (!selectedId) return []; return directMessages.filter(m => (m.senderId === 'me' && m.receiverId === selectedId) || (m.senderId === selectedId && m.receiverId === 'me') || (isGroup && m.receiverId === selectedId)).sort((a, b) => a.timestamp - b.timestamp); }, [directMessages, selectedId, isGroup]);

    useEffect(() => { if (!isSelectionMode) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation, isSelectionMode]);

    const handleSend = () => { if (input.trim() && selectedId) { sendDirectMessage(selectedId, input, isGroup); setInput(''); } };
    const toggleSelection = (msgId: string) => { if (!isSelectionMode) return; const newSet = new Set(selectedMessageIds); if (newSet.has(msgId)) newSet.delete(msgId); else newSet.add(msgId); setSelectedMessageIds(newSet); };
    const handleExportProject = () => { if (selectedId && selectedMessageIds.size > 0) { exportChatToProject(selectedId, Array.from(selectedMessageIds), isGroup); setIsSelectionMode(false); setSelectedMessageIds(new Set()); setExportMenuOpen(false); } };
    const handleDownloadTxt = () => { if (selectedId && selectedMessageIds.size > 0) { downloadChatAsTxt(selectedId, Array.from(selectedMessageIds), isGroup); setIsSelectionMode(false); setSelectedMessageIds(new Set()); setExportMenuOpen(false); } };
    const handleAttachmentClick = (attachment: any) => { if (attachment.type === 'project') openProject(attachment.id); else if (attachment.type === 'database') setView('library'); };

    return (
        <div className="flex h-full bg-white dark:bg-zinc-900">
            <div className="w-72 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-950">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center"><h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{mode === 'team' ? copy.friendsView.teamsTitle : copy.friendsView.friendsTitle}</h2><button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500"><IconPlus className="w-4 h-4" /></button></div>
                <div className="flex-1 overflow-y-auto px-2 py-2">{displayList.map((item: any) => (<div key={item.id} onClick={() => { setSelectedId(item.id); setIsSelectionMode(false); }} className={`mb-1 flex cursor-pointer items-center rounded-2xl border px-4 py-3 transition-all ${selectedId === item.id ? `${SOFT_ACTIVE_SURFACE}` : `border-transparent ${SOFT_HOVER_SURFACE}`}`}><div className={`w-10 h-10 ${mode === 'team' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-zinc-200 dark:bg-zinc-700'} rounded-lg flex items-center justify-center text-lg mr-3`}>{item.avatar}</div><div className="flex-1 min-w-0"><h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate">{item.name}</h3><p className="text-xs text-zinc-500 truncate">{mode === 'team' ? `${item.members.length} members` : item.status}</p></div></div>))}</div>
            </div>
            {activeEntity ? (
                <div className="flex-1 flex flex-col bg-[#F4F4F5] dark:bg-zinc-900 relative">
                    <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
                        <div className="flex items-center gap-3"><div className={`w-8 h-8 ${isGroup ? 'bg-purple-100 dark:bg-purple-900/30 rounded-lg' : 'bg-zinc-200 dark:bg-zinc-700 rounded-full'} flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-xs`}>{activeEntity.avatar}</div><div><h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">{activeEntity.name}</h3>{isSelectionMode && <span className="text-xs text-blue-600 font-medium">{copy.friendsView.selectMessages}</span>}</div></div>
                        <div className="flex gap-2">
                            {isSelectionMode ? (<div className="flex items-center gap-2"><button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds(new Set()); }} className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">{copy.friendsView.cancel}</button><div className="relative"><button onClick={() => setExportMenuOpen(!exportMenuOpen)} disabled={selectedMessageIds.size === 0} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${selectedMessageIds.size > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>{copy.friendsView.export} ({selectedMessageIds.size})</button>{exportMenuOpen && selectedMessageIds.size > 0 && (<><div className="fixed inset-0 z-20" onClick={() => setExportMenuOpen(false)}></div><div className="absolute right-0 top-8 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 w-40 z-30 py-1"><button onClick={handleExportProject} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200">{copy.friendsView.saveToProject}</button><button onClick={handleDownloadTxt} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200">{copy.friendsView.downloadTxt}</button></div></>)}</div></div>) : (<button onClick={() => setIsSelectionMode(true)} className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all flex items-center gap-2"><IconCheck className="w-3 h-3" /> {copy.friendsView.select}</button>)}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {conversation.length === 0 ? <div className="flex items-center justify-center h-full text-zinc-400 text-sm italic">{copy.friendsView.noMessages}</div> : conversation.map(msg => { const isMe = msg.senderId === 'me'; const isSelected = selectedMessageIds.has(msg.id); const isAttachment = !!msg.attachment; return (<div key={msg.id} onClick={() => toggleSelection(msg.id)} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isSelectionMode ? 'cursor-pointer hover:opacity-80' : ''}`}><div className="flex items-center gap-3 max-w-[70%]">{isSelectionMode && (<div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'}`}>{isSelected && <IconCheck className="w-3 h-3 text-white" />}</div>)}<div className={`p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-tr-none' : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-zinc-700'} ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}>{!isMe && isGroup && <div className="text-[10px] font-bold text-zinc-400 mb-1">{msg.senderId}</div>}{isAttachment && msg.attachment && (<div onClick={(e) => { e.stopPropagation(); handleAttachmentClick(msg.attachment); }} className="mb-2 p-2 bg-white/50 dark:bg-zinc-950/30 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-3 min-w-[200px] cursor-pointer hover:bg-white dark:hover:bg-zinc-900 transition-colors group"><div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${msg.attachment.type === 'database' ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 group-hover:bg-blue-300 dark:group-hover:bg-blue-700' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600'}`}>{msg.attachment.type === 'database' ? <IconFolder className="w-5 h-5" /> : <IconFile className="w-5 h-5" />}</div><div className="flex-1 min-w-0"><div className="text-xs font-bold truncate flex items-center gap-1">{msg.attachment.title}<IconArrowRight className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div><div className="text-[10px] opacity-70 truncate capitalize flex items-center gap-1">{msg.attachment.type === 'database' ? 'Shared Folder' : 'Shared Project'} • {msg.attachment.meta}</div></div></div>)}{msg.text}<div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-700/60 dark:text-blue-300/50' : 'text-zinc-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div></div></div>); })}
                        <div ref={messagesEndRef} />
                    </div>
                    {!isSelectionMode && (<div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800"><div className="flex gap-2 relative"><input className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400 dark:text-zinc-200" placeholder={copy.friendsView.typeMessage} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} /><button onClick={handleSend} className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors shadow-sm"><IconSend className="w-4 h-4" /></button></div></div>)}
                </div>
            ) : <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-400">{copy.friendsView.startChat.replace('{target}', mode === 'team' ? copy.friendsView.team : copy.friendsView.friend)}</div>}
        </div>
    );
};

const NoteToolbar = ({ onInsert, language }: { onInsert: (before: string, after: string) => void, language: AppLanguage }) => {
    const copy = getUIText(language);
    return (
        <div className="flex items-center gap-1 mb-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
            <button onClick={() => onInsert('**', '**')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 text-xs font-bold" title={copy.note.bold}>B</button>
            <button onClick={() => onInsert('*', '*')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 text-xs italic" title={copy.note.italic}>I</button>
            <button onClick={() => onInsert('==', '==')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 text-xs bg-yellow-100 dark:bg-yellow-900/30" title={copy.note.highlight}>H</button>
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1"></div>
            <button onClick={() => onInsert('![Image](', ')')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300" title={copy.note.image}><IconImage className="w-3.5 h-3.5"/></button>
        </div>
    );
};

const NoteEditor = ({ language }: { language: AppLanguage }) => {
    const copy = getUIText(language);
    const content = useStore(s => s.activeProjectContent);
    const updateContent = useStore(s => s.updateNoteContent);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const handleInsert = (before: string, after: string) => { const textarea = textareaRef.current; if (!textarea) return; const start = textarea.selectionStart; const end = textarea.selectionEnd; const text = textarea.value; const newText = text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end); updateContent(newText); setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + before.length, end + before.length); }, 0); };
    return (
        <div className="h-full w-full bg-zinc-100 dark:bg-zinc-950 p-8 overflow-y-auto flex justify-center">
            <div className="max-w-3xl w-full min-h-[90vh] bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col">
                <NoteToolbar onInsert={handleInsert} language={language} />
                <textarea ref={textareaRef} className="w-full flex-1 resize-none outline-none text-zinc-800 dark:text-zinc-200 text-lg leading-relaxed font-serif bg-transparent placeholder:text-zinc-300" placeholder={copy.note.startTyping} value={content} onChange={e => updateContent(e.target.value)} />
            </div>
        </div>
    );
};

const SettingsView = ({
    currentUser,
    onUserChange,
    onLogout,
    language,
    onLanguageChange,
    theme,
    onThemeChange,
}: {
    currentUser: SessionUser,
    onUserChange: (user: SessionUser) => void,
    onLogout: () => void,
    language: AppLanguage,
    onLanguageChange: (language: AppLanguage) => void,
    theme: Theme,
    onThemeChange: (theme: Theme) => void,
}) => {
    const copy = getUIText(language);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const [activeSection, setActiveSection] = useState<SettingsSectionId>('profile');
    const [isSettingsSidebarCollapsed, setIsSettingsSidebarCollapsed] = useState(false);
    const [displayName, setDisplayName] = useState(currentUser.displayName);
    const [email, setEmail] = useState(currentUser.email);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState(AI_CONFIG.defaultModel);
    const [statusMessage, setStatusMessage] = useState<{
        tone: 'success' | 'error' | 'info',
        text: string,
    } | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [busyAction, setBusyAction] = useState<string | null>(null);
    const [resolvedConfig, setResolvedConfig] = useState(getResolvedAIConfig());

    const refreshResolvedConfig = () => {
        const storedSettings = getStoredAISettings();
        setApiKey(storedSettings.apiKey || '');
        setModel(storedSettings.model || AI_CONFIG.defaultModel);
        setResolvedConfig(getResolvedAIConfig());
    };

    useEffect(() => {
        refreshResolvedConfig();
        setDisplayName(currentUser.displayName);
        setEmail(currentUser.email);
        setPendingEmail((current) => (current && current === currentUser.email ? null : current));
    }, [currentUser]);

    const publishStatus = (text: string, tone: 'success' | 'error' | 'info' = 'success') => {
        setStatusMessage({ tone, text });
    };

    const handleProfileSave = async () => {
        setBusyAction('profile');
        const updatedUser = await updateCurrentUserProfile({ displayName });
        if (!updatedUser) {
            publishStatus(copy.settings.profileUpdateFailed, 'error');
            setBusyAction(null);
            return;
        }

        onUserChange(updatedUser);
        publishStatus(copy.settings.profileUpdated);
        setBusyAction(null);
    };

    const handleEmailSave = async () => {
        if (!email.trim()) {
            publishStatus(copy.settings.emailRequired, 'error');
            return;
        }

        setBusyAction('email');
        const result = await updateCurrentUserEmail(email);

        if (result.error) {
            publishStatus(localizeAuthMessage(result.error, language), 'error');
            setBusyAction(null);
            return;
        }

        if (result.pendingEmail) {
            setPendingEmail(result.pendingEmail);
            publishStatus(`${copy.settings.emailChangePendingPrefix} ${result.pendingEmail}.`, 'info');
            setBusyAction(null);
            return;
        }

        if (!result.user) {
            publishStatus(copy.settings.emailUpdateFailed, 'error');
            setBusyAction(null);
            return;
        }

        setPendingEmail(null);
        onUserChange(result.user);
        publishStatus(copy.settings.emailUpdated);
        setBusyAction(null);
    };

    const handlePasswordSave = async () => {
        if (!newPassword.trim()) {
            publishStatus(copy.settings.newPasswordRequired, 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            publishStatus(copy.settings.passwordMismatch, 'error');
            return;
        }

        setBusyAction('password');
        const result = await updateCurrentUserPassword({
            currentPassword,
            password: newPassword,
        });

        if (result.error) {
            publishStatus(localizeAuthMessage(result.error, language), 'error');
            setBusyAction(null);
            return;
        }

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        publishStatus(copy.settings.passwordUpdated);
        setBusyAction(null);
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        setBusyAction('avatar');

        try {
            const avatarUrl = await prepareAvatarDataUrl(file);
            const updatedUser = updateCurrentUserAvatar(avatarUrl);

            if (!updatedUser) {
                publishStatus(copy.settings.avatarUploadFailed, 'error');
                setBusyAction(null);
                return;
            }

            onUserChange(updatedUser);
            publishStatus(copy.settings.avatarUpdated);
        } catch (error) {
            console.warn('Could not update avatar.', error);
            publishStatus(copy.settings.avatarUploadFailed, 'error');
        } finally {
            setBusyAction(null);
        }
    };

    const handleAvatarRemove = () => {
        const updatedUser = updateCurrentUserAvatar('');
        if (!updatedUser) {
            publishStatus(copy.settings.avatarUploadFailed, 'error');
            return;
        }

        onUserChange(updatedUser);
        publishStatus(copy.settings.avatarRemoved);
    };

    const handleSave = async () => {
        setBusyAction('ai-save');
        const updatedUser = await saveStoredAISettings({ apiKey, model });
        if (updatedUser) {
            onUserChange(updatedUser);
        }
        refreshResolvedConfig();
        publishStatus(copy.settings.aiSettingsSaved);
        setBusyAction(null);
    };

    const handleClear = async () => {
        setBusyAction('ai-clear');
        const updatedUser = await clearStoredAISettings();
        if (updatedUser) {
            onUserChange(updatedUser);
        }
        refreshResolvedConfig();
        publishStatus(copy.settings.aiOverrideCleared);
        setBusyAction(null);
    };

    useEffect(() => {
        if (!statusMessage) return;
        const timer = window.setTimeout(() => setStatusMessage(null), 2500);
        return () => window.clearTimeout(timer);
    }, [statusMessage]);

    const sourceLabel =
        resolvedConfig.source === 'browser'
            ? copy.settings.usingAccountOverride
            : resolvedConfig.source === 'environment'
                ? copy.settings.usingEnvironment
                : copy.settings.notConfigured;

    const sectionButtons: Array<{
        id: SettingsSectionId,
        title: string,
        icon: React.ReactNode,
    }> = [
        {
            id: 'profile',
            title: copy.settings.profile,
            icon: <IconUser className="w-4 h-4" />,
        },
        {
            id: 'account',
            title: copy.settings.accountSecurity,
            icon: <IconLock className="w-4 h-4" />,
        },
        {
            id: 'appearance',
            title: copy.settings.appearance,
            icon: <IconPalette className="w-4 h-4" />,
        },
        {
            id: 'language',
            title: copy.settings.language,
            icon: <IconSettings className="w-4 h-4" />,
        },
        {
            id: 'ai',
            title: copy.settings.aiAccess,
            icon: <IconMagic className="w-4 h-4" />,
        },
    ];

    const statusStyles =
        statusMessage?.tone === 'error'
            ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300'
            : statusMessage?.tone === 'info'
                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300';

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'language':
                return (
                    <SettingsCard
                        title={copy.settings.language}
                        description={copy.settings.languageDescription}
                    >
                        <div className="max-w-md">
                            <LanguageToggle
                                language={language}
                                onChange={onLanguageChange}
                                label={copy.language.label}
                                hint={copy.language.hint}
                            />
                        </div>
                    </SettingsCard>
                );
            case 'account':
                return (
                    <SettingsCard
                        title={copy.settings.accountSecurity}
                        description={copy.settings.accountDescription}
                    >
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                <IconMail className="w-3.5 h-3.5" />
                                {copy.settings.newEmail}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="mb-1 text-xs text-zinc-400">{copy.settings.email}</div>
                                    <div className="text-sm text-zinc-700 dark:text-zinc-200">{currentUser.email}</div>
                                </div>
                                {pendingEmail && (
                                    <div>
                                        <div className="mb-1 text-xs text-zinc-400">{copy.settings.pendingEmail}</div>
                                        <div className="text-sm text-zinc-700 dark:text-zinc-200">{pendingEmail}</div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 max-w-xl">
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {copy.settings.newEmail}
                                </label>
                                <input
                                    type="email"
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:border-zinc-500"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder={currentUser.email}
                                    autoComplete="email"
                                />
                                <p className="mt-2 text-xs leading-5 text-zinc-400">{copy.settings.emailHint}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleEmailSave}
                                disabled={busyAction === 'email'}
                                className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                {copy.settings.saveEmail}
                            </button>
                        </div>

                        <SettingsDivider />

                        <div>
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                <IconLock className="w-3.5 h-3.5" />
                                {copy.settings.savePassword}
                            </div>
                            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {copy.settings.currentPassword}
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:border-zinc-500"
                                        value={currentPassword}
                                        onChange={(event) => setCurrentPassword(event.target.value)}
                                        autoComplete="current-password"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {copy.settings.newPassword}
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:border-zinc-500"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        {copy.settings.confirmPassword}
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:border-zinc-500"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-zinc-400">{copy.settings.passwordHint}</p>
                            <button
                                type="button"
                                onClick={handlePasswordSave}
                                disabled={busyAction === 'password'}
                                className="mt-4 rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                            >
                                {copy.settings.savePassword}
                            </button>
                        </div>

                        <SettingsDivider />

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-sm font-semibold text-red-600 dark:text-red-300">{copy.settings.signOut}</div>
                                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{copy.shell.signOutConfirm}</p>
                            </div>
                            <button
                                type="button"
                                onClick={onLogout}
                                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/20"
                            >
                                <IconLogOut className="w-4 h-4" />
                                {copy.settings.signOut}
                            </button>
                        </div>
                    </SettingsCard>
                );
            case 'appearance':
                return (
                    <SettingsCard
                        title={copy.settings.appearance}
                        description={copy.settings.appearanceDescription}
                    >
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                        />

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <AvatarBadge
                                    avatarUrl={currentUser.avatarUrl}
                                    initials={currentUser.initials}
                                    name={currentUser.displayName}
                                    className="h-20 w-20 rounded-[22px] border border-zinc-200 dark:border-zinc-800"
                                    textClassName="text-xl font-semibold"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{currentUser.displayName}</div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">{currentUser.email}</div>
                                    <p className="mt-2 text-xs leading-5 text-zinc-400">{copy.settings.avatarHint}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={busyAction === 'avatar'}
                                    className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                >
                                    <IconUpload className="w-4 h-4" />
                                    {copy.settings.uploadAvatar}
                                </button>
                                {currentUser.avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={handleAvatarRemove}
                                        className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                    >
                                        {copy.settings.removeAvatar}
                                    </button>
                                )}
                            </div>
                        </div>

                        <SettingsDivider />

                        <div>
                            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{copy.settings.themeMode}</div>
                            <div className="inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-white/[0.06]">
                                <button
                                    type="button"
                                    onClick={() => onThemeChange('light')}
                                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                        theme === 'light'
                                            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                                    }`}
                                >
                                    <IconSun className="w-4 h-4" />
                                    {copy.settings.lightMode}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onThemeChange('dark')}
                                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                        theme === 'dark'
                                            ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                                    }`}
                                >
                                    <IconMoon className="w-4 h-4" />
                                    {copy.settings.darkMode}
                                </button>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-zinc-400">{copy.settings.themeHint}</p>
                        </div>
                    </SettingsCard>
                );
            case 'ai':
                return (
                    <SettingsCard
                        title={copy.settings.aiAccessSetup}
                        description={copy.settings.aiAccessHint}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{copy.settings.aiAccess}</div>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{copy.settings.aiAccessDescription}</p>
                            </div>
                            <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                                resolvedConfig.source === 'browser'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                    : resolvedConfig.source === 'environment'
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}>
                                {sourceLabel}
                            </div>
                        </div>

                        <div className="max-w-2xl space-y-5">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {copy.settings.apiKey}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:border-zinc-500"
                                        placeholder={copy.settings.apiKeyPlaceholder}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        spellCheck={false}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey((value) => !value)}
                                        className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                        {showKey ? copy.settings.hide : copy.settings.show}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-zinc-400">{copy.settings.apiKeyHint}</p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {copy.settings.model}
                                </label>
                                <input
                                    className="w-full max-w-md rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:border-zinc-500"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder={AI_CONFIG.defaultModel}
                                    spellCheck={false}
                                />
                                <p className="mt-2 text-xs leading-5 text-zinc-400">
                                    {copy.settings.modelHintPrefix} `{AI_CONFIG.defaultModel}`.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={busyAction === 'ai-save'}
                                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                >
                                    {copy.settings.saveAISettings}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={busyAction === 'ai-clear'}
                                    className="rounded-md border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                    {copy.settings.clearBrowserOverride}
                                </button>
                            </div>
                        </div>

                        <SettingsDivider />

                        <div>
                            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{copy.settings.currentRuntime}</div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="mb-1 text-xs text-zinc-400">{copy.settings.engine}</div>
                                    <div className="text-sm text-zinc-700 dark:text-zinc-200">{resolvedConfig.providerLabel}</div>
                                </div>
                                <div>
                                    <div className="mb-1 text-xs text-zinc-400">{copy.settings.model}</div>
                                    <div className="text-sm text-zinc-700 dark:text-zinc-200">{resolvedConfig.model}</div>
                                </div>
                                <div>
                                    <div className="mb-1 text-xs text-zinc-400">{copy.settings.keySource}</div>
                                    <div className="text-sm text-zinc-700 dark:text-zinc-200">{sourceLabel}</div>
                                </div>
                                <div>
                                    <div className="mb-1 text-xs text-zinc-400">{copy.settings.status}</div>
                                    <div className="text-sm text-zinc-700 dark:text-zinc-200">
                                        {resolvedConfig.source === 'placeholder' ? copy.settings.missingApiKey : copy.settings.ready}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SettingsCard>
                );
            case 'profile':
            default:
                return (
                    <SettingsCard
                        title={copy.settings.profile}
                        description={copy.settings.profileDescription}
                    >
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <AvatarBadge
                                    avatarUrl={currentUser.avatarUrl}
                                    initials={currentUser.initials}
                                    name={currentUser.displayName}
                                    className="h-16 w-16 rounded-[20px] border border-zinc-200 dark:border-zinc-800"
                                    textClassName="text-base font-semibold"
                                />
                                <div>
                                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{currentUser.displayName}</div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">{currentUser.email}</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{currentUser.role}</span>
                                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{currentUser.plan}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="max-w-sm text-xs leading-5 text-zinc-400">{copy.settings.localAccountHint}</p>
                        </div>

                        <SettingsDivider />

                        <div className="max-w-xl">
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                {copy.settings.displayName}
                            </label>
                            <input
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:border-zinc-500"
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleProfileSave}
                            disabled={busyAction === 'profile'}
                            className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {copy.settings.saveProfile}
                        </button>
                    </SettingsCard>
                );
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-zinc-100 dark:bg-[#313338]">
            <div className="mx-auto flex min-h-full max-w-6xl flex-col lg:flex-row">
                <aside className={`w-full shrink-0 border-b border-zinc-200 bg-zinc-50 dark:border-white/[0.08] dark:bg-[#2b2d31] lg:border-b-0 lg:border-r ${isSettingsSidebarCollapsed ? 'lg:w-[96px]' : 'lg:w-[280px]'}`}>
                    <div className={`py-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto ${isSettingsSidebarCollapsed ? 'px-3' : 'px-4 sm:px-5'}`}>
                        <div className={`${isSettingsSidebarCollapsed ? 'flex flex-col items-center gap-4' : 'pb-5'}`}>
                            <div className={`flex ${isSettingsSidebarCollapsed ? 'flex-col items-center gap-3' : 'items-center gap-3 rounded-[28px] border border-zinc-200/80 bg-white/[0.74] px-3.5 py-3 shadow-[0_18px_38px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-[0_12px_28px_rgba(0,0,0,0.18)]'}`}>
                                <AvatarBadge
                                    avatarUrl={currentUser.avatarUrl}
                                    initials={currentUser.initials}
                                    name={currentUser.displayName}
                                    className={`${isSettingsSidebarCollapsed ? 'h-14 w-14 rounded-[24px]' : 'h-12 w-12 rounded-[20px]'} border border-zinc-200/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900`}
                                    textClassName={`${isSettingsSidebarCollapsed ? 'text-base' : 'text-sm'} font-semibold`}
                                />
                                {!isSettingsSidebarCollapsed && (
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                            {copy.settings.title}
                                        </div>
                                        <div className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{currentUser.displayName}</div>
                                        <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{currentUser.email}</div>
                                    </div>
                                )}
                                {!isSettingsSidebarCollapsed && (
                                    <button
                                        type="button"
                                        onClick={() => setIsSettingsSidebarCollapsed((value) => !value)}
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-transparent text-zinc-400 transition-all ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`}
                                        title="Collapse sidebar"
                                        aria-label="Collapse sidebar"
                                    >
                                        <IconSidebar className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {isSettingsSidebarCollapsed && (
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsSidebarCollapsed((value) => !value)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-zinc-400 transition-all ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`}
                                    title="Expand sidebar"
                                    aria-label="Expand sidebar"
                                >
                                    <IconArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className={`mx-auto h-px bg-zinc-200/80 dark:bg-white/[0.08] ${isSettingsSidebarCollapsed ? 'mt-4 w-10' : 'mt-5 w-full'}`}></div>

                        {!isSettingsSidebarCollapsed && (
                            <div className="mt-5 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Sections
                            </div>
                        )}

                        <div className={`${isSettingsSidebarCollapsed ? 'mt-6 flex flex-col items-center gap-3' : 'mt-3 space-y-1.5'}`}>
                            {sectionButtons.map((section) => (
                                <SettingsSectionButton
                                    key={section.id}
                                    active={activeSection === section.id}
                                    icon={section.icon}
                                    title={section.title}
                                    collapsed={isSettingsSidebarCollapsed}
                                    onClick={() => setActiveSection(section.id)}
                                />
                            ))}
                        </div>

                        {!isSettingsSidebarCollapsed && (
                            <p className="mt-5 px-2 text-xs leading-5 text-zinc-400">
                                {copy.settings.sectionHint}
                            </p>
                        )}
                    </div>
                </aside>

                <section className="min-w-0 flex-1 bg-white dark:bg-[#313338]">
                    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{copy.settings.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                {copy.settings.subtitle}
                            </p>
                        </div>

                        {statusMessage && (
                            <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${statusStyles}`}>
                                {statusMessage.text}
                            </div>
                        )}

                        {renderSectionContent()}
                    </div>
                </section>
            </div>
        </div>
    );
};

// ... (Existing DatabaseSelector, ResourceViewer, AgentPanel)
const DatabaseSelector = ({ projectId, isOpen, onToggle, language }: { projectId: string, isOpen: boolean, onToggle: () => void, language: AppLanguage }) => {
    const copy = getUIText(language);
    const project = useStore(s => s.projects.find(p => p.id === projectId));
    const databases = useStore(s => s.databases);
    const addTag = useStore(s => s.addProjectToDatabase);
    const removeTag = useStore(s => s.removeProjectFromDatabase);

    if (!project) return null;

    return (
        <div className="relative">
            <button onClick={onToggle} className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><IconDatabase className="w-3.5 h-3.5" /><span>{copy.databaseSelector.savedIn}</span></button>
            {isOpen && (
                <>
                <div className="fixed inset-0 z-40" onClick={onToggle} />
                <div className="absolute top-8 right-0 z-50 w-56 rounded-[24px] border border-zinc-200/80 bg-white/96 p-3 shadow-[0_20px_48px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/96">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">{copy.databaseSelector.storageLocation}</h4>
                    <div className="flex flex-wrap gap-1 mb-3">
                        {project.databaseTags.map(tag => {
                            return (
                                <span
                                    key={tag}
                                    className="flex items-center gap-1 rounded-full border border-zinc-200/80 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
                                >
                                    {tag}
                                    <button onClick={() => removeTag(projectId, tag)} className="hover:opacity-80"><IconX className="w-2.5 h-2.5" /></button>
                                </span>
                            );
                        })}
                        {project.databaseTags.length === 0 && <span className="text-[10px] text-zinc-400 italic">{copy.databaseSelector.noTags}</span>}
                    </div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">{copy.databaseSelector.addToDatabase}</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {databases.filter(database => !project.databaseTags.includes(database.name)).map(database => (
                            <button key={database.name} onClick={() => addTag(projectId, database.name)} className="group flex w-full items-center justify-between rounded-2xl border border-transparent px-2 py-2 text-left text-xs text-zinc-600 transition-all hover:border-zinc-200/80 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:border-zinc-800 dark:hover:bg-zinc-800/70">
                                <span className="flex min-w-0 items-center gap-2">
                                    <span
                                        className="flex h-7 w-7 items-center justify-center rounded-[14px] border shadow-sm"
                                        style={getDatabaseBadgeStyle(database.color)}
                                    >
                                        <DatabaseGlyph
                                            database={database}
                                            className="h-3 w-3"
                                            textClassName="text-xs"
                                        />
                                    </span>
                                    <span className="truncate">{database.name}</span>
                                </span>
                                <IconPlus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                            </button>
                        ))}
                        {databases.filter(database => !project.databaseTags.includes(database.name)).length === 0 && (<div className="text-[10px] text-zinc-400 italic px-2">{copy.databaseSelector.allTagsAdded}</div>)}
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

const ResourceViewer = ({ project, language }: { project: any, language: AppLanguage }) => {
    const copy = getUIText(language);
    const [loadError, setLoadError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopilotContextCollapsed, setIsCopilotContextCollapsed] = useState(false);
    const capturedText = useStore(s => s.activeProjectContent);
    const updateCapturedText = useStore(s => s.updateNoteContent);
    const handleIframeLoad = () => { setIsLoading(false); };
    const handleIframeError = () => { setIsLoading(false); setLoadError(true); };

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 overflow-hidden"><div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><IconLink className="w-4 h-4" /></div><div className="min-w-0"><h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{project.title}</h2><a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{project.url}</a></div></div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsCopilotContextCollapsed((value) => !value)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                            isCopilotContextCollapsed
                                ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
                                : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            isCopilotContextCollapsed
                                ? 'border border-zinc-200/80 bg-white/[0.82] text-zinc-700 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.08] dark:text-zinc-200'
                                : 'bg-zinc-200/90 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                        }`}>
                            {isCopilotContextCollapsed ? <IconArrowLeft className="w-3.5 h-3.5" /> : <IconSidebar className="w-3.5 h-3.5" />}
                        </span>
                        {isCopilotContextCollapsed ? copy.resourceView.showContext : copy.resourceView.hideContext}
                    </button>
                    <div className="flex items-center gap-4"><div className="text-right hidden sm:block"><div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">{copy.resourceView.summary}</div><div className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">{project.summary || copy.resourceView.noSummary}</div></div><a href={project.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors" title={copy.common.openInNewTab}><IconExternal className="w-4 h-4" /></a></div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <div className={`grid h-full transition-[grid-template-columns] duration-300 ${isCopilotContextCollapsed ? 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_72px]' : 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]'}`}>
                    <div className={`relative bg-white dark:bg-zinc-900 overflow-hidden ${isCopilotContextCollapsed ? '' : 'border-b border-zinc-200 dark:border-zinc-800 xl:border-b-0 xl:border-r'}`}>
                        {!loadError ? (
                            <>
                                {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                                <iframe src={project.url} className="w-full h-full border-none" onLoad={handleIframeLoad} onError={handleIframeError} title="Resource Preview" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400"><IconLink className="w-8 h-8" /></div>
                                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">{copy.resourceView.previewUnavailable}</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">{copy.resourceView.previewUnavailableHint}</p>
                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">{copy.common.openInNewTab}</a>
                            </div>
                        )}
                    </div>

                    {isCopilotContextCollapsed ? (
                        <aside className="hidden h-full border-l border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-950/80 xl:flex">
                            <button
                                type="button"
                                onClick={() => setIsCopilotContextCollapsed(false)}
                                className="group flex h-full w-full flex-col items-center justify-center gap-4 px-2 text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
                                title="Show Context"
                                aria-label="Show Context"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors group-hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:group-hover:bg-zinc-800">
                                    <IconArrowLeft className="w-4 h-4" />
                                </div>
                                <div
                                    style={{ writingMode: 'vertical-rl' }}
                                    className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500"
                                >
                                    {copy.resourceView.context}
                                </div>
                            </button>
                        </aside>
                    ) : (
                        <aside className="h-full overflow-y-auto border-t border-zinc-200 bg-zinc-50/80 p-5 dark:border-zinc-800 dark:bg-zinc-950/70 xl:border-l xl:border-t-0">
                            <div className="rounded-[24px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                            Copilot Context
                                        </div>
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            Paste text from the link
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCopilotContextCollapsed(true)}
                                        className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                        title="Hide Context"
                                        aria-label="Hide Context"
                                    >
                                        <IconArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="mb-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                                    Copilot already sees the saved URL and summary. Paste excerpts, notes, or key paragraphs here if you want a deeper reading.
                                </p>
                                <textarea
                                    className="min-h-[260px] w-full resize-none rounded-[22px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-800 dark:text-zinc-100 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Paste article excerpts, transcript text, rough notes, or your own take here. The copilot will read this when you ask it to explain or critique the link."
                                    value={capturedText}
                                    onChange={(e) => updateCapturedText(e.target.value)}
                                />
                                <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[11px] leading-5 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                                    Try asking: “Summarize this link”, “Read https://example.com/research-notes and compare it with my notes”, “Pull out the key claims”, or “Critique this article.”
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
};

const AgentPanel = () => {
    const {
        isAgentPanelOpen,
        toggleAgentPanel,
        chatMessages,
        copilotThreads,
        activeCopilotThreadId,
        activeProjectId,
        projects,
        sendAgentMessage,
        createCopilotThread,
        openCopilotThread,
        deleteCopilotThread,
    } = useStore();
    const [input, setInput] = useState('');
    const [shareStatus, setShareStatus] = useState<string | null>(null);
    const [isThreadListOpen, setIsThreadListOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeProject = projects.find((project) => project.id === activeProjectId) || null;
    const activeThread = copilotThreads.find((thread) => thread.id === activeCopilotThreadId) || copilotThreads[0] || null;
    
    // Resize Logic
    const [width, setWidth] = useState(400); // Default wider
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatMessages]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            // Calculate new width based on mouse position from right edge of window
            const newWidth = window.innerWidth - e.clientX;
            // Min/Max constraints
            if (newWidth > 300 && newWidth < 800) {
                setWidth(newWidth);
            }
        };
        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    useEffect(() => {
        if (!shareStatus) return;
        const timer = window.setTimeout(() => setShareStatus(null), 2200);
        return () => window.clearTimeout(timer);
    }, [shareStatus]);

    useEffect(() => {
        if (copilotThreads.length <= 1) {
            setIsThreadListOpen(false);
        }
    }, [copilotThreads.length]);

    const handleSend = () => {
        if (!input.trim()) return;
        void sendAgentMessage(input);
        setInput('');
    };

    const handleShare = async () => {
        if (!activeThread || activeThread.messages.length === 0) return;

        const shareText = buildCopilotShareText(activeProject?.title || 'LinkVerse', activeThread);

        try {
            if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                await navigator.share({
                    title: `${activeProject?.title || 'LinkVerse'} — ${activeThread.title}`,
                    text: shareText,
                });
                setShareStatus('Shared');
                return;
            }

            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareText);
                setShareStatus('Copied');
                return;
            }

            setShareStatus('Share unavailable');
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }
            setShareStatus('Share failed');
        }
    };

    const handleDeleteThread = (threadId: string) => {
        const targetThread = copilotThreads.find((thread) => thread.id === threadId);
        if (!targetThread) return;

        const shouldDelete = window.confirm(`Delete chat "${targetThread.title}"?`);
        if (!shouldDelete) return;

        deleteCopilotThread(threadId);
    };

    if (!isAgentPanelOpen) return (
        <button onClick={toggleAgentPanel} className="absolute bottom-6 right-6 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-indigo-700 transition-all">
            <IconMagic className="w-6 h-6" />
        </button>
    );

    return (
        <div 
            style={{ width: width }}
            className="border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col z-30 shadow-xl transition-all duration-75 relative"
        >
            {/* Drag Handle */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-blue-500/50 hover:backdrop-blur-sm transition-colors z-50 flex items-center justify-center group"
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="h-8 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600 group-hover:bg-white transition-colors" />
            </div>

            <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    <IconMagic className="w-4 h-4" /> Workspace Copilot
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={createCopilotThread}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                        <IconPlus className="w-3.5 h-3.5" />
                        New
                    </button>
                    <button
                        onClick={() => void handleShare()}
                        disabled={!activeThread || activeThread.messages.length === 0}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                        <IconShare className="w-3.5 h-3.5" />
                        Share
                    </button>
                    <button
                        onClick={() => activeThread && handleDeleteThread(activeThread.id)}
                        disabled={!activeThread}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                        <IconTrash className="w-3.5 h-3.5" />
                        Delete
                    </button>
                    <button onClick={toggleAgentPanel} className="ml-1 text-zinc-400 hover:text-zinc-600"><IconX className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="border-b border-zinc-100 dark:border-zinc-800">
                <button
                    onClick={() => setIsThreadListOpen((value) => !value)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                Threads
                            </div>
                            <div className="text-[11px] text-zinc-400">
                                {shareStatus || `${copilotThreads.length} thread${copilotThreads.length === 1 ? '' : 's'}`}
                            </div>
                        </div>
                        <div className="mt-1 truncate text-[13px] font-medium text-zinc-800 dark:text-zinc-100">
                            {activeThread?.title || 'New chat'}
                        </div>
                    </div>
                    <IconArrowRight
                        className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${isThreadListOpen ? 'rotate-90' : ''}`}
                    />
                </button>
                {isThreadListOpen && (
                    <div className="max-h-48 overflow-y-auto border-t border-zinc-100 dark:border-zinc-800">
                        {copilotThreads.map((thread) => {
                            const isActive = thread.id === activeCopilotThreadId;
                            const preview = thread.messages[thread.messages.length - 1]?.text || 'Fresh chat';

                            return (
                                <div
                                    key={thread.id}
                                    className={`group mx-2 my-1 flex items-center gap-2 rounded-2xl border px-2 py-1.5 transition-all ${
                                        isActive
                                            ? SOFT_ACTIVE_SURFACE
                                            : `border-transparent ${SOFT_HOVER_SURFACE}`
                                    }`}
                                >
                                    <button
                                        onClick={() => openCopilotThread(thread.id)}
                                        className="min-w-0 flex-1 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className={`truncate text-[12px] font-medium ${isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-200'}`}>
                                                {thread.title}
                                            </div>
                                            <div className="shrink-0 text-[10px] text-zinc-400">
                                                {formatCopilotThreadTime(thread.updatedAt)}
                                            </div>
                                        </div>
                                        <div className={`mt-1 truncate text-[11px] ${isActive ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                            {preview}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteThread(thread.id)}
                                        className="rounded-lg p-1.5 text-zinc-300 opacity-0 transition-all hover:bg-zinc-100 hover:text-red-500 group-hover:opacity-100 dark:text-zinc-600 dark:hover:bg-zinc-800"
                                        title="Delete chat"
                                    >
                                        <IconTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {chatMessages.length === 0 && (
                    <div className="text-center text-zinc-400 text-xs mt-10">
                        Ask me to read this note, review all workspace files, inspect knowledge-base entries, explain a graph, or analyze a URL like https://example.com/research-notes.
                    </div>
                )}
                {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[88%] px-4 py-3.5 rounded-[22px] shadow-sm ${
                                msg.role === 'user'
                                    ? 'bg-zinc-900 text-white rounded-br-md'
                                    : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-bl-md border border-zinc-200/80 dark:border-zinc-800'
                            }`}
                        >
                            {msg.role === 'user' ? (
                                <div className="whitespace-pre-wrap text-[13px] leading-6 text-white/96">
                                    {msg.text}
                                </div>
                            ) : (
                                <ChatMarkdown content={msg.text} />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="relative">
                    <input 
                        className="w-full pl-3 pr-10 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Ask the copilot to review all files, read the knowledge base, or analyze https://example.com/research-notes..." 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="absolute right-2 top-1.5 p-1 text-indigo-600 hover:bg-indigo-50 rounded"><IconSend className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

const GraphLayersPanel = ({ isOpen, onToggle, language }: { isOpen: boolean, onToggle: () => void, language: AppLanguage }) => {
    const copy = getUIText(language);
    const nodes = useStore(s => s.nodes);
    const activeGraphFilters = useStore(s => s.activeGraphFilters);
    const toggleGraphFilter = useStore(s => s.toggleGraphFilter);

    // Get unique sources from current nodes
    const sources = useMemo(() => {
        const s = new Set<string>();
        nodes.forEach(n => {
            if (n.data.source) s.add(n.data.source);
        });
        return Array.from(s);
    }, [nodes]);

    if (sources.length === 0) return null;

    return (
        <div className="relative z-50">
            <button 
                onClick={onToggle} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-medium transition-all ${isOpen ? `${SOFT_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-100` : `border-transparent text-zinc-400 ${SOFT_HOVER_SURFACE} hover:text-zinc-600 dark:hover:text-zinc-300`}`}
            >
                <IconLayers className="w-3.5 h-3.5" />
                {copy.editor.layers}
            </button>
            {isOpen && (
                <>
                <div className="fixed inset-0 z-40" onClick={onToggle} />
                <div className="absolute top-10 left-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl w-48 z-50">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">{copy.editor.visibleSources}</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                        {sources.map(source => (
                            <label key={source} className="flex items-center gap-2 cursor-pointer text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 p-1.5 rounded transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={activeGraphFilters.includes(source)}
                                    onChange={() => toggleGraphFilter(source)}
                                    className="rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-0 bg-transparent" 
                                />
                                <span className={`truncate ${activeGraphFilters.includes(source) ? 'text-zinc-800 dark:text-zinc-200 font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                    {source}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

// --- Editor Logic Refactored to Fix Provider Issue ---

const FlowEditor = ({ activeProject, theme, nodeTypes, onRename, language }: any) => { // Added onRename prop
    const copy = getUIText(language);
    const { 
        nodes, edges, onNodesChange, onEdgesChange, onConnect,
        onNodesDelete, onEdgesDelete,
        addNode, saveProject, deleteNode, deleteEdge, setView,
        syncGraph, isSyncing, updateProjectViewState // Added syncGraph and isSyncing and updateProjectViewState
    } = useStore();
    
    // Hooks that require ReactFlowProvider context
    const reactFlowInstance = useReactFlow();
    const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
    const [activePopover, setActivePopover] = useState<string | null>(null);

    const viewState = activeProject.viewState;

    const onMoveEnd = useCallback((event: any, viewport: any) => {
        updateProjectViewState(activeProject.id, { x: viewport.x, y: viewport.y, zoom: viewport.zoom });
    }, [activeProject.id, updateProjectViewState]);

    const toggleMiniMap = () => {
        updateProjectViewState(activeProject.id, { isMiniMapOpen: !viewState.isMiniMapOpen });
    };

    // Toolbar Delete Selected Action
    const handleDeleteSelected = () => {
        const selectedNodes = nodes.filter(n => n.selected);
        const selectedEdges = edges.filter(e => e.selected);
        
        if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
        
        if (window.confirm(`Delete ${selectedNodes.length} nodes and ${selectedEdges.length} connections?`)) {
            selectedNodes.forEach(n => deleteNode(n.id));
            selectedEdges.forEach(e => deleteEdge(e.id));
        }
    };

    // Calculate selected count for UI
    const selectedCount = nodes.filter(n => n.selected).length + edges.filter(e => e.selected).length;

    // Double click to add node
    const handlePaneDoubleClick = useCallback((event: React.MouseEvent) => {
        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        addNode(position);
    }, [reactFlowInstance, addNode]);

    // Handle Edge Double Click
    const handleEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        setEditingEdge(edge);
    }, []);

    const handleSync = () => {
        if (activeProject) {
            syncGraph(activeProject.id);
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 flex flex-col relative">
                {/* Editor Header */}
                <div className="h-14 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex items-center justify-between px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-3">
                         <button onClick={() => setView('dashboard')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors mr-2" title={copy.editor.backToDashboard}><IconArrowLeft className="w-4 h-4" /></button>
                         <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                         <div className={`p-1.5 rounded-lg ${activeProject.type === 'graph' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' : activeProject.type === 'note' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300'}`}>{activeProject.type === 'graph' ? <IconGraph /> : activeProject.type === 'note' ? <IconEdit /> : <IconLink />}</div>
                         
                         {/* Clickable Title for Renaming */}
                         <div 
                            className="flex flex-col justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors group"
                            onClick={() => onRename && onRename(activeProject)}
                            title={copy.editor.clickToRename}
                         >
                            <div className="flex items-center gap-2">
                                <h1 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{activeProject.title}</h1>
                                <IconEdit className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                         </div>

                         {activeProject.unsavedChanges && <span className="text-[10px] text-orange-500 font-medium ml-2">{copy.editor.unsavedChanges}</span>}
                    </div>
                    
                    <div className="flex items-center gap-3">
                         {activeProject.type === 'graph' && (
                             <>
                                <button 
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSyncing ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                                    title="Sync graph structure with database changes"
                                >
                                    <IconRefresh className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                                    {isSyncing ? copy.editor.syncing : copy.editor.sync}
                                </button>
                                <GraphLayersPanel 
                                    isOpen={activePopover === 'layers'} 
                                    onToggle={() => setActivePopover(activePopover === 'layers' ? null : 'layers')}
                                    language={language}
                                />
                             </>
                         )}
                         
                         {/* Delete Selected Button */}
                         {selectedCount > 0 && (
                            <button 
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors mr-2"
                            >
                                <IconTrash className="w-3.5 h-3.5" />
                                Delete ({selectedCount})
                            </button>
                         )}
                        <DatabaseSelector 
                            projectId={activeProject.id} 
                            isOpen={activePopover === 'database'} 
                            onToggle={() => setActivePopover(activePopover === 'database' ? null : 'database')}
                            language={language}
                        />
                        <button onClick={() => { saveProject(); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeProject.unsavedChanges ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}><IconSave className="w-3.5 h-3.5" />{activeProject.unsavedChanges ? copy.common.save : copy.editor.saved}</button>
                    </div>
                </div>

                {/* Editor Body */}
                <div className="flex-1 relative overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/50">
                    {activeProject.type === 'graph' && (
                         <div className="w-full h-full relative">
                             <ReactFlow
                                 defaultViewport={{ x: viewState.x, y: viewState.y, zoom: viewState.zoom }}
                                 nodes={nodes}
                                 edges={edges}
                                 onNodesChange={onNodesChange}
                                 onEdgesChange={onEdgesChange}
                                 onNodesDelete={onNodesDelete}
                                 onEdgesDelete={onEdgesDelete}
                                 onConnect={onConnect}
                                 nodeTypes={nodeTypes}
                                 // Removed pane double click
                                 onEdgeDoubleClick={handleEdgeDoubleClick}
                                 onMoveEnd={onMoveEnd}
                                 minZoom={0.1}
                                 maxZoom={2}
                                 proOptions={{ hideAttribution: true }}
                                 deleteKeyCode={['Backspace', 'Delete']}
                             >
                                 <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={theme === 'dark' ? '#3f3f46' : '#E4E4E7'} />
                                 <Controls showInteractive={false} position="top-left" className="!bg-white dark:!bg-zinc-800 !border-zinc-200 dark:!border-zinc-700 !shadow-lg !m-4" />
                                 
                                 <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
                                    {viewState.isMiniMapOpen && (
                                        <div className="relative pointer-events-auto shadow-xl border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-800">
                                            <MiniMap 
                                                className="!static !m-0 !border-none !bg-transparent"
                                                maskColor={theme === 'dark' ? "rgba(24, 24, 27, 0.7)" : "rgba(244, 244, 245, 0.7)"} 
                                                nodeColor={(n) => n.selected ? '#3b82f6' : (theme === 'dark' ? '#52525b' : '#d4d4d8')} 
                                            />
                                            <button 
                                                onClick={toggleMiniMap}
                                                className="absolute top-1 right-1 p-1 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 transition-colors backdrop-blur-sm"
                                                title="Hide Overview"
                                            >
                                                <IconEyeOff className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                    {!viewState.isMiniMapOpen && (
                                        <button 
                                            onClick={toggleMiniMap}
                                            className="pointer-events-auto p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                            title="Show Overview"
                                        >
                                            <IconEye className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                             </ReactFlow>
                             <button onClick={() => addNode()} className="absolute top-28 left-4 w-10 h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center z-10 hover:shadow-2xl border border-zinc-200 dark:border-zinc-700" title="Add Concept"><IconPlus className="w-5 h-5" /></button>
                             {editingEdge && <EdgeLabelModal edge={editingEdge} onClose={() => setEditingEdge(null)} />}
                         </div>
                    )}
                    {activeProject.type === 'note' && <NoteEditor language={language} />}
                    {activeProject.type === 'resource' && <ResourceViewer project={activeProject} language={language} />}
                </div>
            </div>
            <AgentPanel />
        </div>
    );
};

// --- Main App ---

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>(() => getStoredLanguage());
  const copy = getUIText(language);
  const { 
    activeProjectId, isSidebarCollapsed, toggleSidebar,
    currentView, setView, projects, availableTags, databases, saveProject, theme, toggleTheme,
    deleteProject, editingNodeId, replaceWorkspace
  } = useStore();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(() => getCurrentUser());
  const [hasAccounts, setHasAccounts] = useState(() => hasAnyLocalAccount());
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isWorkspaceReady, setIsWorkspaceReady] = useState(false);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<any>(null);
  const [projectToShare, setProjectToShare] = useState<any>(null);
  const [databaseToShare, setDatabaseToShare] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lastSavedWorkspaceRef = useRef('');
  const workspaceSaveTimerRef = useRef<number | null>(null);
  
  const activeProject = projects.find(p => p.id === activeProjectId);
  const workspaceSnapshot = useMemo(
    () => getWorkspaceSnapshotFromState({ projects, availableTags, databases, theme }),
    [projects, availableTags, databases, theme]
  );
  const workspaceSignature = useMemo(
    () => JSON.stringify(workspaceSnapshot),
    [workspaceSnapshot]
  );

  useEffect(() => {
    saveStoredLanguage(language);
  }, [language]);

  // Sync Theme with DOM
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const [user, nextHasAccounts] = await Promise.all([
        hydrateCurrentUser(),
        hydrateAuthMeta(),
      ]);

      if (!isMounted) return;

      setCurrentUser(user);
      setHasAccounts(nextHasAccounts);
      setIsAuthReady(true);
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const syncWorkspaceState = async () => {
      if (!isAuthReady) {
        return;
      }

      if (!currentUser) {
        lastSavedWorkspaceRef.current = '';
        setIsWorkspaceReady(true);
        return;
      }

      setIsWorkspaceReady(false);

      const remoteResult = await fetchWorkspaceSnapshot();
      if (isCancelled) return;

      if (remoteResult.error) {
        const localSnapshot = normalizeWorkspaceSnapshot(
          getWorkspaceSnapshotFromState(useStore.getState())
        );
        lastSavedWorkspaceRef.current = JSON.stringify(localSnapshot);
        setToastMessage(copy.shell.cloudSyncUnavailable);
        setIsWorkspaceReady(true);
        return;
      }

      if (remoteResult.workspace) {
        const normalizedWorkspace = normalizeWorkspaceSnapshot(remoteResult.workspace);
        replaceWorkspace(normalizedWorkspace);
        lastSavedWorkspaceRef.current = JSON.stringify(normalizedWorkspace);
        setCachedWorkspaceOwnerId(currentUser.id);
        setIsWorkspaceReady(true);
        return;
      }

      const cachedOwnerId = getCachedWorkspaceOwnerId();
      const fallbackWorkspace =
        cachedOwnerId === currentUser.id
          ? normalizeWorkspaceSnapshot(getWorkspaceSnapshotFromState(useStore.getState()))
          : createDefaultWorkspaceSnapshot();

      replaceWorkspace(fallbackWorkspace);

      const savedWorkspaceResult = await saveWorkspaceSnapshot(fallbackWorkspace);
      if (isCancelled) return;

      const persistedWorkspace = savedWorkspaceResult.workspace
        ? normalizeWorkspaceSnapshot(savedWorkspaceResult.workspace)
        : fallbackWorkspace;

      lastSavedWorkspaceRef.current = JSON.stringify(persistedWorkspace);
      setCachedWorkspaceOwnerId(currentUser.id);

      if (savedWorkspaceResult.error) {
        setToastMessage(copy.shell.cloudSeedFailed);
      }

      setIsWorkspaceReady(true);
    };

    void syncWorkspaceState();

    return () => {
      isCancelled = true;
    };
  }, [copy.shell.cloudSeedFailed, copy.shell.cloudSyncUnavailable, currentUser, isAuthReady, replaceWorkspace]);

  useEffect(() => {
    if (!currentUser || !isWorkspaceReady) {
      if (workspaceSaveTimerRef.current) {
        window.clearTimeout(workspaceSaveTimerRef.current);
        workspaceSaveTimerRef.current = null;
      }
      return;
    }

    if (workspaceSignature === lastSavedWorkspaceRef.current) {
      return;
    }

    if (workspaceSaveTimerRef.current) {
      window.clearTimeout(workspaceSaveTimerRef.current);
    }

    workspaceSaveTimerRef.current = window.setTimeout(async () => {
      const result = await saveWorkspaceSnapshot(workspaceSnapshot);
      if (!result.workspace) {
        setToastMessage(copy.shell.cloudSaveFailed);
        return;
      }

      const normalizedWorkspace = normalizeWorkspaceSnapshot(result.workspace);
      lastSavedWorkspaceRef.current = JSON.stringify(normalizedWorkspace);
      setCachedWorkspaceOwnerId(currentUser.id);
    }, 900);

    return () => {
      if (workspaceSaveTimerRef.current) {
        window.clearTimeout(workspaceSaveTimerRef.current);
        workspaceSaveTimerRef.current = null;
      }
    };
  }, [copy.shell.cloudSaveFailed, currentUser, isWorkspaceReady, workspaceSignature, workspaceSnapshot]);

  // Global Keydown for Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (activeProjectId) {
                saveProject();
                setToastMessage(copy.shell.projectSaved);
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProjectId, copy.shell.projectSaved, saveProject]);

  const nodeTypes = useMemo(() => ({ mindMapNode: MindNode }), []);

  const handleAuthSuccess = (user: SessionUser) => {
      setCurrentUser(user);
      setHasAccounts(true);
      setIsWorkspaceReady(false);
      setView('dashboard');
  };

  const handleLogout = async () => {
      if (workspaceSaveTimerRef.current) {
          window.clearTimeout(workspaceSaveTimerRef.current);
          workspaceSaveTimerRef.current = null;
      }
      await logoutLocalAccount();
      lastSavedWorkspaceRef.current = '';
      setCurrentUser(null);
      setIsWorkspaceReady(true);
      setView('dashboard');
  };

  const handleLogoutClick = () => {
      const shouldLogout = window.confirm(copy.shell.signOutConfirm);
      if (!shouldLogout) return;
      void handleLogout();
  };

  const handleDelete = (id: string) => {
      if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
          deleteProject(id);
      }
  };

  if (!isAuthReady || (currentUser && !isWorkspaceReady)) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin"></div>
            {copy.shell.loadingWorkspace}
          </div>
        </div>
      );
  }

  if (!currentUser) {
      return <AuthView onAuthenticated={handleAuthSuccess} hasAccounts={hasAccounts} onHasAccountsChange={setHasAccounts} language={language} onLanguageChange={setLanguage} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView language={language} onCreateProject={() => setIsNewProjectModalOpen(true)} onRename={(p: any) => setProjectToRename(p)} onDelete={handleDelete} onShare={(p: any) => setProjectToShare(p)} />;
      case 'library':
        return <LibraryView language={language} onRename={(p: any) => setProjectToRename(p)} onDelete={handleDelete} onShare={(p: any) => setProjectToShare(p)} onShareDatabase={(db: string) => setDatabaseToShare(db)} />;
      case 'editor':
        if (!activeProject) return <div className="flex items-center justify-center h-full text-zinc-400">{copy.shell.selectProject}</div>;
        // WRAP Editor in ReactFlowProvider to fix hook errors
        return (
            <ReactFlowProvider key={activeProject.id}>
                <FlowEditor 
                    activeProject={activeProject} 
                    theme={theme} 
                    nodeTypes={nodeTypes} 
                    onRename={(p: any) => setProjectToRename(p)}
                    language={language}
                />
            </ReactFlowProvider>
        );
      case 'boards': return <GeneratorView language={language} />;
      case 'friends': return <FriendsView mode="friends" language={language} />;
      case 'team': return <FriendsView mode="team" language={language} />;
      case 'settings':
        return (
            <SettingsView
                currentUser={currentUser}
                onUserChange={setCurrentUser}
                onLogout={handleLogoutClick}
                language={language}
                onLanguageChange={setLanguage}
                theme={theme}
                onThemeChange={(nextTheme: Theme) => {
                    if (nextTheme !== theme) {
                        toggleTheme();
                    }
                }}
            />
        );
      default: return <div className="flex items-center justify-center h-full text-zinc-400">{copy.shell.workInProgress}</div>;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors duration-200">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 z-40 shadow-sm`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800/50">
          {!isSidebarCollapsed && <div className="flex items-center gap-2"><BrandLogo className="w-6 h-6 shrink-0" /><span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">LinkVerse</span></div>}
          <button onClick={toggleSidebar} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"><IconSidebar /></button>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
          <div>
              {!isSidebarCollapsed && <div className="px-3 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{copy.shell.workspaceSection}</div>}
              <div className="space-y-1">
                  <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${isSidebarCollapsed ? 'justify-center' : ''} ${currentView === 'dashboard' ? `${SOFT_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-100` : `border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`}`}><IconHome />{!isSidebarCollapsed && <span>{copy.shell.workspace}</span>}</button>
                  <button onClick={() => setView('boards')} className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${isSidebarCollapsed ? 'justify-center' : ''} ${currentView === 'boards' ? `${SOFT_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-100` : `border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`}`}><IconGraph />{!isSidebarCollapsed && <span>{copy.shell.generator}</span>}</button>
              </div>
          </div>
          <div>
              {!isSidebarCollapsed && <div className="px-3 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{copy.shell.knowledge}</div>}
              <div className="space-y-1">
                  <button onClick={() => setView('library')} className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${isSidebarCollapsed ? 'justify-center' : ''} ${currentView === 'library' ? `${SOFT_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-100` : `border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`}`}><IconDatabase />{!isSidebarCollapsed && <span>{copy.shell.library}</span>}</button>
              </div>
          </div>
          <div>
              {!isSidebarCollapsed && <div className="px-3 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{copy.shell.social}</div>}
              <div className="space-y-1">
                  <button onClick={() => setView('friends')} className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${isSidebarCollapsed ? 'justify-center' : ''} ${currentView === 'friends' ? `${SOFT_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-100` : `border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`}`}><IconUser />{!isSidebarCollapsed && <span>{copy.shell.friends}</span>}</button>
                  <button onClick={() => setView('team')} className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all ${isSidebarCollapsed ? 'justify-center' : ''} ${currentView === 'team' ? `${SOFT_ACTIVE_SURFACE} text-zinc-900 dark:text-zinc-100` : `border-transparent text-zinc-500 dark:text-zinc-400 ${SOFT_HOVER_SURFACE} hover:text-zinc-900 dark:hover:text-zinc-100`}`}><IconUsers />{!isSidebarCollapsed && <span>{copy.shell.team}</span>}</button>
              </div>
          </div>
        </nav>
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
              <button onClick={() => setView('settings')} className="flex items-center gap-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 p-2 rounded-lg transition-colors group flex-1">
                 <AvatarBadge
                    avatarUrl={currentUser.avatarUrl}
                    initials={currentUser.initials}
                    name={currentUser.displayName}
                    className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-600"
                    textClassName="text-xs font-semibold"
                 />
                 {!isSidebarCollapsed && (<div className="flex-1 overflow-hidden text-left"><div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{currentUser.displayName}</div><div className="text-xs text-zinc-400">{currentUser.plan}</div></div>)}
              </button>
              <div className="flex items-center gap-1 ml-1">
                  <button
                      onClick={toggleTheme}
                      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      title={theme === 'light' ? copy.shell.switchToDark : copy.shell.switchToLight}
                  >
                      {theme === 'light' ? <IconMoon className="w-4 h-4"/> : <IconSun className="w-4 h-4"/>}
                  </button>
                  <button
                      onClick={handleLogoutClick}
                      className="p-2 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors"
                      title={copy.shell.signOutTitle}
                  >
                      <IconLogOut className="w-4 h-4" />
                  </button>
              </div>
          </div>
        </div>
      </div>
      <main className="flex-1 h-full overflow-hidden relative">{renderContent()}</main>
      {isNewProjectModalOpen && <NewProjectModal onClose={() => setIsNewProjectModalOpen(false)} />}
      {editingNodeId && <NodeEditModal />}
      {projectToRename && <RenameModal project={projectToRename} language={language} onClose={() => setProjectToRename(null)} />}
      {projectToShare && <ShareModal entity={projectToShare} type="project" language={language} onClose={() => setProjectToShare(null)} />}
      {databaseToShare && <ShareModal entity={databaseToShare} type="database" language={language} onClose={() => setDatabaseToShare(null)} />}
    </div>
  );
}
