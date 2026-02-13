import React, { useRef, useEffect } from 'react';
import { TerminalLog } from '../types';

interface TerminalDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    logs: TerminalLog[];
    onClear: () => void;
    input: string;
    onInputChange: (value: string) => void;
    onInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const TerminalDrawer: React.FC<TerminalDrawerProps> = ({ 
    isOpen, 
    onClose, 
    logs, 
    onClear, 
    input, 
    onInputChange, 
    onInputKeyDown 
}) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync log scrolling with robust animation frame handling
    useEffect(() => {
        const scrollToBottom = () => {
            if (terminalRef.current) {
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            }
        };

        // Immediate scroll
        scrollToBottom();

        // Secondary scroll to catch late rendering or animations
        const rafId = requestAnimationFrame(scrollToBottom);
        
        if (isOpen) {
            const timeoutId = setTimeout(scrollToBottom, 310);
            return () => {
                clearTimeout(timeoutId);
                cancelAnimationFrame(rafId);
            };
        }
        return () => cancelAnimationFrame(rafId);
    }, [logs, isOpen]);

    // Sync textarea height with input value
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            if (input) {
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        }
    }, [input]);

    const getLogIcon = (type: TerminalLog['type']) => {
        switch (type) {
            case 'error': return 'error';
            case 'warn': return 'warning';
            case 'info': return 'info';
            case 'result': return 'chevron_left';
            default: return 'segment';
        }
    };

    return (
        <div className={`fixed bottom-0 left-0 md:left-[280px] right-0 bg-[#0c0d12] border-t border-white/5 shadow-2xl transition-all duration-300 z-[60] flex flex-col ${isOpen ? 'h-80 opacity-100 translate-y-0' : 'h-0 opacity-0 translate-y-full overflow-hidden'}`}>
            <div className="flex items-center justify-between px-4 py-2 bg-[#14161e] border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-indigo-400">terminal</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Quantum Terminal</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClear} 
                        className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 rounded-md text-[10px] font-bold text-gray-500 hover:text-red-400 transition-all uppercase tracking-widest" 
                        title="Clear All Output"
                    >
                        <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                        <span>Flush Logs</span>
                    </button>
                    <div className="h-3 w-px bg-white/5"></div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-colors" title="Close">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>
            
            <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3 bg-[#0c0d12] no-scrollbar scroll-smooth">
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 select-none pointer-events-none">
                        <span className="material-symbols-outlined text-[48px] mb-2">developer_board</span>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Core Idle: Awaiting Input</p>
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-4 group relative animate-[slide-up-fade_0.2s_ease-out_forwards] pb-2 border-b border-white/[0.03] last:border-0">
                        <div className="flex flex-col items-end gap-1 w-16 flex-shrink-0 pt-0.5">
                            <span className="text-[9px] font-bold text-gray-600 select-none tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
                                {log.timestamp}
                            </span>
                            <span className={`material-symbols-outlined text-[14px] ${
                                log.type === 'error' ? 'text-red-500/50' :
                                log.type === 'warn' ? 'text-yellow-500/50' :
                                log.type === 'info' ? 'text-blue-500/50' :
                                log.type === 'result' ? 'text-emerald-500/50' :
                                'text-gray-700'
                            }`}>
                                {getLogIcon(log.type)}
                            </span>
                        </div>
                        <div className={`break-words whitespace-pre-wrap flex-1 leading-relaxed ${
                            log.type === 'error' ? 'text-red-300' :
                            log.type === 'warn' ? 'text-yellow-200' :
                            log.type === 'info' ? 'text-indigo-300 font-medium' :
                            log.type === 'result' ? 'text-emerald-400 font-bold bg-emerald-500/5 -mx-2 px-2 rounded-lg' :
                            'text-gray-400'
                        }`}>
                            {log.content}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Input Line */}
            <div className="p-3 bg-[#14161e] border-t border-white/5 flex items-start gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold select-none text-[10px]">
                    λ
                </div>
                <textarea 
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-indigo-50 font-mono text-xs placeholder-gray-700 resize-none py-1 leading-relaxed outline-none no-scrollbar"
                    placeholder="Input command (JavaScript sequence)..."
                    rows={1}
                    spellCheck={false}
                    style={{ minHeight: '24px' }}
                />
            </div>
        </div>
    );
};

export default TerminalDrawer;