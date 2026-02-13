
import React from 'react';
import { FeaturedTool, ChatMode } from '../types';

interface FeaturedToolsProps {
  onSelect?: (id: ChatMode) => void;
}

const tools: FeaturedTool[] = [
  {
    icon: 'table_chart',
    title: 'DATA PILOT',
    description: 'Visualize complex datasets with advanced neural processing.',
    gradientFrom: 'bg-indigo-600',
    gradientTo: 'from-indigo-600 to-indigo-800',
    textColor: 'text-indigo-100',
    id: 'data'
  },
  {
    icon: 'palette',
    title: 'CREATIVE STUDIO',
    description: 'Design and modify visuals using generative diffusion models.',
    gradientFrom: 'bg-pink-700',
    gradientTo: 'from-pink-700 to-fuchsia-900',
    textColor: 'text-pink-100',
    id: 'creative'
  },
  {
    icon: 'terminal',
    title: 'CODE ARCHITECT',
    description: 'Advanced debugging and architectural code generation.',
    gradientFrom: 'bg-emerald-700',
    gradientTo: 'from-emerald-700 to-teal-900',
    textColor: 'text-emerald-100',
    id: 'code'
  },
  {
    icon: 'public',
    title: 'WEB RESEARCH',
    description: 'Live internet browsing with real-time fact checking.',
    gradientFrom: 'bg-blue-600',
    gradientTo: 'from-blue-600 to-blue-800',
    textColor: 'text-blue-100',
    id: 'web'
  },
  {
    icon: 'description',
    title: 'DOC ANALYSIS',
    description: 'PDF & Docx summary with semantic context extraction.',
    gradientFrom: 'bg-orange-600',
    gradientTo: 'from-orange-600 to-red-700',
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
      <div className="flex justify-between items-center mb-2 px-1 animate-slide-up-fade" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em] opacity-80">TOOLBOX</h2>
        <button 
          onClick={() => triggerHaptic()}
          className="text-[8px] font-black text-indigo-400 hover:text-indigo-300 transition-all tracking-widest uppercase"
        >
          LIBRARY
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2 staggered-list" style={{ animationDelay: '0.4s' }}>
        {tools.map((tool, index) => (
          <div 
            key={index} 
            onClick={() => {
              triggerHaptic(15);
              onSelect?.(tool.id);
            }}
            style={{ animationDelay: `${0.4 + index * 0.05}s` }}
            className={`relative group rounded-2xl cursor-pointer transition-all duration-500 hover:-translate-y-1 active:scale-95 overflow-hidden h-24 flex flex-col justify-end p-3 ${tool.gradientFrom} shadow-lg`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-40"></div>
            
            <div className="relative z-10 flex flex-col gap-1.5">
              <div className="w-6 h-6 rounded bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-[14px]">{tool.icon}</span>
              </div>
              <h3 className="text-white font-black text-[8px] tracking-widest leading-tight">
                {tool.title.split(' ')[0]}<br/>{tool.title.split(' ')[1]}
              </h3>
            </div>
            
            <div className={`absolute -inset-2 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700 ${tool.gradientFrom} animate-pulse-slow`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedTools;
