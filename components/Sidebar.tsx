import React from 'react';
import { NavItem, RecentItem, FeaturedTool, ChatMode } from '../types';

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
          className="branding-area branding-perspective flex items-center gap-3.5 mb-8 px-1 cursor-pointer group select-none relative p-2.5 rounded-2xl transition-all duration-500 hover:bg-white/[0.04]" 
          onClick={() => onSelectMode?.('chat')}
        >
          {/* Logo Container - Vibrant Purple High Fidelity */}
          <div className="branding-card relative w-11 h-11 flex-shrink-0">
             {/* Reactive Backdrop Aura - Updated to Purple/Fuchsia */}
             <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600/0 via-fuchsia-600/0 to-indigo-500/0 group-hover:from-purple-600/30 group-hover:via-fuchsia-600/30 group-hover:to-indigo-500/20 rounded-full blur-2xl transition-all duration-700 animate-nebula-pulse"></div>
             
             {/* Dynamic Orbital Rings - Updated to Purple Tones */}
             <div className="absolute -inset-1.5 rounded-xl border border-purple-400/5 group-hover:border-purple-400/50 animate-spin-reverse-slow transition-all duration-500"></div>
             <div className="absolute -inset-0.5 rounded-xl border border-fuchsia-400/5 group-hover:border-fuchsia-400/50 animate-spin-slow transition-all duration-500"></div>
             
             {/* Glassmorphic Core Surface - Updated to Purple Tint */}
             <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-[2px] group-hover:bg-purple-500/25 transition-all duration-500"></div>
             
             {/* Logo Panel */}
             <div className="relative w-full h-full rounded-xl bg-[#0d101d] flex items-center justify-center text-white shadow-2xl border border-white/10 overflow-hidden group-hover:border-purple-500/40 transition-all duration-300">
                {/* Layered Gradient Depths - Updated to Vibrant Purple */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-800/70 via-indigo-950/50 to-black group-hover:scale-110 transition-transform duration-700"></div>
                
                {/* Periodic Scanning Glint */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                
                {/* High-Impact Iconography - Bright Purple Glow */}
                <span className="material-symbols-outlined text-[24px] relative z-10 text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,1)] transition-all duration-500 group-hover:scale-120 group-hover:text-white">
                    auto_awesome
                </span>

                {/* Micro-Interaction Sparkles */}
                <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-fuchsia-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-700"></div>
             </div>
          </div>
          
          {/* Typography - Precision Scaled */}
          <div className="flex flex-col justify-center overflow-hidden">
            <h1 className="relative font-display font-black text-[22px] tracking-[-0.03em] leading-none flex items-center transition-all duration-500 group-hover:tracking-tight">
              <span className="text-white group-hover:text-purple-50 transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                Heliex
              </span>
              <span className="text-gradient animate-text-gradient ml-1.5 group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_12px_rgba(192,132,252,0.4)] group-hover:drop-shadow-[0_0_18px_rgba(192,132,252,0.6)]">
                AI
              </span>
              
              {/* Refined Signal Indicator */}
              <div className="absolute -top-1 -right-3.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.9)] group-hover:bg-purple-400 transition-colors"></span>
              </div>
            </h1>
            
            <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[8.5px] font-black text-gray-500 uppercase tracking-[0.35em] transition-all duration-700 group-hover:tracking-[0.45em] group-hover:text-purple-400/80 whitespace-nowrap">
                    Unified Platform
                </span>
                {/* Decorative Terminal Line */}
                <div className="h-[1px] w-0 bg-gradient-to-r from-purple-500/60 to-transparent transition-all duration-700 group-hover:w-10"></div>
            </div>
          </div>
        </div>

        <div className="relative mb-6 group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-600 transition-colors group-focus-within:text-indigo-500">
            <span className="material-symbols-outlined text-[18px] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">search</span>
          </span>
          <input
            className="w-full py-2.5 pl-10 pr-4 text-xs bg-white/5 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-gray-100 placeholder-gray-600 transition-all backdrop-blur-xl group-hover:bg-white/[0.07]"
            placeholder="Search universe..."
            type="text"
          />
        </div>

        <button 
            onClick={() => onNewChat?.()}
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-500/10 rounded-xl shadow-sm hover:-translate-y-0.5 hover:border-indigo-500/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="material-symbols-outlined text-indigo-400 text-[20px] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">add_circle</span>
          <span className="font-bold text-xs tracking-wide text-indigo-100/80 group-hover:text-white transition-colors">Initiate Chat</span>
          <div className="ml-auto text-[8px] font-bold text-gray-600 border border-white/5 px-1.5 py-0.5 rounded-md group-hover:border-indigo-500/40 transition-colors">CTRL N</div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-8">
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelectMode?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden
                ${activeMode === item.id 
                  ? 'bg-white/10 text-white shadow-xl ring-1 ring-white/10' 
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 hover:translate-x-1.5'
                }`}
            >
              <div className="relative z-10">
                <span className={`material-symbols-outlined text-[20px] ${item.color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>{item.icon}</span>
                {item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#0b0b0b] animate-pulse"></span>
                )}
              </div>
              <span className="relative z-10">{item.label}</span>
              {activeMode === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
              )}
            </button>
          ))}
        </div>

        <div>
           <h3 className="px-3 text-[8px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 opacity-60">Architect Toolbox</h3>
           <div className="space-y-1">
              {tools.map((tool, index) => (
                  <button 
                    key={index} 
                    onClick={() => onSelectMode?.(tool.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all duration-300 group ${activeMode === tool.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 hover:translate-x-1.5'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${tool.textColor} group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500`}>{tool.icon}</span>
                    <span className="truncate group-hover:font-bold transition-all">{tool.title}</span>
                  </button>
              ))}
           </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5">
        <button className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition-all duration-500 text-left group">
          <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-aurora group-hover:rotate-3">
                JD
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#08090f] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate transition-colors group-hover:text-indigo-300">John Doe</p>
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest opacity-60">Architect Pro</p>
          </div>
          <span className="material-symbols-outlined text-gray-600 text-[18px] group-hover:text-white transition-all duration-500 group-hover:rotate-180">settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;