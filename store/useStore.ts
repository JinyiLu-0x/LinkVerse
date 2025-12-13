
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  EdgeChange,
  NodeChange,
  MarkerType,
  Node,
  Edge
} from 'reactflow';
import { MindMapState, MindMapNode, ViewType, Project, ProjectType, ChatMessage, Friend, DirectMessage, Group, Theme, ViewState } from '../types';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

// --- VISUAL CONFIG: Straight Gray Lines ---
const DEFAULT_EDGE_STYLE = { stroke: '#a1a1aa', strokeWidth: 1 }; // Zinc-400

// --- STRICT PALETTE (3 Core Colors) ---
const STRICT_PALETTE = [
    '#6366f1', // Indigo (Primary/Root)
    '#10b981', // Emerald (Secondary/Category)
    '#f59e0b', // Amber (Tertiary/Leaf)
];

// --- Mock Data ---

const initialSnippets: Project[] = [
  { 
    id: 'snip-1', 
    type: 'note', 
    title: 'React Server Components', 
    content: 'RSC allows rendering on server... (Snippet)', 
    updatedAt: '2023-10-12', 
    databaseTags: ['Inbox', 'Coding', 'React'], 
    nodes: [], edges: [], chatHistory: [], unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  },
  { 
    id: 'snip-2', 
    type: 'note', 
    title: 'Minimalist Design Idea', 
    content: 'Less is more... (Snippet)', 
    updatedAt: '2023-11-20', 
    databaseTags: ['Inbox', 'Design'], 
    nodes: [], edges: [], chatHistory: [], unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  },
  {
    id: 'snip-3', 
    type: 'note', 
    title: 'Effective Meeting Rules', 
    content: '**Agenda is mandatory**\n\n1. No phones.\n2. Clear agenda.\n3. Action items at end.\n4. Max 30 mins.',
    updatedAt: '2023-11-25', 
    databaseTags: ['Inbox', 'Work', 'Productivity'], 
    nodes: [], edges: [], chatHistory: [], unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  },
  { 
    id: 'snip-4', 
    type: 'note', 
    title: 'TypeScript Generics', 
    content: '```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```\nUseful for reusable components.',
    updatedAt: '2023-12-05', 
    databaseTags: ['Inbox', 'Coding', 'TypeScript'], 
    nodes: [], edges: [], chatHistory: [], unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  },
  { 
    id: 'snip-5', 
    type: 'resource', 
    title: 'Vercel AI SDK', 
    url: 'https://sdk.vercel.ai/docs', 
    summary: 'The AI SDK is a library for building AI-powered applications with React, Svelte, Vue, and Solid.',
    updatedAt: '2023-12-10', 
    databaseTags: ['Dev', 'AI', 'React'], 
    nodes: [], edges: [], chatHistory: [], unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  },
  {
    id: 'snip-6',
    type: 'resource',
    title: 'Trae AI',
    url: 'https://www.trae.ai/solo',
    summary: 'Adaptive AI IDE for developers, featuring native AI integration for faster coding workflows.',
    updatedAt: 'Just now',
    databaseTags: ['Dev', 'AI', 'Tools'],
    nodes: [], edges: [], chatHistory: [], unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  },
  {
    id: 'snip-7',
    type: 'note',
    title: 'Quick Idea',
    content: 'Need to research more about graph database optimizations...',
    updatedAt: 'Just now',
    databaseTags: ['Inbox'],
    nodes: [], edges: [], chatHistory: [], unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  }
];

// --- Demo Graph 1: Frontend Stack ---
const demoGraphNodes: MindMapNode[] = [
    { id: 'root-demo', type: 'mindMapNode', position: { x: 0, y: 0 }, data: { label: 'Frontend Tech Stack', importance: 3, nodeType: 'root', source: 'Work', color: STRICT_PALETTE[0] } },
    
    // Branch 1: React
    { id: 'cat-react', type: 'mindMapNode', position: { x: -250, y: 150 }, data: { label: 'React Ecosystem', importance: 2, nodeType: 'category', source: 'React', color: STRICT_PALETTE[1] } },
    { id: 'leaf-next', type: 'mindMapNode', position: { x: -350, y: 300 }, data: { label: 'Next.js 14', importance: 1, nodeType: 'petal', source: 'React', color: STRICT_PALETTE[2] } },
    { id: 'leaf-rsc', type: 'mindMapNode', position: { x: -200, y: 350 }, data: { label: 'Server Components', importance: 1, nodeType: 'petal', source: 'React', color: STRICT_PALETTE[2] } },

    // Branch 2: State
    { id: 'cat-state', type: 'mindMapNode', position: { x: 250, y: 150 }, data: { label: 'State Management', importance: 2, nodeType: 'category', source: 'Coding', color: STRICT_PALETTE[1] } },
    { id: 'leaf-zustand', type: 'mindMapNode', position: { x: 200, y: 300 }, data: { label: 'Zustand', importance: 1, nodeType: 'petal', source: 'Coding', color: STRICT_PALETTE[2] } },
    { id: 'leaf-query', type: 'mindMapNode', position: { x: 350, y: 300 }, data: { label: 'TanStack Query', importance: 1, nodeType: 'petal', source: 'Coding', color: STRICT_PALETTE[2] } },

    // Branch 3: Styling
    { id: 'cat-style', type: 'mindMapNode', position: { x: 0, y: -200 }, data: { label: 'Styling / UI', importance: 2, nodeType: 'category', source: 'Design', color: STRICT_PALETTE[1] } },
    { id: 'leaf-tailwind', type: 'mindMapNode', position: { x: -100, y: -350 }, data: { label: 'Tailwind CSS', importance: 1, nodeType: 'petal', source: 'Design', color: STRICT_PALETTE[2] } },
    { id: 'leaf-framer', type: 'mindMapNode', position: { x: 100, y: -350 }, data: { label: 'Framer Motion', importance: 1, nodeType: 'petal', source: 'Design', color: STRICT_PALETTE[2] } },
];

const demoGraphEdges: Edge[] = [
    { id: 'e-r-1', source: 'root-demo', target: 'cat-react', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-r-2', source: 'root-demo', target: 'cat-state', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-r-3', source: 'root-demo', target: 'cat-style', type: 'straight', style: DEFAULT_EDGE_STYLE },
    
    { id: 'e-c1-1', source: 'cat-react', target: 'leaf-next', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-c1-2', source: 'cat-react', target: 'leaf-rsc', type: 'straight', style: DEFAULT_EDGE_STYLE },
    
    { id: 'e-c2-1', source: 'cat-state', target: 'leaf-zustand', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-c2-2', source: 'cat-state', target: 'leaf-query', type: 'straight', style: DEFAULT_EDGE_STYLE },

    { id: 'e-c3-1', source: 'cat-style', target: 'leaf-tailwind', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-c3-2', source: 'cat-style', target: 'leaf-framer', type: 'straight', style: DEFAULT_EDGE_STYLE },
];

// --- Demo Graph 2: Complex Architecture (New) ---
const archNodes: MindMapNode[] = [
    // Root
    { id: 'arch-root', type: 'mindMapNode', position: { x: 0, y: 0 }, data: { label: 'Enterprise SaaS Architecture', importance: 3, nodeType: 'root', source: 'Architecture', color: STRICT_PALETTE[0] } },

    // Branch A: Client Side (Top Right)
    { id: 'arch-client', type: 'mindMapNode', position: { x: 300, y: -200 }, data: { label: 'Client Layer', importance: 2, nodeType: 'category', source: 'Frontend', color: STRICT_PALETTE[1] } },
    { id: 'arch-pwa', type: 'mindMapNode', position: { x: 450, y: -300 }, data: { label: 'PWA / Mobile', importance: 1, nodeType: 'petal', source: 'Frontend', color: STRICT_PALETTE[2] } },
    { id: 'arch-state', type: 'mindMapNode', position: { x: 500, y: -150 }, data: { label: 'Global State', importance: 1, nodeType: 'petal', source: 'Frontend', color: STRICT_PALETTE[2] } },
    { id: 'arch-analytics', type: 'mindMapNode', position: { x: 350, y: -400 }, data: { label: 'Analytics', importance: 1, nodeType: 'petal', source: 'Frontend', color: STRICT_PALETTE[2] } },

    // Branch B: API Gateway (Top Left)
    { id: 'arch-api', type: 'mindMapNode', position: { x: -300, y: -200 }, data: { label: 'API Gateway', importance: 2, nodeType: 'category', source: 'Backend', color: STRICT_PALETTE[1] } },
    { id: 'arch-graphql', type: 'mindMapNode', position: { x: -450, y: -350 }, data: { label: 'GraphQL Fed.', importance: 1, nodeType: 'petal', source: 'Backend', color: STRICT_PALETTE[2] } },
    { id: 'arch-auth', type: 'mindMapNode', position: { x: -200, y: -400 }, data: { label: 'Auth Service', importance: 1, nodeType: 'petal', source: 'Backend', color: STRICT_PALETTE[2] } },
    { id: 'arch-rate', type: 'mindMapNode', position: { x: -500, y: -150 }, data: { label: 'Rate Limiter', importance: 1, nodeType: 'petal', source: 'Backend', color: STRICT_PALETTE[2] } },

    // Branch C: Data Persistence (Bottom)
    { id: 'arch-data', type: 'mindMapNode', position: { x: 0, y: 350 }, data: { label: 'Data Persistence', importance: 2, nodeType: 'category', source: 'Database', color: STRICT_PALETTE[1] } },
    { id: 'arch-postgres', type: 'mindMapNode', position: { x: -150, y: 500 }, data: { label: 'Primary DB (PG)', importance: 1, nodeType: 'petal', source: 'Database', color: STRICT_PALETTE[2] } },
    { id: 'arch-redis', type: 'mindMapNode', position: { x: 150, y: 500 }, data: { label: 'Redis Cache', importance: 1, nodeType: 'petal', source: 'Database', color: STRICT_PALETTE[2] } },
    { id: 'arch-vector', type: 'mindMapNode', position: { x: 0, y: 600 }, data: { label: 'Vector Store', importance: 1, nodeType: 'petal', source: 'Database', color: STRICT_PALETTE[2] } },

    // Branch D: Async Workers (Left)
    { id: 'arch-workers', type: 'mindMapNode', position: { x: -400, y: 150 }, data: { label: 'Async Workers', importance: 2, nodeType: 'category', source: 'DevOps', color: STRICT_PALETTE[1] } },
    { id: 'arch-queues', type: 'mindMapNode', position: { x: -550, y: 250 }, data: { label: 'Message Queues', importance: 1, nodeType: 'petal', source: 'DevOps', color: STRICT_PALETTE[2] } },
    { id: 'arch-cron', type: 'mindMapNode', position: { x: -500, y: 50 }, data: { label: 'Cron Jobs', importance: 1, nodeType: 'petal', source: 'DevOps', color: STRICT_PALETTE[2] } },

    // Branch E: AI Services (Right)
    { id: 'arch-ai', type: 'mindMapNode', position: { x: 400, y: 150 }, data: { label: 'AI Services', importance: 2, nodeType: 'category', source: 'AI', color: STRICT_PALETTE[1] } },
    { id: 'arch-llm', type: 'mindMapNode', position: { x: 550, y: 100 }, data: { label: 'LLM Provider', importance: 1, nodeType: 'petal', source: 'AI', color: STRICT_PALETTE[2] } },
    { id: 'arch-rag', type: 'mindMapNode', position: { x: 500, y: 300 }, data: { label: 'RAG Pipeline', importance: 1, nodeType: 'petal', source: 'AI', color: STRICT_PALETTE[2] } },
];

const archEdges: Edge[] = [
    // Roots
    { id: 'e-a-1', source: 'arch-root', target: 'arch-client', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-2', source: 'arch-root', target: 'arch-api', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-3', source: 'arch-root', target: 'arch-data', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-4', source: 'arch-root', target: 'arch-workers', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-5', source: 'arch-root', target: 'arch-ai', type: 'straight', style: DEFAULT_EDGE_STYLE },

    // Leaves
    { id: 'e-a-c1', source: 'arch-client', target: 'arch-pwa', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-c2', source: 'arch-client', target: 'arch-state', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-c3', source: 'arch-client', target: 'arch-analytics', type: 'straight', style: DEFAULT_EDGE_STYLE },

    { id: 'e-a-ap1', source: 'arch-api', target: 'arch-graphql', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-ap2', source: 'arch-api', target: 'arch-auth', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-ap3', source: 'arch-api', target: 'arch-rate', type: 'straight', style: DEFAULT_EDGE_STYLE },

    { id: 'e-a-d1', source: 'arch-data', target: 'arch-postgres', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-d2', source: 'arch-data', target: 'arch-redis', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-d3', source: 'arch-data', target: 'arch-vector', type: 'straight', style: DEFAULT_EDGE_STYLE },

    { id: 'e-a-w1', source: 'arch-workers', target: 'arch-queues', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-w2', source: 'arch-workers', target: 'arch-cron', type: 'straight', style: DEFAULT_EDGE_STYLE },

    { id: 'e-a-ai1', source: 'arch-ai', target: 'arch-llm', type: 'straight', style: DEFAULT_EDGE_STYLE },
    { id: 'e-a-ai2', source: 'arch-ai', target: 'arch-rag', type: 'straight', style: DEFAULT_EDGE_STYLE },
    
    // Cross Links (Complexity)
    { id: 'e-x-1', source: 'arch-auth', target: 'arch-client', type: 'straight', style: { stroke: '#a1a1aa', strokeDasharray: '5,5' }, label: 'Token' },
    { id: 'e-x-2', source: 'arch-vector', target: 'arch-rag', type: 'straight', style: { stroke: '#a1a1aa', strokeDasharray: '5,5' }, label: 'Retrieval' },
    { id: 'e-x-3', source: 'arch-queues', target: 'arch-redis', type: 'straight', style: { stroke: '#a1a1aa', strokeDasharray: '5,5' } },
];


const initialProjects: Project[] = [
  {
    id: 'proj-1',
    type: 'graph',
    title: '2024 Q1 Roadmap',
    updatedAt: '2 hours ago',
    databaseTags: ['Personal', 'Graphs'],
    nodes: [
      { id: 'root-1', type: 'mindMapNode', position: { x: 0, y: 0 }, data: { label: '2024 Goals', importance: 3, nodeType: 'root', source: 'Personal', color: STRICT_PALETTE[0] } },
      { id: 'node-ex-1', type: 'mindMapNode', position: { x: 250, y: 100 }, data: { label: 'Product Launch', importance: 1, nodeType: 'petal', source: 'Personal', color: STRICT_PALETTE[1] } },
      { id: 'node-ex-2', type: 'mindMapNode', position: { x: -200, y: 150 }, data: { label: 'Team Hiring', importance: 1, nodeType: 'petal', source: 'Personal', color: STRICT_PALETTE[2] } }
    ],
    edges: [
        { id: 'e1-2', source: 'root-1', target: 'node-ex-1', type: 'straight', style: DEFAULT_EDGE_STYLE },
        { id: 'e1-3', source: 'root-1', target: 'node-ex-2', type: 'straight', style: DEFAULT_EDGE_STYLE }
    ],
    chatHistory: [],
    content: '',
    unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  },
  {
    id: 'proj-demo-graph',
    type: 'graph',
    title: 'Frontend Tech Stack (Work)',
    updatedAt: '4 hours ago',
    databaseTags: ['Work', 'React', 'Graphs'],
    nodes: demoGraphNodes,
    edges: demoGraphEdges,
    chatHistory: [],
    content: '',
    unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 0.8, isMiniMapOpen: true }
  },
  {
    id: 'proj-demo-arch',
    type: 'graph',
    title: 'Enterprise SaaS Architecture',
    updatedAt: '1 hour ago',
    databaseTags: ['Work', 'Architecture', 'DevOps'],
    nodes: archNodes,
    edges: archEdges,
    chatHistory: [],
    content: '',
    unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 0.65, isMiniMapOpen: true }
  },
  {
    id: 'proj-2',
    type: 'note', 
    title: 'Weekly Sync Notes',
    updatedAt: '1 day ago',
    databaseTags: ['Work'],
    nodes: [],
    edges: [],
    content: '# Weekly Sync\n\n**Attendees**: All\n\n- Focus on growth\n- User retention\n- ==AI features priority==',
    chatHistory: [],
    unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  },
  {
    id: 'proj-3',
    type: 'resource',
    title: 'GenAI Docs',
    updatedAt: '3 days ago',
    databaseTags: ['Dev'],
    nodes: [],
    edges: [],
    url: 'https://ai.google.dev',
    summary: 'Official documentation for Google Gemini API.',
    chatHistory: [],
    content: '',
    unsavedChanges: false,
    viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
  }
];

const initialFriends: Friend[] = [
    { id: 'f1', name: 'Sarah Jenkins', avatar: 'SJ', status: 'online' },
    { id: 'f2', name: 'David Miller', avatar: 'DM', status: 'offline' },
    { id: 'f3', name: 'Emily Zhang', avatar: 'EZ', status: 'online' },
    { id: 'f4', name: 'Michael Ross', avatar: 'MR', status: 'offline' },
];

const initialGroups: Group[] = [
    { id: 'g1', name: 'Product Team', avatar: '🚀', members: ['f1', 'f3'] },
    { id: 'g2', name: 'Weekend Hikers', avatar: '🏔️', members: ['f2', 'f4'] }
];

const initialDirectMessages: DirectMessage[] = [
    { id: 'dm-1', senderId: 'f1', receiverId: 'me', text: 'Hey, did you see the new designs?', timestamp: Date.now() - 10000000 },
    { id: 'dm-2', senderId: 'me', receiverId: 'f1', text: 'Yes! The typography is much better.', timestamp: Date.now() - 9000000 },
    { id: 'dm-3', senderId: 'f1', receiverId: 'me', text: 'Agreed. Let\'s sync later.', timestamp: Date.now() - 8000000 },
];

const allProjects = [...initialProjects, ...initialSnippets];

const allTags = new Set([
    ...allProjects.flatMap(p => p.databaseTags),
    'Graphs'
]);

interface StoreState extends MindMapState {
    isLibrarySidebarCollapsed: boolean;
    isAgentPanelOpen: boolean;
    toggleLibrarySidebar: () => void;
    toggleAgentPanel: () => void;
    updateEdgeLabel: (edgeId: string, label: string) => void;
}

// ... existing code ... (The rest of the file remains unchanged, preserving cleanJsonOutput, tool declarations, AI client, and useStore implementation)
const cleanJsonOutput = (text: string) => {
  let cleaned = text.trim();
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
};

// --- TOOL DECLARATIONS FOR AGENT ---
const addNodeTool: FunctionDeclaration = {
    name: 'addNode',
    description: 'Add a new node to the knowledge graph. Requires a label. ParentID is optional but recommended.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            label: { type: Type.STRING, description: 'The text label for the node.' },
            parentId: { type: Type.STRING, description: 'The ID of the parent node to attach to.' },
            summary: { type: Type.STRING, description: 'A short description.' },
            color: { type: Type.STRING, description: 'Optional hex color code for the node.' }
        },
        required: ['label']
    }
};

const connectNodesTool: FunctionDeclaration = {
    name: 'connectNodes',
    description: 'Create a link/edge between two existing nodes.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            sourceId: { type: Type.STRING, description: 'ID of the starting node' },
            targetId: { type: Type.STRING, description: 'ID of the ending node' }
        },
        required: ['sourceId', 'targetId']
    }
};

const changeLayoutTool: FunctionDeclaration = {
    name: 'changeLayout',
    description: 'Change the visual style of the connection lines (edges).',
    parameters: {
        type: Type.OBJECT,
        properties: {
            edgeType: { type: Type.STRING, description: 'The type of edge: "straight" (default, clean) or "default" (curved/bezier).' }
        },
        required: ['edgeType']
    }
};

const syncGraphTool: FunctionDeclaration = {
    name: 'syncGraph',
    description: 'Sync the entire graph with the latest database content. Use this when the user wants to update or refresh the graph structure.',
    parameters: {
        type: Type.OBJECT,
        properties: {}
    }
};

// Helper to safely get AI instance
const getAIClient = () => {
    // Check if process is defined (Node/Build env)
    // In many frontend builds, process.env is replaced by the bundler.
    // However, if the key is missing, we don't want to crash the whole app on load.
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
    if (!apiKey) {
        console.warn("API Key is missing. AI features will not work.");
    }
    return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      currentView: 'dashboard',
      activeProjectId: null,
      isSidebarCollapsed: false,
      isLibrarySidebarCollapsed: false,
      isAgentPanelOpen: true,
      editingNodeId: null,
      isSyncing: false,
      
      connectingNodeId: null,

      setView: (view: ViewType) => set({ currentView: view }),
      toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleLibrarySidebar: () => set(state => ({ isLibrarySidebarCollapsed: !state.isLibrarySidebarCollapsed })),
      toggleAgentPanel: () => set(state => ({ isAgentPanelOpen: !state.isAgentPanelOpen })),
      setEditingNode: (nodeId: string | null) => set({ editingNodeId: nodeId }),
      
      setConnectingNode: (nodeId: string | null) => set({ connectingNodeId: nodeId }),
      
      connectNodes: (targetNodeId: string) => {
          const { connectingNodeId, edges, activeProjectId } = get();
          if (!connectingNodeId || connectingNodeId === targetNodeId) return;

          const exists = edges.some(e => 
              (e.source === connectingNodeId && e.target === targetNodeId) ||
              (e.source === targetNodeId && e.target === connectingNodeId)
          );

          if (!exists) {
              const newEdge: Edge = {
                  id: `e-${connectingNodeId}-${targetNodeId}-${Date.now()}`,
                  source: connectingNodeId,
                  target: targetNodeId,
                  type: 'straight', 
                  style: DEFAULT_EDGE_STYLE,
              };
              
              set({ 
                  edges: [...edges, newEdge],
                  connectingNodeId: null 
              });

              if (activeProjectId) {
                  get().markProjectAsDirty(activeProjectId);
              }
          } else {
               set({ connectingNodeId: null });
          }
      },

      projects: allProjects,
      friends: initialFriends,
      groups: initialGroups,
      directMessages: initialDirectMessages,
      availableTags: Array.from(allTags),

      nodes: [],
      edges: [],
      activeProjectContent: '',
      chatMessages: [],

      activeGraphFilters: [],
      toggleGraphFilter: (tag) => set(state => {
          const filters = state.activeGraphFilters;
          return {
              activeGraphFilters: filters.includes(tag) 
                 ? filters.filter(t => t !== tag)
                 : [...filters, tag]
          };
      }),
      setGraphFilters: (tags) => set({ activeGraphFilters: tags }),

      markProjectAsDirty: (projectId: string) => {
        set(state => ({
            projects: state.projects.map(p => p.id === projectId ? { ...p, unsavedChanges: true } : p)
        }));
      },

      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as MindMapNode[],
        });
        const { activeProjectId, projects, nodes } = get();
        if (activeProjectId) {
            set({ 
                projects: projects.map(p => p.id === activeProjectId ? { ...p, nodes, unsavedChanges: true } : p) 
            });
        }
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
        const { activeProjectId, projects, edges } = get();
        if (activeProjectId) {
            set({ 
                projects: projects.map(p => p.id === activeProjectId ? { ...p, edges, unsavedChanges: true } : p) 
            });
        }
      },

      onConnect: (connection: Connection) => {
        set({
          edges: addEdge({ 
            ...connection, 
            type: 'straight', 
            style: DEFAULT_EDGE_STYLE,
          }, get().edges),
        });
        const { activeProjectId, projects, edges } = get();
        if (activeProjectId) {
            set({ 
                projects: projects.map(p => p.id === activeProjectId ? { ...p, edges, unsavedChanges: true } : p) 
            });
        }
      },

      addNode: (position, parentId, label = 'New Concept', color) => {
        const { nodes, edges, activeProjectId } = get();
        const id = `node-${Date.now()}`;
        const selectedNode = parentId ? nodes.find(n => n.id === parentId) : nodes.find(n => n.selected);
        
        let pos = position; 
        
        if (!pos) {
             if (selectedNode) {
                 const offset = 300; // Increased offset for better spacing
                 // Find direction from origin to selected node to continue "outward" flow
                 const angle = Math.atan2(selectedNode.position.y, selectedNode.position.x) + (Math.random() - 0.5) * 0.5; 
                 pos = { 
                     x: selectedNode.position.x + offset * Math.cos(angle), 
                     y: selectedNode.position.y + offset * Math.sin(angle)
                 };
             } else {
                 pos = { x: Math.random() * 100 + 100, y: Math.random() * 100 + 100 };
             }
        }

        // Strict Palette Logic
        let nodeColor = color;
        if (!nodeColor) {
            if (selectedNode?.data.nodeType === 'root') nodeColor = STRICT_PALETTE[1];
            else if (selectedNode?.data.nodeType === 'category') nodeColor = STRICT_PALETTE[2];
            else nodeColor = STRICT_PALETTE[2];
        }

        const newNode: MindMapNode = {
            id,
            type: 'mindMapNode',
            position: pos,
            data: { 
                label: label, 
                importance: 1, 
                summary: '', 
                nodeType: 'petal',
                color: nodeColor 
            },
            selected: true
        };

        const updatedNodes = [
          ...nodes.map(n => ({...n, selected: false})),
          newNode
        ];
        let updatedEdges = [...edges];

        if (selectedNode) {
            updatedEdges.push({
                id: `edge-${selectedNode.id}-${id}`,
                source: selectedNode.id,
                target: id,
                type: 'straight',
                style: DEFAULT_EDGE_STYLE,
            });
        }

        set({ nodes: updatedNodes, edges: updatedEdges });
        
        if (activeProjectId) {
            get().markProjectAsDirty(activeProjectId);
            if(!parentId) get().setEditingNode(id);
        }
      },

      deleteNode: (nodeId: string) => {
          set((state) => {
              const newNodes = state.nodes.filter((n) => n.id !== nodeId);
              const newEdges = state.edges.filter(
                  (e) => e.source !== nodeId && e.target !== nodeId
              );
              return { nodes: newNodes, edges: newEdges };
          });
          const { activeProjectId } = get();
          if (activeProjectId) get().markProjectAsDirty(activeProjectId);
      },

      deleteEdge: (edgeId: string) => {
          set((state) => ({
              edges: state.edges.filter(e => e.id !== edgeId)
          }));
          const { activeProjectId } = get();
          if (activeProjectId) get().markProjectAsDirty(activeProjectId);
      },

      updateEdgeLabel: (edgeId: string, label: string) => {
          set((state) => ({
              edges: state.edges.map(e => {
                  if (e.id === edgeId) {
                      return { ...e, label: label, labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 11 }, labelBgStyle: { fillOpacity: 0.9, fill: '#ffffff' } };
                  }
                  return e;
              })
          }));
          const { activeProjectId } = get();
          if (activeProjectId) get().markProjectAsDirty(activeProjectId);
      },

      onNodesDelete: (deletedNodes: Node[]) => {
          const deletedIds = new Set(deletedNodes.map(n => n.id));
          set(state => ({
              nodes: state.nodes.filter(n => !deletedIds.has(n.id)),
              edges: state.edges.filter(e => !deletedIds.has(e.source) && !deletedIds.has(e.target))
          }));
          const { activeProjectId } = get();
          if (activeProjectId) get().markProjectAsDirty(activeProjectId);
      },

      onEdgesDelete: (deletedEdges: Edge[]) => {
          const deletedIds = new Set(deletedEdges.map(e => e.id));
          set(state => ({
              edges: state.edges.filter(e => !deletedIds.has(e.id))
          }));
          const { activeProjectId } = get();
          if (activeProjectId) get().markProjectAsDirty(activeProjectId);
      },

      openProject: (projectId: string) => {
        const project = get().projects.find(p => p.id === projectId);
        if (project) {
          // Calculate unique sources for default visibility
          const sources = new Set<string>();
          project.nodes.forEach(n => {
              if (n.data.source) sources.add(n.data.source);
          });

          set({
            activeProjectId: projectId,
            nodes: project.nodes,
            edges: project.edges,
            activeProjectContent: project.content || '',
            chatMessages: project.chatHistory || [],
            currentView: 'editor',
            activeGraphFilters: Array.from(sources)
          });
        }
      },

      updateProjectViewState: (projectId: string, viewState: Partial<ViewState>) => {
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? {
                  ...p,
                  viewState: { ...p.viewState, ...viewState }
              } : p)
          }));
      },

      createProject: async (title: string, type: ProjectType, url?: string) => {
        const newId = `proj-${Date.now()}`;
        
        // Graph projects default to 'Graphs' database, others to 'Inbox'
        const defaultTags = type === 'graph' ? ['Graphs'] : ['Inbox'];
        
        const newProject: Project = {
          id: newId,
          type,
          title: title || 'Untitled Project',
          updatedAt: 'Just now',
          databaseTags: defaultTags, 
          nodes: [],
          edges: [],
          chatHistory: [],
          content: '',
          url: url || undefined,
          unsavedChanges: false,
          viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
        };

        if (type === 'graph') {
           newProject.nodes = [{
             id: 'root-new',
             type: 'mindMapNode',
             position: { x: 0, y: 0 },
             data: { label: title || 'Central Topic', importance: 3, nodeType: 'root', color: STRICT_PALETTE[0] }
           }];
        } else if (type === 'note') {
            newProject.content = `# ${title}\n\n`;
        } else if (type === 'resource' && url) {
            newProject.summary = "Click 'Summarize' in the Agent panel to analyze this resource.";
        }

        set(state => ({
          projects: [newProject, ...state.projects],
          activeProjectId: newId,
          nodes: newProject.nodes,
          edges: newProject.edges,
          activeProjectContent: newProject.content || '',
          chatMessages: [],
          availableTags: Array.from(new Set([...state.availableTags, ...defaultTags])),
          currentView: 'editor',
          activeGraphFilters: [] // Default for new graph
        }));
      },

      saveProject: () => {
          const { activeProjectId, projects } = get();
          if (!activeProjectId) return;
          
          const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          set({
              projects: projects.map(p => 
                  p.id === activeProjectId 
                  ? { ...p, updatedAt: `Saved at ${now}`, unsavedChanges: false }
                  : p
              )
          });
      },

      deleteProject: (projectId: string) => {
          set(state => ({
              projects: state.projects.filter(p => p.id !== projectId),
              ...(state.activeProjectId === projectId ? { activeProjectId: null, currentView: 'dashboard' } : {})
          }));
      },

      updateProjectTitle: (projectId: string, newTitle: string) => {
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, title: newTitle, unsavedChanges: true } : p)
          }));
      },

      updateProjectUrl: (projectId: string, newUrl: string) => {
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, url: newUrl, unsavedChanges: true } : p)
          }));
      },

      updateNoteContent: (content: string) => {
          set({ activeProjectContent: content });
          const { activeProjectId, projects } = get();
          if (activeProjectId) {
              set({ 
                  projects: projects.map(p => p.id === activeProjectId ? { ...p, content, unsavedChanges: true } : p) 
              });
          }
      },

      addProjectToDatabase: (projectId: string, tag: string) => {
        set(state => {
          const newAvailableTags = state.availableTags.includes(tag) 
            ? state.availableTags 
            : [...state.availableTags, tag];

          return {
            availableTags: newAvailableTags,
            projects: state.projects.map(p => {
                if (p.id !== projectId) return p;
                const newTags = [...p.databaseTags, tag].filter(t => t !== 'Inbox' || tag === 'Inbox');
                return { ...p, databaseTags: Array.from(new Set(newTags)), unsavedChanges: true };
            })
          };
        });
      },

      removeProjectFromDatabase: (projectId: string, tag: string) => {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, databaseTags: p.databaseTags.filter(t => t !== tag), unsavedChanges: true }
              : p
          )
        }));
      },

      createDatabase: (name: string) => {
          set(state => ({
              availableTags: state.availableTags.includes(name) ? state.availableTags : [...state.availableTags, name]
          }));
      },

      renameDatabase: (oldName: string, newName: string) => {
          set(state => {
              const newTags = state.availableTags.map(t => t === oldName ? newName : t);
              const newProjects = state.projects.map(p => ({
                  ...p,
                  databaseTags: p.databaseTags.map(t => t === oldName ? newName : t)
              }));
              return { availableTags: newTags, projects: newProjects };
          });
      },

      deleteDatabase: (name: string) => {
          set(state => {
              const newTags = state.availableTags.filter(t => t !== name);
              const newProjects = state.projects.map(p => ({
                  ...p,
                  databaseTags: p.databaseTags.filter(t => t !== name)
              }));
              return { availableTags: newTags, projects: newProjects };
          });
      },

      shareProject: (projectId: string, friendIds: string[]) => {
          const project = get().projects.find(p => p.id === projectId);
          if (!project) return;

          friendIds.forEach(friendId => {
              const newMessage: DirectMessage = {
                  id: `dm-share-${Date.now()}-${Math.random()}`,
                  senderId: 'me',
                  receiverId: friendId,
                  text: `Shared a project: ${project.title}`,
                  timestamp: Date.now(),
                  attachment: {
                      type: 'project',
                      id: project.id,
                      title: project.title,
                      meta: project.type
                  }
              };
              set(state => ({ directMessages: [...state.directMessages, newMessage] }));
          });
          set({ currentView: 'friends' });
      },

      shareDatabase: (tagName: string, friendIds: string[]) => {
          const { projects } = get();
          const count = projects.filter(p => p.databaseTags.includes(tagName)).length;
          
          friendIds.forEach(friendId => {
              const newMessage: DirectMessage = {
                  id: `dm-share-db-${Date.now()}-${Math.random()}`,
                  senderId: 'me',
                  receiverId: friendId,
                  text: `Shared a database: ${tagName}`,
                  timestamp: Date.now(),
                  attachment: {
                      type: 'database',
                      id: tagName,
                      title: tagName,
                      meta: `${count} items`
                  }
              };
              set(state => ({ directMessages: [...state.directMessages, newMessage] }));
          });
          set({ currentView: 'friends' });
      },

      sendDirectMessage: (receiverId: string, text: string, isGroup?: boolean) => {
          const newMessage: DirectMessage = {
              id: `dm-${Date.now()}`,
              senderId: 'me',
              receiverId: receiverId,
              text,
              timestamp: Date.now(),
              isGroup
          };
          set(state => ({
              directMessages: [...state.directMessages, newMessage]
          }));
      },

      exportChatToProject: (chatId: string, messageIds: string[], isGroup?: boolean) => {
          const { friends, groups, directMessages } = get();
          const entityName = isGroup 
            ? groups.find(g => g.id === chatId)?.name 
            : friends.find(f => f.id === chatId)?.name;

          const msgsToExport = directMessages
            .filter(m => messageIds.includes(m.id))
            .sort((a, b) => a.timestamp - b.timestamp);
          
          if (msgsToExport.length === 0) return;

          const title = `Chat with ${entityName} (${new Date().toLocaleDateString()})`;
          const content = `# ${title}\n\n` + msgsToExport.map(m => {
              let senderName = 'Me';
              if (m.senderId !== 'me') {
                  const friend = friends.find(f => f.id === m.senderId);
                  senderName = friend ? friend.name : 'Unknown';
              }
              const time = new Date(m.timestamp).toLocaleTimeString();
              return `**${senderName}** [${time}]: ${m.text}`;
          }).join('\n\n');

          get().createProject(title, 'note');
          
          const newProjectId = get().projects[0].id;
          
          set(state => ({
              activeProjectContent: content,
              projects: state.projects.map(p => p.id === newProjectId ? { ...p, content, databaseTags: ['Work', 'Chat Log'], unsavedChanges: true } : p)
          }));
      },

      downloadChatAsTxt: (chatId: string, messageIds: string[], isGroup?: boolean) => {
          const { friends, groups, directMessages } = get();
          const entityName = isGroup 
            ? groups.find(g => g.id === chatId)?.name 
            : friends.find(f => f.id === chatId)?.name;

          const msgsToExport = directMessages
            .filter(m => messageIds.includes(m.id))
            .sort((a, b) => a.timestamp - b.timestamp);
          
          if (msgsToExport.length === 0) return;
          
          const textContent = `Chat Export: ${entityName} (${new Date().toLocaleDateString()})\n\n` + 
              msgsToExport.map(m => {
                  let senderName = 'Me';
                  if (m.senderId !== 'me') {
                      const friend = friends.find(f => f.id === m.senderId);
                      senderName = friend ? friend.name : 'Unknown';
                  }
                  const time = new Date(m.timestamp).toLocaleTimeString();
                  return `[${time}] ${senderName}: ${m.text}`;
              }).join('\n');

          const blob = new Blob([textContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chat_export_${entityName?.replace(/\s+/g, '_')}_${Date.now()}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      },

      saveNodeToLibrary: (nodeId: string) => {
        const node = get().nodes.find(n => n.id === nodeId);
        if (!node) return;

        const newId = `snip-${Date.now()}`;
        const newSnippet: Project = {
            id: newId,
            type: 'note',
            title: node.data.label || 'Saved Snippet',
            content: `**Source**: Mind Map Node (${node.data.source || 'Unknown'})\n**Summary**: ${node.data.summary || 'N/A'}\n\n${node.data.url ? `Link: ${node.data.url}` : ''}`,
            updatedAt: 'Just now',
            databaseTags: ['Inbox', ...(node.data.aiTags || []), ...(node.data.source ? [node.data.source] : [])],
            nodes: [], edges: [], chatHistory: [],
            unsavedChanges: false,
            viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
        };

        set(state => ({
          projects: [newSnippet, ...state.projects],
          availableTags: Array.from(new Set([...state.availableTags, ...newSnippet.databaseTags]))
        }));

        get().updateNodeData(nodeId, { savedToLibrary: true });
      },

      updateNodeData: (id: string, data: any) => {
        set((state) => ({
          nodes: state.nodes.map((n) => {
            if (n.id === id) {
              return { ...n, data: { ...n.data, ...data } };
            }
            return n;
          }),
        }));
        const { activeProjectId } = get();
        if (activeProjectId) get().markProjectAsDirty(activeProjectId);
      },

      analyzeLinkAndCreateNode: async (input: string) => {},
      
      syncGraph: async (projectId: string) => {
          const { projects, nodes, edges } = get();
          const project = projects.find(p => p.id === projectId);
          if (!project || project.type !== 'graph') return;
          
          set({ isSyncing: true });

          try {
              // 1. Context Assembly
              const selectedTags = project.databaseTags;
              // Gather content from all other projects that share these tags
              const relevantProjects = projects.filter(p => 
                  p.id !== projectId && // Exclude self
                  p.databaseTags.some(t => selectedTags.includes(t))
              );
              
              if (relevantProjects.length === 0) {
                  set({ isSyncing: false });
                  alert("No database content found to sync with. Please ensure you have data in the connected databases.");
                  return;
              }

              const databaseContent = relevantProjects.map(p => 
                `[Source: ${p.databaseTags.join(', ')}] Item: ${p.title} - ${p.content || p.summary || 'No content'}`
              ).join('\n');

              const currentGraphStructure = nodes.map(n => ({
                  id: n.id,
                  label: n.data.label,
                  summary: n.data.summary,
                  type: n.data.nodeType
              }));

              // 2. AI Call - Lazy Init
              const ai = getAIClient();
              const prompt = `
                You are a "Conservative Knowledge Graph Synchronization Engine".
                
                # Goal
                Synchronize the "Current Graph" with the "Latest Database Content" by identifying necessary **Additions** and **Removals**.
                
                # STRICT RULES (Do Not Violate)
                1. **Preservation**: You MUST NOT change the structure, position, or color of EXISTING nodes.
                2. **No Redesign**: Do not re-organize the graph. Only add missing pieces or remove dead ones.
                3. **Locality**: New nodes must be attached to relevant EXISTING nodes (parents). Do not create floating clusters.
                
                # Input
                - Current Graph Nodes: ${JSON.stringify(currentGraphStructure)}
                - Latest Database Content: ${databaseContent}
                
                # Logic
                1. **Additions**: If a concept in Database is NOT in Graph:
                   - Suggest adding it.
                   - Find the best matching 'suggestedParentId' from Current Graph Nodes.
                2. **Removals**: If a node in Graph explicitly contradicts or is absent from Database (and is not a structural/root node):
                   - Suggest removing it.
                
                # Output JSON
                {
                    "removeNodeIds": ["id...", ...],
                    "addNodes": [
                        { "label": "...", "summary": "...", "type": "petal", "suggestedParentId": "existing_id..." }
                    ]
                }
              `;
              
              const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                  config: { responseMimeType: "application/json" }
              });
              
              const result = JSON.parse(cleanJsonOutput(response.text));
              
              // 3. Apply Changes (Conservative Mode)
              let newNodes = [...nodes];
              let newEdges = [...edges];
              const rootNode = newNodes.find(n => n.data.nodeType === 'root') || newNodes[0];

              // Removal: Only if AI is certain
              if (result.removeNodeIds && Array.isArray(result.removeNodeIds) && result.removeNodeIds.length > 0) {
                  const toRemove = new Set(result.removeNodeIds);
                  // Protect Root
                  if(rootNode) toRemove.delete(rootNode.id);
                  
                  newNodes = newNodes.filter(n => !toRemove.has(n.id));
                  newEdges = newEdges.filter(e => !toRemove.has(e.source) && !toRemove.has(e.target));
              }

              // Addition: Place near parent, strictly additive
              if (result.addNodes && Array.isArray(result.addNodes) && result.addNodes.length > 0) {
                  result.addNodes.forEach((n: any, i: number) => {
                      const newId = `sync-node-${Date.now()}-${i}`;
                      
                      // Find parent to anchor to
                      let parent = newNodes.find(existing => existing.id === n.suggestedParentId);
                      if (!parent) parent = rootNode;
                      
                      // Position logic: Localized jitter. Do not disrupt global layout.
                      // Place it somewhat near the parent.
                      const angle = Math.random() * Math.PI * 2;
                      const dist = 150 + Math.random() * 50; // Closer than before to avoid sprawl
                      const pos = {
                          x: parent.position.x + Math.cos(angle) * dist,
                          y: parent.position.y + Math.sin(angle) * dist
                      };
                      
                      // Inherit color logic if not specified, or use default leaf color
                      const color = n.type === 'category' ? STRICT_PALETTE[1] : STRICT_PALETTE[2];

                      newNodes.push({
                          id: newId,
                          type: 'mindMapNode',
                          position: pos,
                          data: {
                              label: n.label,
                              summary: n.summary,
                              importance: 1,
                              nodeType: n.type || 'petal',
                              color: color,
                              source: 'Sync',
                              aiTags: ['Synced']
                          }
                      });

                      newEdges.push({
                          id: `sync-edge-${parent.id}-${newId}`,
                          source: parent.id,
                          target: newId,
                          type: 'straight',
                          style: DEFAULT_EDGE_STYLE
                      });
                  });
              }

              set({ nodes: newNodes, edges: newEdges, isSyncing: false });
              get().markProjectAsDirty(projectId);

          } catch (e) {
              console.error("Sync error", e);
              set({ isSyncing: false });
          }
      },

      triggerAIAnalysis: async (parentNodeId: string) => {
          const { nodes, edges, activeProjectId } = get();
          const parentNode = nodes.find((n) => n.id === parentNodeId);
          if (!parentNode) return;
      
          set((state) => ({
            nodes: state.nodes.map((n) =>
              n.id === parentNodeId ? { ...n, data: { ...n.data, isGenerating: true } } : n
            ),
          }));
      
          try {
              const ai = getAIClient();
              const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: `Based on "${parentNode.data.label}" (Summary: ${parentNode.data.summary || ''}), generate 3-4 diverse and creative "Petal" associations (related concepts). Return JSON: { "concepts": [{ "label": string, "summary": string }] }`,
                  config: { responseMimeType: "application/json" }
              });
              
              const cleanedText = cleanJsonOutput(response.text);
              const result = JSON.parse(cleanedText);
              const newNodes: MindMapNode[] = [];
              const newEdges: any[] = [];
              
              const count = result.concepts.length;
              const radius = 300; 
              
              const dx = parentNode.position.x;
              const dy = parentNode.position.y;
              const centerAngle = Math.atan2(dy, dx);
              
              const distToCenter = Math.sqrt(dx*dx + dy*dy);
              const isRoot = distToCenter < 50;
              const spread = isRoot ? Math.PI * 2 : Math.PI / 1.5; 
              const startAngle = isRoot ? 0 : centerAngle - spread / 2;

              result.concepts.forEach((concept: any, index: number) => {
                   const newId = `node-${Date.now()}-${index}`;
                   const angle = startAngle + (spread / (count + (isRoot ? 0 : 1))) * (index + (isRoot ? 0 : 1));
                   
                   const jitterX = (Math.random() - 0.5) * 20; // Reduced jitter for tidiness
                   const jitterY = (Math.random() - 0.5) * 20;
                   // Cycle through palette for new nodes
                   const color = STRICT_PALETTE[(index + 1) % STRICT_PALETTE.length];
      
                   newNodes.push({
                       id: newId,
                       type: 'mindMapNode',
                       position: {
                           x: parentNode.position.x + Math.cos(angle) * radius + jitterX,
                           y: parentNode.position.y + Math.sin(angle) * radius + jitterY
                       },
                       data: {
                           label: concept.label,
                           summary: concept.summary,
                           aiTags: ['AI-Gen'],
                           importance: 1,
                           nodeType: 'petal',
                           source: parentNode.data.source || 'AI-Gen',
                           color: color
                       }
                   });
      
                   newEdges.push({
                      id: `edge-${parentNodeId}-${newId}`,
                      source: parentNodeId,
                      target: newId,
                      type: 'straight',
                      style: DEFAULT_EDGE_STYLE,
                   });
              });
      
              set((state) => ({
                  nodes: state.nodes.map((n) =>
                    n.id === parentNodeId ? { ...n, data: { ...n.data, isGenerating: false } } : n
                  ).concat(newNodes),
                  edges: [...state.edges, ...newEdges]
              }));
              
              if (activeProjectId) get().markProjectAsDirty(activeProjectId);
      
          } catch (e) {
              console.error("AI Analysis Failed", e);
              set((state) => ({
                  nodes: state.nodes.map((n) => n.id === parentNodeId ? { ...n, data: { ...n.data, isGenerating: false } } : n)
              }));
          }
      },

      generateGraphFromDatabases: async (selectedTags: string[]) => {
          const { projects } = get();
          
          const relevantProjects = projects.filter(p => p.databaseTags.some(t => selectedTags.includes(t)));
          
          const contextData = relevantProjects.map(p => 
            `Source: ${p.databaseTags.find(t => selectedTags.includes(t)) || 'General'}\nProject: ${p.title} (${p.type})\nContent/Summary: ${p.content || p.summary || p.nodes.map(n => n.data.label).join(', ')}`
          ).join('\n---\n');

          if (!contextData) {
              alert('No content found for selected databases.');
              return;
          }

          try {
            const ai = getAIClient();
            const prompt = `
            You are a generic knowledge graph generator.
            Context from databases [${selectedTags.join(', ')}]:
            ${contextData}

            ### Task: Generate a "Neural Mind Map"
            Create a relation graph structure that simultaneously embodies these three models:

            1. **Petal Model (Primary)**
               - Identify 1 Central Topic (Root).
               - Allow for non-linear, divergent associations radiating from the center.
               - Connections can be associative, not just hierarchical.

            2. **Pyramid Model (Secondary)**
               - Identify 4-6 Key Categories (Level 1) that provide structure.
               - For each Category, generate 3-5 "Leaf/Petal" nodes (Level 2).
               - This satisfies the need for order and classification.

            3. **Matrix Model (Spot)**
               - **CRITICAL**: Identify 2-4 "cross-links" (ADHD-style associations) between nodes that are NOT in the same branch.
               - These connections represent lateral thinking or unexpected relationships.
               - Return these as specific edges in the 'edges' array.

            ### Visual Rules
            - **Straight Lines Only**: All edges must be conceptualized as straight lines.
            - **Strict Color Palette**: 
               - Root: Fixed Color 1
               - Categories: Fixed Color 2
               - Leaves: Fixed Color 3
               - **DO NOT** use more colors unless absolutely necessary for a distinct disconnected cluster.

            ### Output Format
            Return ONLY valid raw JSON with:
            {
              "title": "Suggested Graph Title",
              "nodes": [ 
                 { "id": "root", "label": "Main Topic", "type": "root", "summary": "...", "source": "Derived" },
                 { "id": "c1", "label": "Category", "type": "category", "summary": "...", "source": "DatabaseName" },
                 { "id": "l1", "label": "Leaf", "type": "petal", "parentId": "c1", "summary": "...", "source": "DatabaseName" } 
              ],
              "edges": [ 
                 { "source": "root", "target": "c1" },
                 { "source": "c1", "target": "l1" },
                 { "source": "l1", "target": "l5", "label": "Cross-link" } // Example matrix link
              ]
            }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });

            const cleanedText = cleanJsonOutput(response.text);
            const result = JSON.parse(cleanedText);
            
            // --- Neural Layout Logic (Optimization: Starburst/Radial) ---
            const rootNode = result.nodes.find((n: any) => n.type === 'root') || result.nodes[0];
            const nodesWithPos: MindMapNode[] = [];
            const sources = new Set<string>();
            
            // Root: Center (Color 0 - Indigo)
            nodesWithPos.push({
                id: rootNode.id,
                type: 'mindMapNode',
                position: { x: 0, y: 0 },
                data: { label: rootNode.label, summary: rootNode.summary, importance: 3, nodeType: 'root', source: rootNode.source || 'Root', color: STRICT_PALETTE[0] }
            });
            if (rootNode.source) sources.add(rootNode.source);

            const categories = result.nodes.filter((n: any) => n.type === 'category');
            const catRadius = 450; // Increased radius for better separation
            
            categories.forEach((cat: any, i: number) => {
                const angle = (i / categories.length) * 2 * Math.PI;
                // Categories always Color 1 (Emerald)
                const color = STRICT_PALETTE[1];
                if (cat.source) sources.add(cat.source);
                
                nodesWithPos.push({
                    id: cat.id,
                    type: 'mindMapNode',
                    position: {
                        x: Math.cos(angle) * catRadius,
                        y: Math.sin(angle) * catRadius
                    },
                    data: { label: cat.label, summary: cat.summary, importance: 2, nodeType: 'category', source: cat.source || 'General', color: color }
                });
            });

            const leaves = result.nodes.filter((n: any) => n.type === 'petal' || n.type === 'leaf' || (!n.type && n.id !== rootNode.id));
            
            // Group leaves by parent for optimized fan layout
            const leavesByParent: Record<string, any[]> = {};
            leaves.forEach((leaf: any) => {
                const pid = leaf.parentId;
                if (!leavesByParent[pid]) leavesByParent[pid] = [];
                leavesByParent[pid].push(leaf);
            });

            Object.keys(leavesByParent).forEach(parentId => {
                const group = leavesByParent[parentId];
                const parentNode = nodesWithPos.find(n => n.id === parentId);
                
                // Leaves always Color 2 (Amber)
                const color = STRICT_PALETTE[2];

                if (parentNode) {
                    const count = group.length;
                    // Vector from center to parent to determine outward direction
                    const px = parentNode.position.x;
                    const py = parentNode.position.y;
                    const parentAngle = Math.atan2(py, px);
                    
                    // Cone spread based on count, max ~120 degrees to avoid overlap with neighbors
                    const maxSpread = Math.PI * 0.5; // 90 degrees
                    const step = count > 1 ? maxSpread / (count - 1) : 0;
                    const startAngle = parentAngle - (count > 1 ? maxSpread / 2 : 0);

                    group.forEach((leaf: any, i: number) => {
                        const angle = count === 1 ? parentAngle : startAngle + (i * step);
                        // Fixed base radius + slight alternation to prevent perfect arc artifact
                        const dist = 300 + (i % 2) * 60; 
                        
                        if (leaf.source) sources.add(leaf.source);

                        nodesWithPos.push({
                            id: leaf.id,
                            type: 'mindMapNode',
                            position: {
                                x: px + Math.cos(angle) * dist,
                                y: py + Math.sin(angle) * dist
                            },
                            data: { label: leaf.label, summary: leaf.summary, importance: 1, nodeType: 'petal', source: leaf.source || 'Detail', color: color }
                        });
                    });
                } else {
                    // Orphan/Matrix Nodes - Place randomly in outer orbit
                    group.forEach((leaf: any) => {
                        const orbit = 900;
                        const angle = Math.random() * Math.PI * 2;
                        if (leaf.source) sources.add(leaf.source);
                        nodesWithPos.push({
                            id: leaf.id,
                            type: 'mindMapNode',
                            position: { x: Math.cos(angle) * orbit, y: Math.sin(angle) * orbit },
                            data: { label: leaf.label, summary: leaf.summary, importance: 1, nodeType: 'petal', source: leaf.source, color: color }
                        });
                    });
                }
            });

            const validNodeIds = new Set(nodesWithPos.map(n => n.id));

            const edges = result.edges
                .filter((e: any) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
                .map((e: any, i: number) => ({
                     id: `edge-gen-${i}`,
                     source: e.source,
                     target: e.target,
                     type: 'straight', // STRICT STRAIGHT LINES
                     style: DEFAULT_EDGE_STYLE,
                     label: e.label || ''
                }));

            const newId = `gen-proj-${Date.now()}`;
            
            // --- Graph Independence ---
            // Created in "Graphs" database by default, plus references source tags
            const newDatabaseTags = ['Graphs', ...selectedTags]; 

            const newProject: Project = {
                id: newId,
                type: 'graph',
                title: result.title || `Neural Graph: ${selectedTags.join('+')}`,
                updatedAt: 'Just now',
                databaseTags: Array.from(new Set(newDatabaseTags)),
                nodes: nodesWithPos,
                edges: edges,
                chatHistory: [],
                content: '',
                unsavedChanges: true,
                viewState: { x: 0, y: 0, zoom: 1, isMiniMapOpen: true }
            };

            set(state => {
                const updatedAvailableTags = state.availableTags.includes('Graphs') 
                    ? state.availableTags 
                    : [...state.availableTags, 'Graphs'];

                return {
                    projects: [newProject, ...state.projects],
                    activeProjectId: newId,
                    nodes: nodesWithPos,
                    edges: edges,
                    activeProjectContent: '',
                    chatMessages: [],
                    availableTags: updatedAvailableTags,
                    currentView: 'editor',
                    activeGraphFilters: Array.from(sources)
                };
            });

          } catch (e) {
              console.error("Graph generation failed", e);
              alert("Failed to generate graph. Please try again.");
          }
      },
      
      updateGraphLayout: (edgeType: 'straight' | 'default') => {
          set(state => ({
              edges: state.edges.map(e => ({ ...e, type: edgeType })),
          }));
          const { activeProjectId } = get();
          if (activeProjectId) get().markProjectAsDirty(activeProjectId);
      },

      sendAgentMessage: async (text: string) => {
          const { activeProjectId, projects, nodes, activeProjectContent, addNode, updateGraphLayout, syncGraph } = get();
          const project = projects.find(p => p.id === activeProjectId);
          if (!project) return;

          const newUserMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', text, timestamp: Date.now() };
          
          set(state => ({
              chatMessages: [...state.chatMessages, newUserMsg],
              projects: state.projects.map(p => p.id === activeProjectId ? { ...p, chatHistory: [...(p.chatHistory || []), newUserMsg] } : p)
          }));

          try {
              let context = "";
              const toolsList = [];
              
              if (project.type === 'graph') {
                  const nodeLabels = nodes.map(n => `- ${n.data.label} (ID: ${n.id})`).join('\n');
                  context = `Current Graph Nodes:\n${nodeLabels}\n\nTask: Use tools to modify the graph based on user request.`;
                  toolsList.push(addNodeTool, connectNodesTool, changeLayoutTool, syncGraphTool);
              } else {
                  context = "Simple chat mode.";
              }

              const ai = getAIClient();
              const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: `Context:\n${context}\n\nUser: ${text}`,
                  config: { 
                      tools: [{ functionDeclarations: toolsList }],
                  }
              });

              // Handle Function Calls
              const functionCalls = response.functionCalls;
              let replyText = response.text || "";

              if (functionCalls && functionCalls.length > 0) {
                  for (const fc of functionCalls) {
                      const args = fc.args;
                      if (fc.name === 'addNode') {
                          addNode(undefined, args.parentId as string, args.label as string, args.color as string);
                          replyText += `Added node "${args.label}". `;
                      } else if (fc.name === 'changeLayout') {
                          updateGraphLayout(args.edgeType as 'straight' | 'default');
                          replyText += `Changed layout to ${args.edgeType}. `;
                      } else if (fc.name === 'syncGraph') {
                          await syncGraph(activeProjectId!);
                          replyText += "Graph has been synchronized with the database content. ";
                      } else if (fc.name === 'connectNodes') {
                          get().connectNodes(args.targetId as string);
                          const { edges } = get();
                          const newEdge: Edge = {
                              id: `e-${args.sourceId}-${args.targetId}-${Date.now()}`,
                              source: args.sourceId as string,
                              target: args.targetId as string,
                              type: 'straight',
                              style: DEFAULT_EDGE_STYLE,
                          };
                          set({ edges: [...edges, newEdge] });
                          replyText += `Connected nodes. `;
                      }
                  }
              }

              if(!replyText) replyText = "Action completed.";

              const newModelMsg: ChatMessage = {
                  id: `msg-ai-${Date.now()}`,
                  role: 'model',
                  text: replyText,
                  timestamp: Date.now()
              };

              set(state => ({
                  chatMessages: [...state.chatMessages, newModelMsg],
                  projects: state.projects.map(p => p.id === activeProjectId ? { ...p, chatHistory: [...(p.chatHistory || []), newModelMsg] } : p)
              }));

          } catch (e) {
              console.error(e);
              const errorMsg: ChatMessage = { id: `err-${Date.now()}`, role: 'model', text: "I couldn't perform that action.", timestamp: Date.now() };
              set(state => ({ chatMessages: [...state.chatMessages, errorMsg] }));
          }
      }
    }),
    {
      name: 'linkverse-storage', // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data to avoid lag
      partialize: (state) => ({
        projects: state.projects,
        availableTags: state.availableTags,
        theme: state.theme,
        // Don't persist currentView or active IDs to force a clean dashboard start
      }),
    }
  )
);
