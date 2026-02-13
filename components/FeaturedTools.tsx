import React from 'react';
import { FeaturedTool, ChatMode } from '../types';

interface FeaturedToolsProps {
  onSelect?: (id: ChatMode) => void;
}

const tools: FeaturedTool[] = [
  {
    icon: 'table_chart',
    title: 'Data Pilot',
    description: 'Visualize complex datasets with advanced neural processing.',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-indigo-800',
    textColor: 'text-blue-100',
    id: 'data'
  },
  {
    icon: 'palette',
    title: 'Creative Studio',
    description: 'Design and modify visuals using generative diffusion models.',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-pink-700',
    textColor: 'text-purple-100',
    id: 'creative'
  },
  {
    icon: 'terminal',
    title: 'Code Architect',
    description: 'Advanced debugging and architectural code generation.',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-800',
    textColor: 'text-emerald-100',
    id: 'code'
  },
  {
    icon: 'public',
    title: 'Web Research',
    description: 'Live internet browsing with real-time fact checking.',
    gradientFrom: 'from-cyan-600',
    gradientTo: 'to-blue-600',
    textColor: 'text-cyan-100',
    id: 'web'
  },
  {
    icon: 'description',
    title: 'Doc Analysis',
    description: 'PDF & Docx summary with semantic context extraction.',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-600',
    textColor: 'text-orange-100',
    id: 'doc'
  },
];

const FeaturedTools: React.FC<FeaturedToolsProps> = ({ onSelect }) => {
  const triggerHaptic = (ms: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Featured Toolbox</h2>
        <button 
          onClick={() => triggerHaptic()}
          className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-all group tracking-widest uppercase"
        >
          Library <span className="material-symbols-outlined text-[14px] transition-transform duration-300 group-hover:translate-x-1">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tools.map((tool, index) => (
          <div 
            key={index} 
            onClick={() => {
              triggerHaptic(15);
              onSelect?.(tool.id);
            }}
            className="relative group rounded-2xl cursor-pointer hover:-translate-y-1.5 transition-all duration-500 active:scale-95"
          >
            
            {/* Tooltip Overlay */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-48 pointer-events-none z-50 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-[calc(100%+8px)] transition-all duration-300 ease-out">
              <div className="relative bg-[#0a0c14]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] text-center">
                <p className="text-[11px] font-medium text-gray-200 leading-relaxed">
                  {tool.description}
                </p>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0a0c14]/90 border-r border-b border-white/10 rotate-45"></div>
              </div>
            </div>

            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradientFrom} ${tool.gradientTo} rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity`}></div>
            
            {/* Inner Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.25)_0%,_transparent_75%)] rounded-2xl"></div>
            
            <div className="relative p-6 h-36 flex flex-col justify-between z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <span className="material-symbols-outlined text-white text-[22px] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">{tool.icon}</span>
              </div>
              <div>
                <h3 className="text-white font-black text-[11px] tracking-widest group-hover:translate-x-1 transition-transform duration-300 uppercase">{tool.title}</h3>
                <div className="h-0.5 w-4 bg-white/30 group-hover:w-full transition-all duration-500 mt-1"></div>
              </div>
            </div>
            
            <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/20 transition-colors pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedTools;