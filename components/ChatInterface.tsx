import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChatMode, Message, TerminalLog, AttachedFile } from '../types';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { getSuggestions } from '../utils/chatUtils';
import SyntaxHighlighter from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/styles/prism/vsc-dark-plus';
import TerminalDrawer from './TerminalDrawer';
import FeaturedTools from './FeaturedTools';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

interface ChatInterfaceProps {
  activeMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  messages: Message[];
  onMessagesChange: (msgs: Message[]) => void;
}

const TypingIndicator = ({ isThinking, isGeneratingImage }: { isThinking?: boolean, isGeneratingImage?: boolean }) => (
    <div className="flex flex-col gap-2 px-1 py-1 select-none">
        {(isThinking || isGeneratingImage) && (
            <div className="flex items-center gap-3 mb-1">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                    <div className="absolute -top-4 -right-4 text-[10px] animate-wiggle">
                        {isGeneratingImage ? '🎨' : '🧠'}
                    </div>
                    <span className="material-symbols-outlined text-[14px] text-indigo-400 relative z-10 animate-spin-slow">
                        {isGeneratingImage ? 'palette' : 'psychology'}
                    </span>
                </div>
                <span className="text-[9px] font-black text-indigo-400/70 uppercase tracking-[0.2em] animate-pulse">
                    {isGeneratingImage ? 'Visualizing Concept...' : 'Neural Reasoning...'}
                </span>
            </div>
        )}
        <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500/60 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
    </div>
);

const CodeBlock = ({ 
    className, 
    children, 
    activeMode, 
    onRun
}: { 
    className?: string, 
    children?: React.ReactNode, 
    activeMode: ChatMode, 
    onRun: (code: string) => void
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const isCodeBlock = !!match;
    const language = match ? match[1] : '';
    const codeContent = String(children).replace(/\n$/, '');
    const isRunnable = activeMode === 'code' && ['js', 'javascript', 'ts', 'typescript'].includes(language);

    const handleCopy = async () => {
        if ('vibrate' in navigator) navigator.vibrate(5);
        try {
            await navigator.clipboard.writeText(codeContent);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) { console.error('Failed to copy!', err); }
    };

    if (!isCodeBlock) return <code className="bg-white/10 px-1.5 py-0.5 rounded text-pink-400 font-mono text-xs">{children}</code>;

    return (
        <div className="relative group rounded-xl overflow-hidden my-4 border border-white/5 shadow-2xl transition-all">
            <div className="flex items-center justify-between px-3 py-2 bg-black/40 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500/20"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/20"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/20"></span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{language}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isRunnable && (
                        <button onClick={() => { if ('vibrate' in navigator) navigator.vibrate(10); onRun(codeContent); }} className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-indigo-400 bg-indigo-400/5 rounded-lg border border-indigo-400/20 hover:bg-indigo-400/10 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">play_arrow</span> RUN
                        </button>
                    )}
                    <button onClick={handleCopy} className="p-1 text-gray-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[16px]">{isCopied ? 'check' : 'content_copy'}</span>
                    </button>
                </div>
            </div>
            <div className="bg-[#050608] p-0">
                <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px', lineHeight: '1.6' }} wrapLongLines={true} PreTag="div">
                    {codeContent}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeMode, onModeChange, messages, onMessagesChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const driveInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Sticky scroll management: detect if user has manually scrolled up
  const isAtBottomRef = useRef(true);

  const suggestions = getSuggestions(activeMode);

  const triggerHaptic = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current && isAtBottomRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Allow a small threshold (e.g. 50px) for "at bottom"
    const isAtBottom = scrollHeight - clientHeight - scrollTop < 50;
    isAtBottomRef.current = isAtBottom;
  };

  useLayoutEffect(() => {
    if (messages.length > 0) {
      const isStreaming = messages.some(m => m.isStreaming);
      if (isStreaming || isLoading) {
          // Force scroll only if they were already at the bottom
          scrollToBottom('auto');
          // Secondary scroll to catch any layout shifts after initial render
          requestAnimationFrame(() => scrollToBottom('auto'));
      } else {
          scrollToBottom('smooth');
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleRunCode = (code: string) => {
    setIsTerminalOpen(true);
    triggerHaptic(10);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setTerminalLogs(prev => [...prev, { 
        type: 'info', 
        content: `Executing script...`, 
        timestamp 
    }]);

    try {
        const result = eval(code); 
        setTerminalLogs(prev => [...prev, { 
            type: 'result', 
            content: result !== undefined ? String(result) : 'undefined', 
            timestamp 
        }]);
    } catch (err: any) {
        setTerminalLogs(prev => [...prev, { 
            type: 'error', 
            content: err.message, 
            timestamp 
        }]);
    }
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!terminalInput.trim()) return;
        handleRunCode(terminalInput);
        setTerminalInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    triggerHaptic(15);
    (Array.from(files) as File[]).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const newFile: AttachedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: isImage ? 'image' : 'file',
        preview: isImage ? URL.createObjectURL(file) : undefined
      };
      setAttachedFiles(prev => [...prev, newFile]);
    });
    setIsToolsMenuOpen(false);
    e.target.value = ''; 
  };

  const removeFile = (id: string) => {
    triggerHaptic(5);
    setAttachedFiles(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
        return prev.filter(f => f.id !== id);
    });
  };

  const handleSend = async (isLightningOverride: boolean = false) => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading) return;
    
    const isLightning = isLightningOverride || activeMode === 'superfast';
    const userText = inputValue || "Analyze the attached documents.";
    const thinkingActive = isThinkingMode && !isLightning;
    const currentMode = activeMode;
    const currentAttachedFiles = [...attachedFiles] as AttachedFile[];
    
    setInputValue('');
    setAttachedFiles([]);
    setIsToolsMenuOpen(false);
    
    triggerHaptic(20);

    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        content: userText 
    };
    
    const firstImage = currentAttachedFiles.find(f => f.type === 'image');
    if (firstImage) {
        userMsg.imageUrl = firstImage.preview;
    }

    const initialMessages = [...messages, userMsg];
    onMessagesChange(initialMessages);
    setIsLoading(true);
    // Reset bottom tracking on user message to force scroll
    isAtBottomRef.current = true;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const aiMsgId = (Date.now() + 1).toString();
        
        const brandIdentity = "Important Company Facts: The CEO of Heliex AI is Krins Gopani. Heliex AI operates under the parent company name 'No Target'. The company headquarters is located at Sardhardham Hostel, Ahmedabad.";

        const mediaParts: any[] = [];
        for (const f of currentAttachedFiles) {
          const base64Data = await fileToBase64(f.file);
          mediaParts.push({
            inlineData: {
              data: base64Data,
              mimeType: f.file.type
            }
          });
        }

        const promptInstruction = currentAttachedFiles.length > 0 
            ? `[SYSTEM: The user has uploaded ${currentAttachedFiles.length} file(s). Analyze them carefully to answer: ${userText}]` 
            : userText;

        const promptParts = [...mediaParts, { text: promptInstruction }];

        const contents = initialMessages.map((msg, index) => {
            const isLastMessage = index === initialMessages.length - 1;
            const parts = (isLastMessage && msg.role === 'user') 
                ? promptParts 
                : [{ text: msg.content }];

            return {
                role: msg.role === 'user' ? 'user' as const : 'model' as const,
                parts
            };
        });

        if (currentMode === 'creative') {
            const generatingMsg: Message = { id: aiMsgId, role: 'model', content: 'Generating your vision...', isStreaming: true };
            onMessagesChange([...initialMessages, generatingMsg]);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: contents,
                config: { imageConfig: { aspectRatio: "1:1" } },
            });

            let finalImageUrl = '';
            let finalCaption = '';
            
            const candidateParts = response.candidates?.[0]?.content?.parts || [];
            for (const part of candidateParts) {
                if (part.inlineData) {
                    finalImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    finalCaption += part.text;
                }
            }

            onMessagesChange([...initialMessages, { 
                id: aiMsgId, 
                role: 'model', 
                content: finalCaption || "Visual synthesis complete.", 
                imageUrl: finalImageUrl,
                isStreaming: false 
            }]);
            
        } else {
            const modelToUse = isLightning ? 'gemini-3-flash-preview' : (thinkingActive ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview');
            
            const systemInstructions: Record<string, string> = {
              code: `You are the Heliex Personal Code Architect. Your workspace is optimized for advanced software engineering and architectural planning. ${brandIdentity}`,
              research: `You are the Heliex Research Personal Assistant. You excel at deep information retrieval. ${brandIdentity}`,
              chat: `You are Heliex 4.0, a unified intelligence agent for accurate assistance. ${brandIdentity}`,
              doc: `You are the Heliex Document Analyst. You excel at summarizing, analyzing, and extracting insights from files like PDFs and TXT documents. ${brandIdentity}`
            };

            let instruction = systemInstructions[currentMode] || systemInstructions.chat;
            if (isLightning) {
                instruction = `[LIGHTNING CORE ACTIVE: ACT AS A HIGH-SPEED NEURAL LINK. MAXIMUM BREVITY. NO FLUFF.] ${instruction}`;
            }

            const modelConfig: any = {
                systemInstruction: instruction,
                temperature: isLightning ? 0.1 : undefined
            };

            if (thinkingActive) modelConfig.thinkingConfig = { thinkingBudget: 32768 };
            if (currentMode === 'research' || currentMode === 'web') modelConfig.tools = [{ googleSearch: {} }];

            const streamingMsg: Message = { id: aiMsgId, role: 'model', content: '', isStreaming: true };
            onMessagesChange([...initialMessages, streamingMsg]);

            const responseStream = await ai.models.generateContentStream({
                model: modelToUse,
                contents: contents,
                config: modelConfig
            });

            let fullText = '';
            let sources: Array<{title: string, uri: string}> = [];
            
            for await (const chunk of responseStream) {
                fullText += chunk.text || '';
                
                const candidate = chunk.candidates?.[0];
                if (candidate?.groundingMetadata?.groundingChunks) {
                    candidate.groundingMetadata.groundingChunks.forEach((c: any) => {
                        if (c.web?.uri) {
                            const exists = sources.some(s => s.uri === c.web.uri);
                            if (!exists) {
                                sources.push({
                                    title: c.web.title || 'Source',
                                    uri: c.web.uri
                                });
                            }
                        }
                    });
                }
                
                onMessagesChange([...initialMessages, { 
                    id: aiMsgId, 
                    role: 'model', 
                    content: fullText, 
                    isStreaming: true,
                    sources: sources.length > 0 ? sources : undefined
                }]);
            }
            
            onMessagesChange([...initialMessages, { 
                id: aiMsgId, 
                role: 'model', 
                content: fullText, 
                isStreaming: false,
                sources: sources.length > 0 ? sources : undefined
            }]);
        }
        
        triggerHaptic(5);

    } catch (e: any) {
        let errorMsg = "Quantum Interface Disrupted: " + e.message;
        if (e.message?.toLowerCase().includes("quota")) {
            errorMsg = "⚠️ **System Resource Throttled: Quota Exceeded**\n\nYour neural processor has reached its current transmission limit. Please wait 60 seconds before re-establishing the link.\n\n*Switch to Lightning mode for low-overhead queries.*";
        }
        onMessagesChange([...initialMessages, { id: 'err', role: 'model', content: errorMsg }]);
        triggerHaptic([10, 50, 10]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div 
        ref={scrollContainerRef} 
        onScroll={handleScroll}
        className={`flex-1 flex flex-col items-center w-full h-full relative z-10 transition-opacity duration-500 overflow-y-auto no-scrollbar scroll-smooth ${messages.length === 0 ? 'justify-center pb-24' : 'pb-48'}`}
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99, 102, 241, 0.2) transparent' }}
    >
      {messages.length === 0 ? (
          <div className="w-full flex flex-col items-center max-w-6xl px-6 py-12 space-y-12">
            <div className="text-center space-y-4 animate-float">
              <p className="text-indigo-400 font-black text-[10px] tracking-[0.4em] opacity-60 mb-8 uppercase">
                  Quantum Core 4.0
              </p>
              
              <div className="relative inline-block group">
                  <div className="absolute -inset-12 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none select-none relative animate-slide-up-fade">
                      Heliex <span className="text-gradient">AI</span>
                  </h1>
              </div>
            </div>

            <div className="w-full animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
                <FeaturedTools onSelect={onModeChange} />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 w-full max-w-2xl animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
            {suggestions.map((btn, i) => (
                <button 
                  key={i} 
                  className={`flex flex-col items-center gap-3 group transition-all duration-500 relative`} 
                  onClick={() => { 
                    triggerHaptic(10);
                    if(btn.targetMode) onModeChange(btn.targetMode); 
                    setInputValue(btn.actionPayload || btn.label); 
                  }}
                >
                    <div className="absolute -top-2 -right-2 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 animate-wiggle">
                        ✨
                    </div>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white/[0.08] group-hover:border-indigo-500/40 transition-all duration-500">
                        <span className={`material-symbols-outlined text-[20px] md:text-[26px] ${btn.colorClass} transition-all duration-300`}>{btn.icon}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-indigo-300 transition-all duration-300">{btn.label}</span>
                </button>
            ))}
            </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-10 py-10 px-6">
            <div className="flex items-center justify-center py-2 opacity-20 pointer-events-none select-none">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/30"></div>
                <span className="mx-4 text-[9px] font-black uppercase tracking-[0.4em] text-white">
                  {activeMode === 'code' ? 'Isolated Workspace Environment' : activeMode === 'creative' ? 'Digital Studio Interface' : 'Encrypted Personal Context'}
                </span>
                <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/30"></div>
            </div>

            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in transition-all duration-500`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0 mt-1 relative group/avatar">
                            <div className="absolute -top-4 -left-4 text-xs opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 animate-wiggle">🤖</div>
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-xl relative group transition-all duration-500 hover:scale-110 ${msg.isStreaming ? 'animate-pulse shadow-aurora' : ''}`}>
                                <span className="material-symbols-outlined text-[18px]">
                                    {activeMode === 'creative' ? 'brush' : 'auto_awesome'}
                                </span>
                                {msg.isStreaming && (
                                    <div className="absolute inset-0 bg-indigo-500 rounded-xl animate-ping opacity-20"></div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={`relative max-w-[85%] rounded-[24px] p-5 shadow-2xl transition-all duration-700 overflow-hidden ${
                        msg.role === 'user' 
                            ? 'bg-[#1a1c24] text-white border border-white/10 shadow-indigo-500/5 hover:border-white/20' 
                            : 'glass-panel text-gray-100 border-l-[3px] border-l-indigo-500 border-white/5 bg-indigo-500/[0.02] hover:bg-indigo-500/[0.04] shadow-vibrant-indigo/5'
                    }`}>
                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-[15px] font-medium tracking-wide transition-all duration-300">
                            <ReactMarkdown components={{ code: (p) => <CodeBlock {...p} activeMode={activeMode} onRun={handleRunCode} /> }}>
                                {msg.content}
                            </ReactMarkdown>

                            {msg.imageUrl && (
                                <div className="mt-4 group/img relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40 animate-pop-in">
                                    <img src={msg.imageUrl} alt="Attachment Preview" className="w-full h-auto object-cover transition-transform duration-1000 group-hover/img:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 flex items-end p-4">
                                        <button 
                                            onClick={() => { if ('vibrate' in navigator) navigator.vibrate(10); window.open(msg.imageUrl, '_blank'); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                                            Expand Vision
                                        </button>
                                    </div>
                                </div>
                            )}

                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Grounding Sources</p>
                                    <div className="flex flex-wrap gap-2">
                                        {msg.sources.map((source, idx) => (
                                            <a 
                                                key={idx} 
                                                href={source.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[11px] text-indigo-400 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">link</span>
                                                <span className="truncate max-w-[150px] font-bold">{source.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {msg.isStreaming && (
                                <div className="mt-2 flex items-center gap-3">
                                    <span className="inline-block w-[2px] h-[1.2em] bg-indigo-500 animate-pulse rounded-full shadow-[0_0_8px_rgba(99,102,241,1)]"></span>
                                    <TypingIndicator 
                                        isThinking={isThinkingMode} 
                                        isGeneratingImage={activeMode === 'creative'} 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} className="h-4 w-full" />
        </div>
      )}

      {/* Dynamic Pill Input Container */}
      <div className={`w-full max-w-4xl px-6 fixed z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isTerminalOpen ? 'bottom-[340px]' : 'bottom-8'}`}>
        
        {/* HIGH FIDELITY ATTACHED FILES PREVIEW BAR */}
        {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mb-4 animate-slide-up-fade px-2">
                {attachedFiles.map(file => (
                    <div key={file.id} className="relative group/file bg-[#0d0f17]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 pr-10 flex items-center gap-3 shadow-2xl hover:bg-[#14161e] hover:border-indigo-500/30 transition-all duration-300">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                            {file.preview ? (
                                <img src={file.preview} className="w-full h-full object-cover group-hover/file:scale-110 transition-transform duration-500" />
                            ) : (
                                <span className="material-symbols-outlined text-[20px] text-gray-500 group-hover/file:text-indigo-400">description</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-[11px] text-gray-200 font-bold truncate max-w-[140px] leading-none">{file.file.name}</span>
                            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1.5">{file.type}</span>
                        </div>
                        <button 
                            onClick={() => removeFile(file.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all group-hover/file:scale-105"
                            title="Remove Attachment"
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                ))}
            </div>
        )}

        <div className="relative group">
            <div className={`absolute -inset-6 bg-indigo-500/15 rounded-[32px] blur-[100px] transition-opacity duration-1000 pointer-events-none ${isFocused ? 'opacity-100' : 'opacity-0 animate-pulse-slow'}`}></div>
            
            <div className={`relative bg-[#0d0f17]/90 backdrop-blur-3xl rounded-[2.5rem] border transition-all duration-700 shadow-cosmic-soft ${isFocused ? 'bg-[#0f121d] border-indigo-500/40 ring-1 ring-indigo-500/10' : 'border-white/10 hover:border-white/20'}`}>
                <div className="p-8 pb-4">
                  <textarea 
                      ref={inputRef} 
                      placeholder={activeMode === 'code' ? "Architect your solution..." : activeMode === 'creative' ? "Describe your vision..." : activeMode === 'doc' ? "Drop a file and ask for a summary..." : "Collaborate with Heliex..."}
                      className="w-full bg-transparent border-none focus:ring-0 text-white text-xl md:text-2xl resize-none max-h-48 p-0 placeholder-gray-700 font-semibold no-scrollbar leading-relaxed transition-height duration-300 ease-in-out" 
                      rows={1} 
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)} 
                      onFocus={() => setIsFocused(true)} 
                      onBlur={() => setIsFocused(false)} 
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} 
                  />
                </div>
                
                <div className="flex justify-between items-center px-8 pb-6">
                    <div className="flex items-center gap-6 relative">
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    triggerHaptic(10);
                                    setIsToolsMenuOpen(!isToolsMenuOpen);
                                }}
                                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-500 ${isToolsMenuOpen ? 'bg-[#1a1c24] border-[#2a2c34] text-white rotate-45 shadow-glow' : 'border-white/5 text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className={`material-symbols-outlined text-[24px]`}>add</span>
                            </button>

                            {isToolsMenuOpen && (
                                <div className="absolute bottom-[calc(100%+20px)] left-0 w-[260px] bg-[#1e2025] border border-white/5 rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden animate-slide-up-fade z-[100] ring-1 ring-white/5">
                                    <div className="p-2.5">
                                        <div className="flex items-center gap-3 px-4 py-3 mb-1 border-b border-white/[0.03]">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[18px] text-gray-300">add</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px] text-gray-400">tune</span>
                                                <span className="text-[14px] font-bold text-gray-300 tracking-wide">Tools</span>
                                            </div>
                                        </div>

                                        <div className="space-y-0.5 mt-1">
                                            <button 
                                                onClick={() => { triggerHaptic(10); fileInputRef.current?.click(); }}
                                                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-all text-left group rounded-2xl"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="material-symbols-outlined text-[22px] text-gray-400 group-hover:text-white">attach_file</span>
                                                    <span className="text-[14px] font-medium text-gray-200">Upload files</span>
                                                </div>
                                            </button>
                                            
                                            <button 
                                                onClick={() => { triggerHaptic(10); driveInputRef.current?.click(); }}
                                                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.04] transition-all text-left group rounded-2xl"
                                            >
                                                <span className="material-symbols-outlined text-[22px] text-gray-400 group-hover:text-white">add_to_drive</span>
                                                <span className="text-[14px] font-medium text-gray-200">Add from Drive</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => { triggerHaptic(10); photoInputRef.current?.click(); }}
                                                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.04] transition-all text-left group rounded-2xl"
                                            >
                                                <span className="material-symbols-outlined text-[22px] text-gray-400 group-hover:text-white">photo_library</span>
                                                <span className="text-[14px] font-medium text-gray-200">Photos</span>
                                            </button>
                                            
                                            <div className="h-px bg-white/[0.03] mx-3 my-1"></div>

                                            <button 
                                                onClick={() => {
                                                    triggerHaptic(10);
                                                    onModeChange('doc');
                                                    setIsToolsMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.04] transition-all text-left group rounded-2xl"
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[22px] text-gray-400 group-hover:text-indigo-400">waves</span>
                                                    <div className="absolute -inset-1 bg-indigo-500/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>
                                                <span className="text-[14px] font-medium text-gray-200">NotebookLM</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.txt,.docx,.csv,.xlsx" />
                        <input ref={driveInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" />
                        <input ref={photoInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" />
                        
                        <div className="h-4 w-px bg-white/10"></div>
                        
                        <button 
                            onClick={() => {
                                triggerHaptic(10);
                                setIsThinkingMode(!isThinkingMode);
                            }}
                            className={`flex items-center gap-2.5 px-5 py-2 rounded-2xl transition-all duration-500 hover:scale-[1.05] active:scale-95 ${isThinkingMode ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-glow' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isThinkingMode ? 'animate-pulse' : ''}`}>psychology</span>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] hidden sm:inline">Neural Mode</span>
                        </button>

                        {activeMode === 'code' && (
                            <button 
                                onClick={() => {
                                    triggerHaptic(10);
                                    setIsTerminalOpen(!isTerminalOpen);
                                }}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${isTerminalOpen ? 'bg-indigo-500 text-white shadow-glow' : 'text-gray-600 hover:text-indigo-400'}`}
                            >
                                <span className="material-symbols-outlined text-[22px]">terminal</span>
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleSend(true)}
                            disabled={isLoading || (!inputValue.trim() && attachedFiles.length === 0)}
                            className={`h-14 flex items-center gap-2 px-5 rounded-[1.25rem] transition-all duration-700 shadow-2xl relative group/superfast ${isLoading || (!inputValue.trim() && attachedFiles.length === 0) ? 'opacity-10 cursor-not-allowed bg-gray-800' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 hover:scale-105 active:scale-90 shadow-[0_0_25px_rgba(245,158,11,0.2)]'}`}
                            title="Lightning Response"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover/superfast:opacity-100 transition-opacity duration-300 animate-wiggle">⚡</div>
                            <span className="material-symbols-outlined text-[24px] font-bold">bolt</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline">Lightning</span>
                        </button>

                        <button 
                            onClick={() => handleSend(false)} 
                            disabled={isLoading || (!inputValue.trim() && attachedFiles.length === 0)} 
                            className={`h-14 w-14 rounded-[1.25rem] flex items-center justify-center transition-all duration-700 shadow-2xl relative group/send ${isLoading || (!inputValue.trim() && attachedFiles.length === 0) ? 'opacity-10 cursor-not-allowed bg-gray-800' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-110 active:scale-90 shadow-glow'}`}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover/send:opacity-100 transition-opacity duration-300 animate-wiggle">🚀</div>
                            <span className="material-symbols-outlined text-[28px] font-bold">{isLoading ? 'hourglass_top' : 'arrow_upward'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <TerminalDrawer 
          isOpen={isTerminalOpen} 
          onClose={() => { triggerHaptic(5); setIsTerminalOpen(false); }} 
          logs={terminalLogs} 
          onClear={() => { triggerHaptic(10); setTerminalLogs([]); }}
          input={terminalInput}
          onInputChange={setTerminalInput}
          onInputKeyDown={handleTerminalKeyDown}
      />
    </div>
  );
};

export default ChatInterface;