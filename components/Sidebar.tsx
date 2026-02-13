import React from 'react';
import { NavItem, FeaturedTool, ChatMode } from '../types';

const navItems: NavItem[] = [
  { icon: 'chat_bubble', label: 'Chat', id: 'chat', color: 'text-indigo-500' },
  { icon: 'travel_explore', label: 'Research', id: 'research', color: 'text-purple-500', badge: true },
  { icon: 'smart_toy', label: 'Agents', id: 'agents', color: 'text-emerald-500' },
  { icon: 'work', label: 'Projects', id: 'projects', color: 'text-blue-500' },
  { icon: 'local_cafe', label: 'Coffee', id: 'coffee', color: 'text-amber-500' },
];

interface SidebarProps {
  className?: string;
  activeMode?: ChatMode;
  onSelectMode?: (mode: ChatMode) => void;
  onNewChat?: () => void;
}

const tools: FeaturedTool[] = [
  {
    icon: 'table_chart',
    title: 'Data Pilot',
    description: 'Visualize complex datasets',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-indigo-800',
    textColor: 'text-blue-500',
    id: 'data'
  },
  {
    icon: 'palette',
    title: 'Creative Studio',
    description: 'Design and modify visuals',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-pink-700',
    textColor: 'text-purple-500',
    id: 'creative'
  },
  {
    icon: 'terminal',
    title: 'Code Architect',
    description: 'Advanced debugging',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-800',
    textColor: 'text-emerald-500',
    id: 'code'
  },
  {
    icon: 'public',
    title: 'Web Research',
    description: 'Live internet browsing',
    gradientFrom: 'from-cyan-600',
    gradientTo: 'to-blue-600',
    textColor: 'text-cyan-500',
    id: 'web'
  },
  {
    icon: 'description',
    title: 'Doc Analysis',
    description: 'PDF & Docx Summary',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-600',
    textColor: 'text-orange-500',
    id: 'doc'
  },
];

const Sidebar: React.FC<SidebarProps> = ({ className = '', activeMode = 'chat', onSelectMode, onNewChat }) => {
  return (
    <aside className={`w-[260px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#08090f] transition-all duration-500 ${className}`}>
      <div className="p-5">
        {/* Sleek Refined Branding Section - Heliex AI */}
        <div 
          className="branding-area branding-perspective flex items-center gap-3.5 mb-8 px-1 cursor-pointer group select-none relative p-2.5 rounded-2xl transition-all duration-500 hover:bg-white/[0.04] animate-pop-in" 
          onClick={() => onSelectMode?.('chat')}
        >
          {/* Logo Container - Vibrant Purple High Fidelity */}
          <div className="branding-card relative w-11 h-11 flex-shrink-0">
             <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600/0 via-fuchsia-600/0 to-indigo-500/0 group-hover:from-purple-600/40 group-hover:via-fuchsia-600/40 group-hover:to-indigo-500/30 rounded-full blur-2xl transition-all duration-700 animate-nebula-pulse"></div>
             <div className="absolute -inset-1.5 rounded-xl border border-purple-400/5 group-hover:border-purple-400/50 animate-spin-reverse-slow transition-all duration-500"></div>
             <div className="absolute -inset-0.5 rounded-xl border border-fuchsia-400/5 group-hover:border-fuchsia-400/50 animate-spin-slow transition-all duration-500"></div>
             <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-[2px] group-hover:bg-purple-500/25 transition-all duration-500"></div>
             <div className="relative w-full h-full rounded-xl bg-[#0d101d] flex items-center justify-center text-white shadow-2xl border border-white/10 overflow-hidden group-hover:border-purple-500/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800/70 via-indigo-950/50 to-black group-hover:scale-125 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                <span className="material-symbols-outlined text-[24px] relative z-10 text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,1)] transition-all duration-500 group-hover:scale-125 group-hover:text-white">
                    auto_awesome
                </span>
             </div>
          </div>
          
          <div className="flex flex-col justify-center overflow-hidden">
            <h1 className="relative font-display font-black text-[22px] tracking-[-0.03em] leading-none flex items-center transition-all duration-500 group-hover:tracking-tight">
              <span className="text-white group-hover:text-purple-50 transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                Heliex
              </span>
              <span className="text-gradient animate-text-gradient ml-1.5 group-hover:scale-110 transition-all duration-500">
                AI
              </span>
            </h1>
          </div>
        </div>

        <button 
            onClick={() => onNewChat?.()}
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl shadow-lg hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-500 group cursor-pointer relative overflow-hidden animate-slide-up-fade"
            style={{ animationDelay: '0.1s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="material-symbols-outlined text-indigo-400 text-[20px] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">add_circle</span>
          <span className="font-bold text-xs tracking-wide text-indigo-100/90 group-hover:text-white transition-colors">Initiate Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-8 staggered-list">
        <div className="space-y-1.5">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelectMode?.(item.id)}
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              className={`w-full flex items-center gap-3 px-3 py-3 text-xs font-semibold rounded-xl transition-all duration-500 group relative overflow-hidden branding-perspective
                ${activeMode === item.id 
                  ? 'bg-white/10 text-white shadow-super-glow ring-1 ring-white/10 scale-[1.02]' 
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 hover:translate-x-1'
                }`}
            >
              {activeMode === item.id && (
                <div className="absolute inset-0 bg-indigo-500/10 blur-xl animate-neural-pulse"></div>
              )}
              <div className="relative z-10">
                <span className={`material-symbols-outlined text-[20px] ${item.color} transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 ${activeMode === item.id ? 'animate-neural-pulse' : ''}`}>{item.icon}</span>
              </div>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>
            </button>
          ))}
        </div>

        <div>
           <h3 className="px-3 text-[8px] font-black text-gray-600 uppercase tracking-[0.5em] mb-4 opacity-70 animate-slide-up-fade" style={{ animationDelay: '0.4s' }}>Architect Toolbox</h3>
           <div className="space-y-1.5 staggered-list" style={{ animationDelay: '0.45s' }}>
              {tools.map((tool, index) => (
                  <button 
                    key={index} 
                    onClick={() => onSelectMode?.(tool.id)}
                    style={{ animationDelay: `${0.45 + index * 0.05}s` }}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-xs font-medium rounded-xl transition-all duration-500 group relative ${activeMode === tool.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 hover:translate-x-1'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${tool.textColor} group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500`}>{tool.icon}</span>
                    <span className="truncate group-hover:font-bold transition-all group-hover:translate-x-1">{tool.title}</span>
                  </button>
              ))}
           </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 animate-slide-up-fade" style={{ animationDelay: '0.6s' }}>
        <button className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition-all duration-500 text-left group">
          <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[12px] font-bold shadow-lg group-hover:scale-110 transition-all duration-500">
                JD
              </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">John Doe</p>
          </div>
          <span className="material-symbols-outlined text-gray-600 text-[18px] group-hover:text-white transition-all duration-700 group-hover:rotate-180">settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;