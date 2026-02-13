import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import BackgroundEffects from './components/BackgroundEffects';
import { ChatMode, Message } from './types';

// Lazy load the heavy components
const AgentEngine = React.lazy(() => import('./components/AgentEngine'));
const VisionStudio = React.lazy(() => import('./components/VisionStudio'));

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ChatMode>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [messagesByMode, setMessagesByMode] = useState<Record<ChatMode, Message[]>>({
    chat: [],
    research: [],
    agents: [],
    projects: [],
    data: [],
    creative: [],
    code: [],
    web: [],
    doc: [],
    coffee: [],
    superfast: []
  });

  const updateMessages = useCallback((mode: ChatMode, newMessages: Message[]) => {
    setMessagesByMode(prev => ({
      ...prev,
      [mode]: newMessages
    }));
  }, []);

  const startNewChat = () => {
    updateMessages(activeMode, []);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        startNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode]);

  const getModeName = (mode: ChatMode) => {
    switch(mode) {
        case 'chat': return 'Heliex 4.0';
        case 'research': return 'Deep Research';
        case 'code': return 'Code Architect';
        case 'creative': return 'Creative Studio';
        case 'data': return 'Data Pilot';
        case 'web': return 'Web Research';
        case 'doc': return 'Doc Analysis';
        case 'coffee': return 'Vision Studio';
        case 'agents': return 'Agentic Workflows';
        case 'superfast': return 'Lightning Core';
        default: return 'Heliex 4.0';
    }
  };

  const getModeIcon = (mode: ChatMode) => {
    switch(mode) {
        case 'chat': return 'bolt';
        case 'research': return 'travel_explore';
        case 'code': return 'terminal';
        case 'creative': return 'palette';
        case 'data': return 'table_chart';
        case 'web': return 'public';
        case 'doc': return 'description';
        case 'coffee': return 'image';
        case 'agents': return 'smart_toy';
        case 'superfast': return 'electric_bolt';
        default: return 'auto_awesome';
    }
  };

  return (
    <div className="relative flex h-screen text-gray-900 dark:text-gray-100 font-display overflow-hidden transition-colors duration-300">
      
      <BackgroundEffects />

      <Sidebar 
        className="hidden md:flex z-20 relative bg-opacity-80 dark:bg-opacity-80 backdrop-blur-xl" 
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        onNewChat={startNewChat}
      />

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 w-[280px] z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
            className="h-full w-full bg-opacity-95 backdrop-blur-xl"
            activeMode={activeMode}
            onSelectMode={(mode) => {
                setActiveMode(mode);
                setIsMobileMenuOpen(false);
            }}
            onNewChat={() => {
              startNewChat();
              setIsMobileMenuOpen(false);
            }}
        />
      </div>

      <main className="flex-1 flex flex-col relative h-full min-w-0 z-10 bg-transparent">
        <header className="flex justify-between items-center px-6 py-4 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
             <button 
                className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100/50 dark:hover:bg-[#1f1f1f]/50 transition-colors"
                onClick={() => {
                  if ('vibrate' in navigator) navigator.vibrate(5);
                  setIsMobileMenuOpen(true);
                }}
             >
                <span className="material-symbols-outlined">menu</span>
             </button>

             <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-[#1f1f1f]/80 p-1 rounded-lg backdrop-blur-sm">
                <button className="relative overflow-hidden px-3 py-1.5 bg-white dark:bg-[#2f2f2f] rounded shadow-sm text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 group transition-all hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <span className="material-symbols-outlined text-[18px] text-indigo-500 relative z-10">
                        {getModeIcon(activeMode)}
                    </span>
                    <span className="relative z-10">{getModeName(activeMode)}</span>
                </button>
             </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {activeMode === 'agents' ? (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
                <span className="material-symbols-outlined text-4xl text-indigo-500 animate-spin">smart_toy</span>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Loading Agentic Core...</p>
              </div>
            }>
              <AgentEngine />
            </Suspense>
          ) : activeMode === 'coffee' ? (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
                <span className="material-symbols-outlined text-4xl text-purple-500 animate-spin">palette</span>
                <p className="text-xs font-black uppercase tracking-[0.4em] text-purple-400">Booting Vision Studio...</p>
              </div>
            }>
              <VisionStudio />
            </Suspense>
          ) : (
            <ChatInterface 
              activeMode={activeMode} 
              onModeChange={setActiveMode} 
              messages={messagesByMode[activeMode]}
              onMessagesChange={(msgs) => updateMessages(activeMode, msgs)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;