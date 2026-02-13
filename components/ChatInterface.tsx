
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { GoogleGenAI } from "@google/genai";
import { ChatMode, Message, AttachedFile } from '../types';
import FeaturedTools from './FeaturedTools';

interface ChatInterfaceProps {
  activeMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
}

const triggerHaptic = (ms: number = 10) => {
  if ('vibrate' in navigator) navigator.vibrate(ms);
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeMode, onModeChange, messages, onMessagesChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Auto-resize textarea with smooth height transition
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const scrollToBottom = useCallback((instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 150;
    isAtBottomRef.current = isBottom;
    setShowScrollBottom(!isBottom);
  };

  const handle429Error = async () => {
    const confirmed = window.confirm("Shared API quota reached. Personal keys offer higher limits. Select yours?");
    if (confirmed) await (window as any).aistudio.openSelectKey();
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: AttachedFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          preview: event.target?.result as string
        };
        setAttachedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
    triggerHaptic(15);
  };

  const handleSend = async (textOverride?: string) => {
    const finalInput = textOverride || inputValue;
    if ((!finalInput.trim() && attachedFiles.length === 0) || isLoading) return;

    const userText = finalInput;
    const currentAttachedFiles = [...attachedFiles];
    const currentMode = activeMode;
    
    setInputValue('');
    setAttachedFiles([]);
    setIsLoading(true);
    triggerHaptic(20);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText || "Process buffer input...",
      imageUrl: currentAttachedFiles.find(f => f.type === 'image')?.preview
    };

    const updatedMessages = [...messages, userMsg];
    onMessagesChange(updatedMessages);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let modelName = 'gemini-flash-lite-latest';
      if (currentMode === 'creative') modelName = 'gemini-2.5-flash-image';

      const parts: any[] = [];
      for (const f of currentAttachedFiles) {
        const b64 = await fileToBase64(f.file);
        parts.push({ inlineData: { data: b64, mimeType: f.file.type } });
      }
      parts.push({ text: userText || "Context processing required." });

      const contents = updatedMessages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));
      
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts = parts;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: "You are Heliex Core. Efficient, precise, and visual-first. Use Flash architecture.",
          thinkingConfig: isThinkingMode ? { thinkingBudget: 16000 } : undefined,
          tools: (currentMode === 'web' || currentMode === 'research') ? [{ googleSearch: {} }] : undefined
        }
      });

      const finalContent = response.text || "";
      const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      const finalImageUrl = imgPart?.inlineData ? `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}` : "";

      onMessagesChange([...updatedMessages, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: finalContent || (finalImageUrl ? "Visual synthesized." : "Complete."),
        imageUrl: finalImageUrl,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
          title: c.web?.title || "Reference",
          uri: c.web?.uri || "#"
        }))
      }]);
    } catch (error: any) {
      if (error.message?.includes('429')) await handle429Error();
      onMessagesChange([...updatedMessages, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Error encountered during sequence: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-6 pb-20 no-scrollbar momentum-scroll"
        onScroll={handleScroll}
      >
        {/* Responsive Content Container */}
        <div className="max-w-full sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto space-y-6 transition-all duration-500">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-10 h-[70vh] justify-center transition-all duration-700 animate-slide-up-fade">
              <div className="text-center flex flex-col items-center gap-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[30px] animate-blob rounded-full group-hover:bg-indigo-500/40 transition-all duration-1000"></div>
                  <div className="w-20 h-20 relative z-10 animate-float flex items-center justify-center bg-indigo-600/10 border border-indigo-500/20 rounded-[1.8rem] backdrop-blur-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-glow">
                    <span className="material-symbols-outlined text-indigo-400 text-[48px]">neurology</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter mb-1">
                    Heliex <span className="text-gradient animate-text-gradient">Flash</span>
                  </h1>
                  <p className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase">Neural Sequence Initiated</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 w-full staggered-list px-4">
                {[
                  { id: 'research', icon: 'travel_explore', color: 'text-purple-400', label: 'RESEARCH' },
                  { id: 'creative', icon: 'palette', color: 'text-pink-500', label: 'CREATIVE' },
                  { id: 'code', icon: 'terminal', color: 'text-orange-500', label: 'CODE' },
                  { id: 'data', icon: 'table_chart', color: 'text-emerald-500', label: 'ANALYZE' }
                ].map((mode) => (
                  <button 
                    key={mode.id}
                    onClick={() => onModeChange(mode.id as ChatMode)}
                    className="group relative h-24 flex flex-col items-center justify-center gap-2 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.08] hover:border-indigo-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow overflow-hidden"
                  >
                     <span className={`material-symbols-outlined ${mode.color} text-[26px] group-hover:scale-110 transition-all`}>{mode.icon}</span>
                     <span className="text-[9px] font-black text-white/50 group-hover:text-white uppercase tracking-widest">{mode.label}</span>
                  </button>
                ))}
              </div>

              <div className="w-full">
                <FeaturedTools onSelect={onModeChange} />
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in group/msg`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className={`relative max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] flex flex-col gap-2`}>
                <div className={`p-5 rounded-[1.8rem] border transition-all duration-500 glass-panel hover-lift message-liquid ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-50' 
                    : 'bg-[#0d0f17]/95 border-white/10 text-gray-100'
                }`}>
                  {msg.imageUrl && (
                    <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 group-hover:scale-[1.02] transition-transform duration-700 shadow-xl cursor-zoom-in">
                      <img src={msg.imageUrl} className="w-full h-auto max-h-[500px] object-contain" alt="Synthetic Result" />
                    </div>
                  )}
                  <div className="markdown-content text-[15px] leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown components={{
                      code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="relative group/code my-4 animate-slide-up-fade">
                            <SyntaxHighlighter 
                              style={vscDarkPlus} 
                              language={match[1]} 
                              PreTag="div" 
                              className="!rounded-2xl !bg-black/40 !border !border-white/5 !p-4 shadow-2xl" 
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-bold" {...props}>{children}</code>
                        );
                      }
                    }}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  
                  {msg.sources && (
                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2 animate-reveal">
                      {msg.sources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[9px] font-bold text-indigo-400 uppercase tracking-widest transition-all hover:-translate-y-0.5">
                          <span className="material-symbols-outlined text-[14px]">link</span>
                          <span className="max-w-[120px] truncate">{s.title}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Micro-interaction Hover Action Overlay */}
                  <div className="absolute -bottom-2 right-4 flex gap-1 opacity-0 group-hover/msg:opacity-100 transition-all translate-y-2 group-hover/msg:translate-y-0 duration-300">
                    <button onClick={() => triggerHaptic(5)} className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:scale-110 active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    </button>
                    <button onClick={() => triggerHaptic(5)} className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:scale-110 active:scale-90 transition-all">
                      <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-message-in">
              <div className="px-5 py-3 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center gap-3 shadow-2xl backdrop-blur-md">
                <div className="flex gap-1.5">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/80 animate-pulse">Core is thinking</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>

      {/* Bounce-in Scroll-to-Bottom Button */}
      <button 
        onClick={() => scrollToBottom()}
        className={`fixed right-10 bottom-24 w-10 h-10 bg-indigo-600 rounded-full border border-indigo-400/50 flex items-center justify-center text-white shadow-super-glow transition-all duration-500 z-50 animate-bounce-subtle ${showScrollBottom ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
      >
        <span className="material-symbols-outlined">arrow_downward</span>
      </button>

      {/* Responsive Input Core */}
      <div className="px-6 pb-6 flex-shrink-0 relative z-50">
        <div className="max-w-full sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <div className={`cyber-pill transition-all duration-700 ${isFocused ? 'scale-[1.01] shadow-super-glow' : 'shadow-2xl'}`}>
            <div className="cyber-pill-inner">
              <div className="flex flex-col">
                {attachedFiles.length > 0 && (
                  <div className="flex gap-3 p-3 bg-white/[0.01] border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth animate-reveal">
                    {attachedFiles.map(f => (
                      <div key={f.id} className="relative group/file w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-spring-in">
                        {f.type === 'image' ? <img src={f.preview} className="w-full h-full object-cover group-hover/file:scale-110 transition-transform duration-700" alt="Buffer" /> : <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center"><span className="material-symbols-outlined text-indigo-400 text-2xl">description</span></div>}
                        <button onClick={() => setAttachedFiles(p => p.filter(i => i.id !== f.id))} className="absolute top-1 right-1 w-5 h-5 bg-red-600/90 rounded text-white flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[12px]">close</span></button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 px-5 py-3 relative">
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-11 h-11 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600/30 hover:border-indigo-500/50 transition-all duration-700 group"
                  >
                    <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-500">add_circle</span>
                    <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileAttach} />
                  </button>

                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                      placeholder="Input sequence command..."
                      className="w-full bg-transparent border-none outline-none text-[15px] text-white placeholder-gray-600 resize-none max-h-48 py-2.5 no-scrollbar leading-relaxed transition-all focus:placeholder:opacity-0"
                      rows={1}
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => { setIsThinkingMode(!isThinkingMode); triggerHaptic(10); }}
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all duration-700 group ${
                        isThinkingMode 
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-glow' 
                          : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl transition-transform duration-700 ${isThinkingMode ? 'rotate-[360deg] scale-110' : ''}`}>psychology</span>
                    </button>

                    <button 
                      onClick={() => handleSend()}
                      disabled={isLoading || (!inputValue.trim() && attachedFiles.length === 0)}
                      className="w-11 h-11 bg-indigo-600 text-white rounded-2xl shadow-glow flex items-center justify-center hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-500 disabled:opacity-20 group/send"
                    >
                       <span className={`material-symbols-outlined text-2xl transition-all duration-700 ${isLoading ? 'animate-spin' : 'group-hover/send:translate-x-1 group-hover/send:-translate-y-1'}`}>
                         {isLoading ? 'autorenew' : 'rocket_launch'}
                       </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 px-3">
             <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                 <p className="text-[9px] font-black tracking-[0.3em] text-gray-600 uppercase">Core Status: Stable</p>
             </div>
             <button onClick={() => (window as any).aistudio.openSelectKey()} className="text-[9px] font-black text-indigo-400/40 hover:text-indigo-400 uppercase tracking-widest transition-all">Personal Access Key</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
