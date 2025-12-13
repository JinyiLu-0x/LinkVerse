
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
import { useStore } from './store/useStore';
import MindNode from './components/MindNode';
import { ProjectType, Friend } from './types';

// --- Icons (Zinc/Gray styled) ---
const IconLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Hexagon Container representing "LinkVerse" */}
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    {/* Internal Network Structure */}
    <path d="M12 12V7" />
    <path d="M12 12l4.5 4" />
    <path d="M12 12l-4.5 4" />
    {/* Central Core Node */}
    <circle cx="12" cy="12" r="2" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" />
  </svg>
);
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

// --- Components ---

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

const DatabaseMenu = ({ tag, onRename, onDelete, onShare }: any) => {
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
                            <IconShare className="w-3 h-3" /> Share
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onRename(tag); }}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <IconEdit className="w-3 h-3" /> Rename
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(tag); }}
                            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                            <IconTrash className="w-3 h-3" /> Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const ProjectMenu = ({ project, onRename, onDelete, onShare }: any) => {
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
                            <IconShare className="w-3.5 h-3.5" /> Share
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onRename(project);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 whitespace-nowrap"
                        >
                            <IconEdit className="w-3.5 h-3.5" /> Rename
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
                            <IconTrash className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const ProjectCard = ({ project, onClick, onRename, onDelete, onShare }: any) => {
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
                        />
                    </div>
                </div>
                
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mb-1 truncate pr-4">{project.title}</h3>
                <div className="flex gap-1 mb-2 overflow-hidden flex-wrap h-6 content-start">
                    {displayTags.slice(0, 3).map((t: string) => (
                        <span key={t} className={`px-1.5 py-0.5 text-[9px] rounded border whitespace-nowrap ${t === 'Inbox' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-100 dark:border-zinc-700'}`}>
                            {t}
                        </span>
                    ))}
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-auto truncate">{project.updatedAt}</p>
             </div>
        </div>
    );
};

const ProjectRow = ({ project, onClick, onRename, onDelete, onShare }: any) => {
    let Icon = IconFile;
    if (project.type === 'graph') Icon = IconGraph;
    else if (project.type === 'note') Icon = IconEdit;
    else if (project.type === 'resource') Icon = IconLink;

    return (
        <div 
            onClick={onClick}
            className="group flex items-center p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all cursor-pointer relative"
        >
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 mr-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 mr-4">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{project.title}</h3>
            </div>
            <div className="hidden md:flex gap-2 mr-4">
                {project.databaseTags.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 rounded-full border border-zinc-100 dark:border-zinc-700">{t}</span>
                ))}
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-600 mr-4 w-24 text-right">{project.updatedAt}</div>
            <div className="z-10 relative">
                <ProjectMenu 
                    project={project}
                    onRename={onRename}
                    onDelete={onDelete}
                    onShare={onShare}
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
                     <div><label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">URL</label><input className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-zinc-900 dark:text-zinc-100" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} /></div>
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

const RenameModal = ({ project, onClose }: { project: any, onClose: () => void }) => {
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
                <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100 mb-4">Rename Project</h3>
                <input className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-4 text-zinc-900 dark:text-zinc-100" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="px-3 py-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg">Save</button>
                </div>
            </div>
        </div>
    );
};

const ShareModal = ({ entity, type, onClose }: { entity: any, type: 'project' | 'database', onClose: () => void }) => {
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
        const url = type === 'project' ? `https://youmind.app/p/${entity.id}` : `https://youmind.app/db/${entity}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const title = type === 'project' ? `Share "${entity.title}"` : `Share Database "${entity}"`;

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-900/20 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{title}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"><IconX /></button>
                </div>
                {showLinkTab && (
                    <div className="flex border-b border-zinc-100 dark:border-zinc-800">
                        <button onClick={() => setActiveTab('friends')} className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${activeTab === 'friends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>Friends</button>
                        <button onClick={() => setActiveTab('link')} className={`flex-1 py-3 text-xs font-medium text-center transition-colors ${activeTab === 'link' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>Invite via Link</button>
                    </div>
                )}
                <div className="p-4 min-h-[200px]">
                    {activeTab === 'friends' ? (
                        <div className="space-y-2">
                             {type === 'database' && (<div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 text-[10px] text-blue-600 dark:text-blue-300">ℹ️ Databases can only be shared within LinkVerse Chat.</div>)}
                            {friends.map(f => (
                                <div key={f.id} onClick={() => toggleFriend(f.id)} className={`flex items-center p-2 rounded-lg cursor-pointer border transition-all ${selectedFriends.includes(f.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                                    <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 mr-3">{f.avatar}</div>
                                    <div className="flex-1"><div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{f.name}</div><div className="text-[10px] text-zinc-400">{f.status}</div></div>
                                    {selectedFriends.includes(f.id) && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 items-center justify-center h-full pt-4">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-full text-zinc-400"><IconLink className="w-8 h-8" /></div>
                            <p className="text-xs text-center text-zinc-500 px-4">Anyone with the link can view this project.</p>
                            <button onClick={copyLink} className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">{copied ? 'Copied!' : 'Copy Link'}</button>
                        </div>
                    )}
                </div>
                {activeTab === 'friends' && (
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end">
                        <button onClick={handleShare} disabled={selectedFriends.length === 0} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${selectedFriends.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>Send Invite ({selectedFriends.length})</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const GeneratorView = () => {
    const generateGraph = useStore(s => s.generateGraphFromDatabases);
    const availableTags = useStore(s => s.availableTags).filter(t => t !== 'Inbox');
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
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">AI Logic Generator</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">Select databases to generate a comprehensive knowledge graph.</p>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5 mb-8 text-left">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 tracking-wider">Select Context Sources</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600 hover:border-blue-300'}`}>{tag}</button>
                        ))}
                        {availableTags.length === 0 && <span className="text-xs text-zinc-400 italic">No databases created yet.</span>}
                    </div>
                </div>
                <button onClick={handleGenerate} disabled={selectedTags.length === 0 || isGenerating} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${selectedTags.length > 0 ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-[1.02] shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>
                    {isGenerating ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Generating Graph...</> : <><IconMagic className="w-4 h-4" /> Generate Knowledge Graph</>}
                </button>
             </div>
         </div>
    );
};

const DashboardView = ({ onCreateProject, onRename, onDelete, onShare }: any) => {
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
                    <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Workspace</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Access your graphs, notes, and saved resources.</p>
                 </div>
                 <button onClick={onCreateProject} className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"><IconPlus /> New Project</button>
             </div>

             {/* Recent Files - Top Section (Grid/Cards) */}
             <div className="mb-10">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Recent Files</h4>
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
                            />
                        ))}
                    </div>
                 ) : (
                    <div className="text-sm text-zinc-400 italic">No recent files.</div>
                 )}
             </div>

             {/* All Files - Bottom Section (List/Rows) */}
             <div>
                 <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">All Files</h4>
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
                            />
                        ))
                     ) : (
                        <div className="text-sm text-zinc-400 italic">No files found.</div>
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

const LibraryView = ({ onRename, onDelete, onShare, onShareDatabase }: any) => {
    const projects = useStore(s => s.projects);
    const availableTags = useStore(s => s.availableTags);
    const openProject = useStore(s => s.openProject);
    const createDatabase = useStore(s => s.createDatabase);
    const renameDatabase = useStore(s => s.renameDatabase);
    const deleteDatabase = useStore(s => s.deleteDatabase);
    const isLibrarySidebarCollapsed = useStore(s => s.isLibrarySidebarCollapsed);
    const toggleLibrarySidebar = useStore(s => s.toggleLibrarySidebar);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isCreatingDB, setIsCreatingDB] = useState(false);
    const [newDBName, setNewDBName] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [hoveredDB, setHoveredDB] = useState<{ tag: string, x: number, y: number } | null>(null);

    const handleCreateDB = () => { if (newDBName.trim()) { createDatabase(newDBName.trim()); setNewDBName(''); setIsCreatingDB(false); } };
    const databaseProjects = useMemo(() => projects.filter(p => { if (selectedTag && selectedTag !== 'Inbox') return p.databaseTags.includes(selectedTag); if (selectedTag === 'Inbox') return false; const isOnlyInbox = p.databaseTags.length === 1 && p.databaseTags[0] === 'Inbox'; const isNoTag = p.databaseTags.length === 0; return !isOnlyInbox && !isNoTag; }), [projects, selectedTag]);
    const drafts = useMemo(() => projects.filter(p => { const isOnlyInbox = p.databaseTags.length === 1 && p.databaseTags[0] === 'Inbox'; const isNoTag = p.databaseTags.length === 0; if (selectedTag && selectedTag !== 'Inbox') return false; return isOnlyInbox || isNoTag; }), [projects, selectedTag]);

    return (
        <div className="flex h-full relative">
            {hoveredDB && <StackPreview tag={hoveredDB.tag} projects={projects.filter(p => p.databaseTags.includes(hoveredDB.tag))} x={hoveredDB.x} y={hoveredDB.y} />}
            <div className={`border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-all duration-300 ease-in-out flex flex-col ${isLibrarySidebarCollapsed ? 'w-12' : 'w-64'}`}>
                <div className="flex items-center justify-between p-4 mb-2">
                     {!isLibrarySidebarCollapsed && <h3 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 text-sm"><IconDatabase className="w-4 h-4" /> Databases</h3>}
                     <div className="flex gap-1">
                        {!isLibrarySidebarCollapsed && <button onClick={() => setIsCreatingDB(true)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500" title="Create Database"><IconPlus className="w-3.5 h-3.5" /></button>}
                        <button onClick={toggleLibrarySidebar} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500" title={isLibrarySidebarCollapsed ? "Expand" : "Collapse"}>{isLibrarySidebarCollapsed ? <IconArrowRight className="w-3.5 h-3.5" /> : <IconSidebar className="w-3.5 h-3.5" />}</button>
                     </div>
                </div>
                {!isLibrarySidebarCollapsed && (
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {isCreatingDB && (
                            <div className="mb-2 flex gap-1">
                                <input className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500" placeholder="DB Name" value={newDBName} onChange={e => setNewDBName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateDB()} autoFocus />
                                <button onClick={() => setIsCreatingDB(false)} className="text-zinc-400 hover:text-zinc-600"><IconX className="w-3 h-3"/></button>
                            </div>
                        )}
                        <div className="space-y-1">
                            <button 
                                onClick={() => setSelectedTag(null)} 
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${selectedTag === null ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                            >
                                <IconGrid className="w-4 h-4" />
                                <span>All Knowledge</span>
                            </button>

                            {availableTags.filter(t => t !== 'Inbox').map(tag => (
                                <div key={tag} className="relative group flex items-center" onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setHoveredDB({ tag, x: rect.right, y: rect.top }); }} onMouseLeave={() => setHoveredDB(null)}>
                                    <button onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} className={`flex-1 text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center relative z-10 ${selectedTag === tag ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                        <div className="flex items-center gap-2"><IconFolder className="w-4 h-4 opacity-70" /><span className="truncate">{tag}</span></div>
                                    </button>
                                    <div className="absolute right-2 z-20"><DatabaseMenu tag={tag} onRename={(old: string) => { const newName = prompt("Rename Database", old); if (newName && newName !== old) renameDatabase(old, newName); }} onDelete={(name: string) => { if (confirm(`Delete database "${name}"? Projects inside will lose this tag.`)) deleteDatabase(name); }} onShare={(name: string) => onShareDatabase(name)} /></div>
                                </div>
                            ))}
                            <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                                <button onClick={() => setSelectedTag('Inbox')} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 group ${selectedTag === 'Inbox' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                    <div className="w-4 h-4 rounded-full bg-orange-200 dark:bg-orange-800/50 flex items-center justify-center text-[8px] font-bold text-orange-700 dark:text-orange-300">{drafts.length}</div><span>Inbox</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-8">
                    <div><h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2 tracking-tight">{selectedTag ? `${selectedTag} Database` : 'All Knowledge'}</h2><p className="text-zinc-400 text-sm">Manage your unified projects and captured ideas.</p></div>
                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}><IconGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}><IconList className="w-4 h-4" /></button>
                    </div>
                </div>
                {selectedTag !== 'Inbox' && (
                    <div className="mb-10">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Projects ({databaseProjects.length})</h4>
                        {databaseProjects.length === 0 ? <div className="text-sm text-zinc-400 italic">No projects found in this view.</div> : (viewMode === 'grid' ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{databaseProjects.map(p => <ProjectCard key={p.id} project={p} onClick={() => openProject(p.id)} onRename={onRename} onDelete={onDelete} onShare={onShare} />)}</div> : <div className="flex flex-col gap-2">{databaseProjects.map(p => <ProjectRow key={p.id} project={p} onClick={() => openProject(p.id)} onRename={onRename} onDelete={onDelete} onShare={onShare} />)}</div>)}
                    </div>
                )}
                {(!selectedTag || selectedTag === 'Inbox') && (
                    <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Inbox / Drafts ({drafts.length})</h4>
                        {drafts.length === 0 ? <div className="text-sm text-zinc-400 italic">No drafts in inbox.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{drafts.map(p => <div key={p.id} onClick={() => openProject(p.id)} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer group"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span><h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-200 truncate max-w-[150px]">{p.title}</h4></div><span className="text-[10px] text-zinc-400">Draft</span></div><p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-3">{p.content || p.summary || 'No content'}</p><div className="flex justify-between items-center"><div className="flex gap-1"><span className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[9px] text-orange-400">Inbox</span></div><span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Open &rarr;</span></div></div>)}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

const FriendsView = ({ mode }: { mode: 'friends' | 'team' }) => {
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
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center"><h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{mode === 'team' ? 'Teams' : 'Friends'}</h2><button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500"><IconPlus className="w-4 h-4" /></button></div>
                <div className="flex-1 overflow-y-auto">{displayList.map((item: any) => (<div key={item.id} onClick={() => { setSelectedId(item.id); setIsSelectionMode(false); }} className={`flex items-center px-4 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${selectedId === item.id ? 'bg-white dark:bg-zinc-900 border-l-4 border-blue-500 shadow-sm' : 'border-l-4 border-transparent'}`}><div className={`w-10 h-10 ${mode === 'team' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-zinc-200 dark:bg-zinc-700'} rounded-lg flex items-center justify-center text-lg mr-3`}>{item.avatar}</div><div className="flex-1 min-w-0"><h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate">{item.name}</h3><p className="text-xs text-zinc-500 truncate">{mode === 'team' ? `${item.members.length} members` : item.status}</p></div></div>))}</div>
            </div>
            {activeEntity ? (
                <div className="flex-1 flex flex-col bg-[#F4F4F5] dark:bg-zinc-900 relative">
                    <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
                        <div className="flex items-center gap-3"><div className={`w-8 h-8 ${isGroup ? 'bg-purple-100 dark:bg-purple-900/30 rounded-lg' : 'bg-zinc-200 dark:bg-zinc-700 rounded-full'} flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-xs`}>{activeEntity.avatar}</div><div><h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">{activeEntity.name}</h3>{isSelectionMode && <span className="text-xs text-blue-600 font-medium">Select messages to export</span>}</div></div>
                        <div className="flex gap-2">
                            {isSelectionMode ? (<div className="flex items-center gap-2"><button onClick={() => { setIsSelectionMode(false); setSelectedMessageIds(new Set()); }} className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancel</button><div className="relative"><button onClick={() => setExportMenuOpen(!exportMenuOpen)} disabled={selectedMessageIds.size === 0} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${selectedMessageIds.size > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>Export ({selectedMessageIds.size})</button>{exportMenuOpen && selectedMessageIds.size > 0 && (<><div className="fixed inset-0 z-20" onClick={() => setExportMenuOpen(false)}></div><div className="absolute right-0 top-8 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 w-40 z-30 py-1"><button onClick={handleExportProject} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200">Save to Project</button><button onClick={handleDownloadTxt} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200">Download .txt</button></div></>)}</div></div>) : (<button onClick={() => setIsSelectionMode(true)} className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg shadow-sm transition-all flex items-center gap-2"><IconCheck className="w-3 h-3" /> Select</button>)}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {conversation.length === 0 ? <div className="flex items-center justify-center h-full text-zinc-400 text-sm italic">No messages yet. Start the conversation!</div> : conversation.map(msg => { const isMe = msg.senderId === 'me'; const isSelected = selectedMessageIds.has(msg.id); const isAttachment = !!msg.attachment; return (<div key={msg.id} onClick={() => toggleSelection(msg.id)} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isSelectionMode ? 'cursor-pointer hover:opacity-80' : ''}`}><div className="flex items-center gap-3 max-w-[70%]">{isSelectionMode && (<div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'}`}>{isSelected && <IconCheck className="w-3 h-3 text-white" />}</div>)}<div className={`p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-tr-none' : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-100 dark:border-zinc-700'} ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-zinc-900' : ''}`}>{!isMe && isGroup && <div className="text-[10px] font-bold text-zinc-400 mb-1">{msg.senderId}</div>}{isAttachment && msg.attachment && (<div onClick={(e) => { e.stopPropagation(); handleAttachmentClick(msg.attachment); }} className="mb-2 p-2 bg-white/50 dark:bg-zinc-950/30 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-3 min-w-[200px] cursor-pointer hover:bg-white dark:hover:bg-zinc-900 transition-colors group"><div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${msg.attachment.type === 'database' ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 group-hover:bg-blue-300 dark:group-hover:bg-blue-700' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600'}`}>{msg.attachment.type === 'database' ? <IconFolder className="w-5 h-5" /> : <IconFile className="w-5 h-5" />}</div><div className="flex-1 min-w-0"><div className="text-xs font-bold truncate flex items-center gap-1">{msg.attachment.title}<IconArrowRight className="w-3 h-3 opacity-50 group-hover:opacity-100" /></div><div className="text-[10px] opacity-70 truncate capitalize flex items-center gap-1">{msg.attachment.type === 'database' ? 'Shared Folder' : 'Shared Project'} • {msg.attachment.meta}</div></div></div>)}{msg.text}<div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-700/60 dark:text-blue-300/50' : 'text-zinc-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div></div></div>); })}
                        <div ref={messagesEndRef} />
                    </div>
                    {!isSelectionMode && (<div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800"><div className="flex gap-2 relative"><input className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400 dark:text-zinc-200" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} /><button onClick={handleSend} className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors shadow-sm"><IconSend className="w-4 h-4" /></button></div></div>)}
                </div>
            ) : <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-400">Select a {mode === 'team' ? 'team' : 'friend'} to start chatting</div>}
        </div>
    );
};

const NoteToolbar = ({ onInsert }: { onInsert: (before: string, after: string) => void }) => {
    return (
        <div className="flex items-center gap-1 mb-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
            <button onClick={() => onInsert('**', '**')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 text-xs font-bold" title="Bold">B</button>
            <button onClick={() => onInsert('*', '*')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 text-xs italic" title="Italic">I</button>
            <button onClick={() => onInsert('==', '==')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 text-xs bg-yellow-100 dark:bg-yellow-900/30" title="Highlight">H</button>
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1"></div>
            <button onClick={() => onInsert('![Image](', ')')} className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300" title="Image"><IconImage className="w-3.5 h-3.5"/></button>
        </div>
    );
};

const NoteEditor = () => {
    const content = useStore(s => s.activeProjectContent);
    const updateContent = useStore(s => s.updateNoteContent);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const handleInsert = (before: string, after: string) => { const textarea = textareaRef.current; if (!textarea) return; const start = textarea.selectionStart; const end = textarea.selectionEnd; const text = textarea.value; const newText = text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end); updateContent(newText); setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + before.length, end + before.length); }, 0); };
    return (
        <div className="h-full w-full bg-zinc-100 dark:bg-zinc-950 p-8 overflow-y-auto flex justify-center">
            <div className="max-w-3xl w-full min-h-[90vh] bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col">
                <NoteToolbar onInsert={handleInsert} />
                <textarea ref={textareaRef} className="w-full flex-1 resize-none outline-none text-zinc-800 dark:text-zinc-200 text-lg leading-relaxed font-serif bg-transparent placeholder:text-zinc-300" placeholder="Start typing..." value={content} onChange={e => updateContent(e.target.value)} />
            </div>
        </div>
    );
};

const SettingsView = () => (
    <div className="max-w-4xl mx-auto p-8 h-full overflow-y-auto bg-white dark:bg-zinc-950">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Settings</h2>
        <div className="grid grid-cols-4 gap-8">
            <div className="col-span-1 space-y-1"><button className="w-full text-left px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium rounded-lg text-sm">Profile</button><button className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium rounded-lg text-sm">Appearance</button><button className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium rounded-lg text-sm">Notifications</button></div>
            <div className="col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8"><div className="flex items-center gap-6 mb-8"><div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div><div><h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Alex Chen</h3><p className="text-zinc-500 dark:text-zinc-400 text-sm">alex.chen@example.com</p><button className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">Change Avatar</button></div></div><div className="space-y-6"><div><label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Name</label><input className="w-full max-w-md px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg text-sm" defaultValue="Alex Chen" /></div><div><label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bio</label><textarea className="w-full max-w-md px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg text-sm" rows={3} defaultValue="Product Designer & Mind Mapper" /></div></div></div>
        </div>
    </div>
);

// ... (Existing DatabaseSelector, ResourceViewer, AgentPanel)
const DatabaseSelector = ({ projectId, isOpen, onToggle }: { projectId: string, isOpen: boolean, onToggle: () => void }) => {
    const project = useStore(s => s.projects.find(p => p.id === projectId));
    const availableTags = useStore(s => s.availableTags);
    const addTag = useStore(s => s.addProjectToDatabase);
    const removeTag = useStore(s => s.removeProjectFromDatabase);

    if (!project) return null;

    return (
        <div className="relative">
            <button onClick={onToggle} className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><IconDatabase className="w-3.5 h-3.5" /><span>Saved in...</span></button>
            {isOpen && (
                <>
                <div className="fixed inset-0 z-40" onClick={onToggle} />
                <div className="absolute top-8 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-lg p-3 w-48 z-50">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Storage Location</h4>
                    <div className="flex flex-wrap gap-1 mb-3">{project.databaseTags.map(tag => (<span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded text-[10px] border border-blue-100 dark:border-blue-900/30">{tag}<button onClick={() => removeTag(projectId, tag)} className="hover:text-blue-800"><IconX className="w-2.5 h-2.5" /></button></span>))}{project.databaseTags.length === 0 && <span className="text-[10px] text-zinc-400 italic">No tags</span>}</div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Add to Database</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">{availableTags.filter(t => !project.databaseTags.includes(t)).map(tag => (<button key={tag} onClick={() => addTag(projectId, tag)} className="w-full text-left px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between group">{tag}<IconPlus className="w-3 h-3 opacity-0 group-hover:opacity-100" /></button>))}{availableTags.filter(t => !project.databaseTags.includes(t)).length === 0 && (<div className="text-[10px] text-zinc-400 italic px-2">All tags added</div>)}</div>
                </div>
                </>
            )}
        </div>
    );
};

const ResourceViewer = ({ project }: { project: any }) => {
    const [loadError, setLoadError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const handleIframeLoad = () => { setIsLoading(false); };
    const handleIframeError = () => { setIsLoading(false); setLoadError(true); };

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 overflow-hidden"><div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><IconLink className="w-4 h-4" /></div><div className="min-w-0"><h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{project.title}</h2><a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{project.url}</a></div></div>
                <div className="flex items-center gap-4"><div className="text-right hidden sm:block"><div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">AI Summary</div><div className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">{project.summary || 'No summary'}</div></div><a href={project.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors" title="Open in new tab"><IconExternal className="w-4 h-4" /></a></div>
            </div>
            <div className="flex-1 relative bg-white dark:bg-zinc-900 overflow-hidden">
                {!loadError ? (
                    <>
                        {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 z-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                        <iframe src={project.url} className="w-full h-full border-none" onLoad={handleIframeLoad} onError={handleIframeError} title="Resource Preview" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400"><IconLink className="w-8 h-8" /></div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">Preview Unavailable</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">This website cannot be embedded directly due to security restrictions (X-Frame-Options).</p>
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">Open in New Tab</a>
                    </div>
                )}
            </div>
        </div>
    );
};

const AgentPanel = () => {
    const { isAgentPanelOpen, toggleAgentPanel, chatMessages, sendAgentMessage } = useStore();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    
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

    const handleSend = () => {
        if (!input.trim()) return;
        sendAgentMessage(input);
        setInput('');
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
                    <IconMagic className="w-4 h-4" /> AI Assistant
                </div>
                <button onClick={toggleAgentPanel} className="text-zinc-400 hover:text-zinc-600"><IconX className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {chatMessages.length === 0 && (
                    <div className="text-center text-zinc-400 text-xs mt-10">
                        Ask me to generate nodes, summarize content, or connect ideas.
                    </div>
                )}
                {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="relative">
                    <input 
                        className="w-full pl-3 pr-10 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Ask AI..." 
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

const GraphLayersPanel = ({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) => {
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isOpen ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
                <IconLayers className="w-3.5 h-3.5" />
                Layers
            </button>
            {isOpen && (
                <>
                <div className="fixed inset-0 z-40" onClick={onToggle} />
                <div className="absolute top-10 left-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-xl w-48 z-50">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">Visible Sources</h4>
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

const FlowEditor = ({ activeProject, theme, nodeTypes, onRename }: any) => { // Added onRename prop
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
                         <button onClick={() => setView('dashboard')} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors mr-2" title="Back to Dashboard"><IconArrowLeft className="w-4 h-4" /></button>
                         <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                         <div className={`p-1.5 rounded-lg ${activeProject.type === 'graph' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' : activeProject.type === 'note' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300'}`}>{activeProject.type === 'graph' ? <IconGraph /> : activeProject.type === 'note' ? <IconEdit /> : <IconLink />}</div>
                         
                         {/* Clickable Title for Renaming */}
                         <div 
                            className="flex flex-col justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors group"
                            onClick={() => onRename && onRename(activeProject)}
                            title="Click to rename"
                         >
                            <div className="flex items-center gap-2">
                                <h1 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{activeProject.title}</h1>
                                <IconEdit className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                         </div>

                         {activeProject.unsavedChanges && <span className="text-[10px] text-orange-500 font-medium ml-2">Unsaved changes</span>}
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
                                    {isSyncing ? 'Syncing...' : 'Sync'}
                                </button>
                                <GraphLayersPanel 
                                    isOpen={activePopover === 'layers'} 
                                    onToggle={() => setActivePopover(activePopover === 'layers' ? null : 'layers')}
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
                        />
                        <button onClick={() => { saveProject(); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeProject.unsavedChanges ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}><IconSave className="w-3.5 h-3.5" />{activeProject.unsavedChanges ? 'Save' : 'Saved'}</button>
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
                    {activeProject.type === 'note' && <NoteEditor />}
                    {activeProject.type === 'resource' && <ResourceViewer project={activeProject} />}
                </div>
            </div>
            <AgentPanel />
        </div>
    );
};

// --- Main App ---

export default function App() {
  const { 
    activeProjectId, isSidebarCollapsed, toggleSidebar,
    currentView, setView, projects, saveProject, theme, toggleTheme,
    deleteProject, editingNodeId
  } = useStore();

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<any>(null);
  const [projectToShare, setProjectToShare] = useState<any>(null);
  const [databaseToShare, setDatabaseToShare] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Sync Theme with DOM
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Global Keydown for Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (activeProjectId) {
                saveProject();
                setToastMessage('Project saved successfully');
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProjectId, saveProject]);

  const nodeTypes = useMemo(() => ({ mindMapNode: MindNode }), []);

  const handleDelete = (id: string) => {
      if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
          deleteProject(id);
      }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onCreateProject={() => setIsNewProjectModalOpen(true)} onRename={(p: any) => setProjectToRename(p)} onDelete={handleDelete} onShare={(p: any) => setProjectToShare(p)} />;
      case 'library':
        return <LibraryView onRename={(p: any) => setProjectToRename(p)} onDelete={handleDelete} onShare={(p: any) => setProjectToShare(p)} onShareDatabase={(db: string) => setDatabaseToShare(db)} />;
      case 'editor':
        if (!activeProject) return <div className="flex items-center justify-center h-full text-zinc-400">Select a project</div>;
        // WRAP Editor in ReactFlowProvider to fix hook errors
        return (
            <ReactFlowProvider key={activeProject.id}>
                <FlowEditor 
                    activeProject={activeProject} 
                    theme={theme} 
                    nodeTypes={nodeTypes} 
                    onRename={(p: any) => setProjectToRename(p)} 
                />
            </ReactFlowProvider>
        );
      case 'boards': return <GeneratorView />;
      case 'friends': return <FriendsView mode="friends" />;
      case 'team': return <FriendsView mode="team" />;
      case 'settings': return <SettingsView />;
      default: return <div className="flex items-center justify-center h-full text-zinc-400">Work in progress...</div>;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors duration-200">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 z-40 shadow-sm`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800/50">
          {!isSidebarCollapsed && <div className="flex items-center gap-2"><div className="w-6 h-6 text-zinc-900 dark:text-white"><IconLogo /></div><span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">LinkVerse</span></div>}
          <button onClick={toggleSidebar} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"><IconSidebar /></button>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
          <div>
              {!isSidebarCollapsed && <div className="px-3 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Studio</div>}
              <div className="space-y-1">
                  <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'dashboard' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}><IconHome />{!isSidebarCollapsed && <span>Workspace</span>}</button>
                  <button onClick={() => setView('boards')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'boards' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}><IconGraph />{!isSidebarCollapsed && <span>Generator</span>}</button>
              </div>
          </div>
          <div>
              {!isSidebarCollapsed && <div className="px-3 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Knowledge</div>}
              <div className="space-y-1">
                  <button onClick={() => setView('library')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'library' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}><IconDatabase />{!isSidebarCollapsed && <span>Library</span>}</button>
              </div>
          </div>
          <div>
              {!isSidebarCollapsed && <div className="px-3 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Social</div>}
              <div className="space-y-1">
                  <button onClick={() => setView('friends')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'friends' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}><IconUser />{!isSidebarCollapsed && <span>Friends</span>}</button>
                  <button onClick={() => setView('team')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'team' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'}`}><IconUsers />{!isSidebarCollapsed && <span>Team</span>}</button>
              </div>
          </div>
        </nav>
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
              <button onClick={() => setView('settings')} className="flex items-center gap-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 p-2 rounded-lg transition-colors group flex-1">
                 <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-400 opacity-80"></div></div>
                 {!isSidebarCollapsed && (<div className="flex-1 overflow-hidden text-left"><div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">Alex Chen</div><div className="text-xs text-zinc-400">Pro Plan</div></div>)}
              </button>
              <button onClick={toggleTheme} className="p-2 ml-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">{theme === 'light' ? <IconMoon className="w-4 h-4"/> : <IconSun className="w-4 h-4"/>}</button>
          </div>
        </div>
      </div>
      <main className="flex-1 h-full overflow-hidden relative">{renderContent()}</main>
      {isNewProjectModalOpen && <NewProjectModal onClose={() => setIsNewProjectModalOpen(false)} />}
      {editingNodeId && <NodeEditModal />}
      {projectToRename && <RenameModal project={projectToRename} onClose={() => setProjectToRename(null)} />}
      {projectToShare && <ShareModal entity={projectToShare} type="project" onClose={() => setProjectToShare(null)} />}
      {databaseToShare && <ShareModal entity={databaseToShare} type="database" onClose={() => setDatabaseToShare(null)} />}
    </div>
  );
}
