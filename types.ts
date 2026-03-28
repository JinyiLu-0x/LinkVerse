import type { Node, Edge } from 'reactflow';

export type ViewType = 'dashboard' | 'editor' | 'boards' | 'library' | 'friends' | 'team' | 'profile' | 'settings';

export type ProjectType = 'graph' | 'note' | 'resource';

export type Theme = 'light' | 'dark';

export type ViewState = {
  x: number;
  y: number;
  zoom: number;
  isMiniMapOpen: boolean;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
};

export type CopilotThread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

export type Friend = {
  id: string;
  name: string;
  avatar: string; // initials
  status: 'online' | 'offline';
};

export type Group = {
  id: string;
  name: string;
  avatar: string; // emoji or initial
  members: string[]; // friendIds
};

export type SharedAttachment = {
  type: 'project' | 'database';
  id: string; // Project ID or Tag Name
  title: string;
  meta?: string; // e.g., "5 items" or "Graph"
};

export type DirectMessage = {
  id: string;
  senderId: string; // 'me' or friendId
  receiverId: string; // friendId or groupId
  text: string;
  timestamp: number;
  isGroup?: boolean;
  attachment?: SharedAttachment;
};

/**
 * Project (Polymorphic)
 * Can be a Mind Map, a Text Note, or a Web Resource
 */
export type Project = {
  id: string;
  type: ProjectType;
  title: string;
  updatedAt: string;
  databaseTags: string[];
  
  // Save State
  unsavedChanges?: boolean;

  // View Persistence
  viewState: ViewState;

  // Graph Data
  nodes: MindMapNode[];
  edges: Edge[];
  
  // Note Data
  content?: string; // Markdown/Text content
  
  // Resource Data
  url?: string;
  summary?: string;
  
  // Contextual Chat History
  chatHistory: ChatMessage[];
  copilotThreads: CopilotThread[];
  activeCopilotThreadId: string | null;
};

export type AIAssistantData = {
  label: string;           
  summary?: string;        
  url?: string;            
  aiTags?: string[];       
  importance?: number;     
  isGenerating?: boolean;  
  savedToLibrary?: boolean;
  nodeType?: 'root' | 'category' | 'petal' | 'leaf';
  source?: string; // The database tag this node originated from
  color?: string;
};

export type MindMapNode = Node<AIAssistantData>;

export interface MindMapState {
  // --- UI State ---
  theme: Theme;
  toggleTheme: () => void;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  activeProjectId: string | null;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  editingNodeId: string | null; // For Node Edit Modal
  isSyncing: boolean; // New: Global sync state
  
  connectingNodeId: string | null;

  // --- Data State ---
  projects: Project[];
  availableTags: string[];
  friends: Friend[];
  groups: Group[];
  directMessages: DirectMessage[];

  // Current Working Data
  nodes: MindMapNode[];
  edges: Edge[];
  activeProjectContent: string; // For Notes
  chatMessages: ChatMessage[];  // Current active chat
  copilotThreads: CopilotThread[];
  activeCopilotThreadId: string | null;
  
  // --- Graph Visibility State ---
  activeGraphFilters: string[]; // List of visible database sources
  toggleGraphFilter: (tag: string) => void;
  setGraphFilters: (tags: string[]) => void;

  // --- Actions ---
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  
  createProject: (title: string, type: ProjectType, url?: string) => Promise<void>;
  deleteProject: (projectId: string) => void;
  updateProjectTitle: (projectId: string, newTitle: string) => void;
  updateProjectUrl: (projectId: string, newUrl: string) => void;
  updateProjectViewState: (projectId: string, viewState: Partial<ViewState>) => void; // New
  openProject: (projectId: string) => void;
  saveProject: () => void; 
  markProjectAsDirty: (projectId: string) => void;

  updateNoteContent: (content: string) => void; 
  
  addProjectToDatabase: (projectId: string, tag: string) => void;
  removeProjectFromDatabase: (projectId: string, tag: string) => void;
  
  // Database CRUD
  createDatabase: (name: string) => void;
  renameDatabase: (oldName: string, newName: string) => void;
  deleteDatabase: (name: string) => void;

  shareProject: (projectId: string, friendIds: string[]) => void;
  shareDatabase: (tagName: string, friendIds: string[]) => void;
  
  // Friends & DM
  sendDirectMessage: (receiverId: string, text: string, isGroup?: boolean) => void;
  exportChatToProject: (chatId: string, messageIds: string[], isGroup?: boolean) => void;
  downloadChatAsTxt: (chatId: string, messageIds: string[], isGroup?: boolean) => void;

  saveNodeToLibrary: (nodeId: string) => void;
  updateNodeData: (id: string, data: any) => void;
  addNode: (position?: { x: number, y: number }, parentId?: string, label?: string, color?: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void; // New
  onNodesDelete: (nodes: Node[]) => void; // New
  onEdgesDelete: (edges: Edge[]) => void; // New
  setEditingNode: (nodeId: string | null) => void;
  
  setConnectingNode: (nodeId: string | null) => void;
  connectNodes: (targetNodeId: string) => void;

  // --- AI ---
  analyzeLinkAndCreateNode: (input: string) => Promise<void>;
  triggerAIAnalysis: (parentNodeId: string) => Promise<void>;
  generateGraphFromDatabases: (selectedTags: string[]) => Promise<void>;
  sendAgentMessage: (text: string) => Promise<void>;
  syncGraph: (projectId: string) => Promise<void>; // Updated: Global sync
  createCopilotThread: () => void;
  openCopilotThread: (threadId: string) => void;
  deleteCopilotThread: (threadId: string) => void;
  
  updateGraphLayout: (edgeType: 'straight' | 'default') => void;
}
