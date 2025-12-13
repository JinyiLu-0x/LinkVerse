import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useStore } from '../store/useStore';
import { AIAssistantData } from '../types';

// Icons
const IconEdit = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconMagic = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;
const IconTrash = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;

// User selectable colors (Max 5)
const USER_COLORS = [
  '#6366f1', // Indigo (Default Root)
  '#10b981', // Emerald (Default Category)
  '#f59e0b', // Amber (Default Leaf)
  '#ef4444', // Red
  '#3b82f6', // Blue
];

const MindNode = ({ id, data, selected }: NodeProps<AIAssistantData>) => {
  const triggerAIAnalysis = useStore((state) => state.triggerAIAnalysis);
  const setEditingNode = useStore((state) => state.setEditingNode);
  const deleteNode = useStore((state) => state.deleteNode);
  const updateNodeData = useStore((state) => state.updateNodeData);
  const activeGraphFilters = useStore((state) => state.activeGraphFilters);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerAIAnalysis(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode(id);
  };
  
  const handleDeleteNode = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Immediate deletion - No confirmation dialog
      deleteNode(id);
  };
  
  const handleSetType = (type: 'root' | 'category' | 'petal') => {
      updateNodeData(id, { nodeType: type });
  };

  const handleColorSelect = (color: string) => {
      updateNodeData(id, { color });
  };

  // Visibility Check
  const isVisible = !data.source || activeGraphFilters.includes(data.source);
  const visibilityClass = isVisible ? '' : 'grayscale opacity-30 pointer-events-none';

  // Styles
  const isRoot = data.nodeType === 'root';
  const isCategory = data.nodeType === 'category';

  // Determine Background Color: data.color takes precedence, else fallback to defaults
  const bgColor = data.color || (isRoot ? '#6366f1' : isCategory ? '#10b981' : '#f59e0b');

  let sizeClass = 'w-4 h-4';
  let glowColor = 'bg-blue-500/0'; 

  if (isRoot) {
      sizeClass = 'w-10 h-10 shadow-xl';
      glowColor = 'bg-blue-500/10'; 
  } else if (isCategory) {
      sizeClass = 'w-6 h-6';
      glowColor = 'bg-indigo-500/5';
  } else {
      sizeClass = 'w-3.5 h-3.5';
      glowColor = 'bg-green-400/0';
  }

  let effectClass = '';
  if (selected) {
      effectClass = 'ring-2 ring-white dark:ring-zinc-900 ring-offset-2 ring-offset-blue-100 dark:ring-offset-blue-900';
      glowColor = 'bg-blue-500/20';
  } else if (data.isGenerating) {
      effectClass = 'animate-pulse';
      glowColor = 'bg-amber-500/20 animate-ping';
  }
  
  if (data.savedToLibrary) {
      effectClass += ' ring-2 ring-green-400 ring-offset-1 dark:ring-offset-black';
  }

  const labelStyle = isRoot 
    ? 'font-bold text-base mt-3' 
    : isCategory 
        ? 'font-semibold text-xs mt-2' 
        : 'font-medium text-[10px] text-slate-500 dark:text-slate-400 mt-2';

  const showLabel = isRoot || isCategory || selected;
  const labelOpacity = showLabel ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0';

  // STRICT CENTER HANDLES
  const handleStyle: React.CSSProperties = {
      width: 1, 
      height: 1,
      minWidth: 0, 
      minHeight: 0,
      background: 'transparent',
      border: 'none',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: -1, // Keep behind content
  };

  return (
    <div className={`relative group flex flex-col items-center justify-center pointer-events-auto transition-all duration-300 ${visibilityClass}`}>
      
      {/* Handles positioned strictly at center */}
      <Handle type="source" position={Position.Top} style={handleStyle} isConnectable={true} />
      <Handle type="target" position={Position.Top} style={handleStyle} isConnectable={true} />

      {/* Glow Effect */}
      <div className={`absolute rounded-full transition-all duration-500 ease-out blur-xl -z-10 ${selected ? 'w-20 h-20' : 'w-16 h-16 opacity-0'} ${glowColor}`} />

      {/* Core Node Body */}
      <div 
        className={`transition-all duration-300 rounded-full flex items-center justify-center ${sizeClass} ${effectClass} shadow-sm z-10 cursor-move`}
        style={{ backgroundColor: bgColor }}
      >
        {isRoot && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />}
      </div>

      {/* Label */}
      <div className={`
        absolute top-full text-center whitespace-nowrap pointer-events-none transition-all duration-300 px-2 py-0.5 rounded
        bg-white/60 dark:bg-black/40 backdrop-blur-[1px] z-20
        ${labelStyle}
        ${labelOpacity}
        text-slate-800 dark:text-slate-200
      `}>
        {data.label}
      </div>

      {/* Interactive Popover Menu */}
      {isVisible && (
        <div className={`
          absolute top-10 z-50 min-w-[200px] p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-100 dark:border-zinc-800
          transition-all duration-200 origin-top flex flex-col gap-2 text-left
          ${selected ? 'opacity-100 scale-100 translate-y-2' : 'opacity-0 scale-95 pointer-events-none translate-y-0'}
        `}>
          <div className="flex justify-between items-start p-1">
              <div className="flex-1 min-w-0 mr-2">
                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs truncate" title={data.label}>{data.label}</h4>
              </div>
              <div className="flex gap-1">
                  <button onClick={handleEdit} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-blue-500 transition-colors"><IconEdit /></button>
                  <button onClick={handleDeleteNode} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-zinc-400 hover:text-red-500 transition-colors"><IconTrash /></button>
              </div>
          </div>

          {/* Color Picker */}
          <div className="flex gap-1.5 justify-center px-1 py-1.5 border-t border-zinc-50 dark:border-zinc-800">
             {USER_COLORS.map(c => (
                 <button
                    key={c}
                    onClick={(e) => { e.stopPropagation(); handleColorSelect(c); }}
                    className={`w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-700 transition-transform hover:scale-110 ${data.color === c ? 'ring-2 ring-zinc-400 ring-offset-1 dark:ring-offset-zinc-800 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                    title={c}
                 />
             ))}
          </div>

          {/* Level Selector */}
          <div className="flex gap-2 items-center px-1 py-1.5 border-t border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-lg">
              <div className="flex gap-2 flex-1 justify-center">
                  <button onClick={(e) => { e.stopPropagation(); handleSetType('root'); }} className={`w-5 h-5 rounded-full border-2 ${isRoot ? 'border-white ring-2 ring-zinc-300' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: data.color || '#6366f1' }} title="Root"></button>
                  <button onClick={(e) => { e.stopPropagation(); handleSetType('category'); }} className={`w-4 h-4 rounded-full border-2 ${isCategory ? 'border-white ring-2 ring-zinc-300' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: data.color || '#10b981' }} title="Category"></button>
                  <button onClick={(e) => { e.stopPropagation(); handleSetType('petal'); }} className={`w-3 h-3 rounded-full border-2 ${!isRoot && !isCategory ? 'border-white ring-2 ring-zinc-300' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: data.color || '#f59e0b' }} title="Leaf"></button>
              </div>
          </div>
          
          <div className="flex gap-1 mt-1 items-center">
              <button 
                onClick={handleExpand}
                disabled={data.isGenerating}
                className="flex-1 text-[10px] bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
              >
                <IconMagic className="w-3 h-3"/>
                {data.isGenerating ? 'Thinking...' : 'AI Expand'}
              </button>
              
              {/* Database Source Tag */}
              {data.source && (
                  <div className="px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[9px] text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap select-none" title="Database Source">
                    {data.source}
                  </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MindNode);