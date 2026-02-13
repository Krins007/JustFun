
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

type VisionTab = 'generate' | 'edit' | 'analyze' | 'history';

interface VisionHistoryItem {
  id: string;
  type: VisionTab;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

const VisionStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VisionTab>('generate');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [history, setHistory] = useState<VisionHistoryItem[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('photorealistic');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = (ms: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentImage(event.target?.result as string);
        triggerHaptic(15);
      };
      reader.readAsDataURL(file);
    }
  };

  const addToHistory = (imageUrl: string, type: VisionTab, p: string) => {
    const newItem: VisionHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl,
      type,
      prompt: p,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResultImage(null);
    triggerHaptic(20);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `${prompt}. Style: ${style}. Aspect ratio: ${aspectRatio}` }],
        },
        config: {
          imageConfig: { aspectRatio: aspectRatio as any }
        }
      });

      for (const part of response.candidates?.[0]?.content.parts || []) {
        if (part.inlineData) {
          const b64 = `data:image/png;base64,${part.inlineData.data}`;
          setResultImage(b64);
          addToHistory(b64, 'generate', prompt);
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
      setAnalysisResult("System fault during synthesis. Check neural link (API key/Quota).");
    } finally {
      setIsLoading(false);
    }
  };

  const editImage = async (editPrompt: string) => {
    if (!currentImage) return;
    setIsLoading(true);
    triggerHaptic(20);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = currentImage.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: editPrompt }
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content.parts || []) {
        if (part.inlineData) {
          const b64 = `data:image/png;base64,${part.inlineData.data}`;
          setResultImage(b64);
          addToHistory(b64, 'edit', editPrompt);
        }
      }
    } catch (error) {
      console.error("Editing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeImage = async (task: string) => {
    if (!currentImage) return;
    setIsLoading(true);
    setAnalysisResult('');
    triggerHaptic(20);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = currentImage.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: task }
          ],
        },
      });

      setAnalysisResult(response.text || "No insights extracted.");
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'generate', icon: 'auto_awesome', label: 'Create' },
    { id: 'edit', icon: 'edit', label: 'Edit' },
    { id: 'analyze', icon: 'biotech', label: 'Insight' },
    { id: 'history', icon: 'history', label: 'Archives' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="space-y-6 animate-slide-up-fade">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visual Prompt</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision in high fidelity..."
                  className="relative w-full bg-[#0d0f17] border border-white/10 rounded-2xl p-4 text-white placeholder-gray-700 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none h-32 text-sm leading-relaxed"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Style</label>
                <select 
                  value={style} 
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-300 outline-none hover:bg-white/10 transition-colors appearance-none cursor-pointer"
                >
                  <option value="photorealistic">Photorealistic</option>
                  <option value="artistic">Artistic Expression</option>
                  <option value="anime">Cinematic Anime</option>
                  <option value="sketch">Hand-drawn Sketch</option>
                  <option value="3d">3D Render</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">Aspect Ratio</label>
                <select 
                  value={aspectRatio} 
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-gray-300 outline-none hover:bg-white/10 transition-colors appearance-none cursor-pointer"
                >
                  <option value="1:1">1:1 Square</option>
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait</option>
                  <option value="4:3">4:3 Desktop</option>
                </select>
              </div>
            </div>

            <button 
              onClick={generateImage}
              disabled={isLoading || !prompt.trim()}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-glow transition-all active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              {isLoading ? 'Synthesizing Vision...' : 'Generate Art'}
            </button>
          </div>
        );

      case 'edit':
      case 'analyze':
        // Fix: Removed 'enhance' case as it is not part of the VisionTab union type.
        return (
          <div className="space-y-6 animate-slide-up-fade">
            {!currentImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group relative overflow-hidden"
              >
                <div className="absolute -inset-[100%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <span className="material-symbols-outlined text-4xl text-gray-700 group-hover:text-purple-400 group-hover:scale-110 transition-all mb-4 relative z-10">add_photo_alternate</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-purple-300 relative z-10">Initiate Data Upload</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              </div>
            ) : (
              <div className="space-y-6 animate-pop-in">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group/edit-img">
                  <img src={currentImage} className="w-full h-auto max-h-[350px] object-contain transition-transform duration-700 group-hover/edit-img:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/edit-img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button 
                      onClick={() => setCurrentImage(null)}
                      className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-red-500/80 transition-all hover:scale-110"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {activeTab === 'edit' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Edit Command</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. 'remove background'..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-purple-500/30 transition-all outline-none placeholder:text-gray-700"
                      />
                      <button 
                        onClick={() => editImage(prompt)}
                        className="px-6 bg-purple-600 rounded-xl font-bold text-xs uppercase tracking-widest text-white hover:bg-purple-500 transition-all active:scale-95 shadow-glow"
                      >
                        Apply
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Remove Background', 'Style Transfer', 'Upscale x2', 'Color Balance'].map((preset, idx) => (
                        <button 
                          key={preset}
                          onClick={() => editImage(preset)}
                          className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all animate-slide-up-fade"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analyze' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Caption', task: 'Generate a detailed caption for this image.' },
                        { label: 'OCR', task: 'Extract all text from this image and list it clearly.' },
                        { label: 'Objects', task: 'Detect and list all significant objects in this image.' },
                        { label: 'Scene', task: 'Describe the mood, lighting, and composition.' }
                      ].map((item, idx) => (
                        <button 
                          key={item.label}
                          onClick={() => analyzeImage(item.task)}
                          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-left flex items-center justify-between group animate-slide-up-fade"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          {item.label}
                          <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">neuroscience</span>
                        </button>
                      ))}
                    </div>
                    {analysisResult && (
                      <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-2 animate-pop-in shadow-inner">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-[16px] text-purple-400 animate-pulse">insights</span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-300">Neural Insights</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{analysisResult}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4 animate-slide-up-fade">
            {history.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <span className="material-symbols-outlined text-4xl mb-4">history</span>
                <p className="text-[10px] font-black uppercase tracking-widest">No visual history detected</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                {history.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="group relative rounded-xl overflow-hidden border border-white/5 bg-black/20 aspect-square animate-slide-up-fade"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                      <p className="text-[10px] text-white font-medium line-clamp-3 leading-relaxed">{item.prompt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{item.type}</span>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => { setResultImage(item.imageUrl); triggerHaptic(10); }}
                             className="p-1.5 bg-white/5 rounded-lg hover:bg-white/20 transition-all"
                           >
                             <span className="material-symbols-outlined text-[14px] text-white">preview</span>
                           </button>
                           <button 
                             onClick={() => { window.open(item.imageUrl, '_blank'); triggerHaptic(5); }}
                             className="p-1.5 bg-purple-500/20 rounded-lg hover:bg-purple-500/40 transition-all"
                           >
                             <span className="material-symbols-outlined text-[14px] text-white">open_in_new</span>
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-transparent relative">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[400px] flex-shrink-0 border-r border-white/5 bg-[#08090f]/80 backdrop-blur-3xl flex flex-col overflow-y-auto no-scrollbar relative z-20">
        <div className="p-8 space-y-8 flex-1">
          <header className="animate-slide-up-fade">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Vision <span className="text-gradient animate-text-gradient">Studio</span>
            </h2>
            <div className="flex items-center gap-3 mt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Neural Engine v4.0</p>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent"></div>
            </div>
          </header>

          <nav className="relative bg-[#0d0f17] rounded-2xl p-1 shadow-2xl animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
            {/* Sliding Tab Indicator */}
            <div 
                className="absolute top-1 bottom-1 bg-purple-600 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-glow"
                style={{
                    left: `${(tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length)) + 0.5}%`,
                    width: `${(100 / tabs.length) - 1}%`
                }}
            ></div>
            
            <div className="relative flex z-10">
                {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => { triggerHaptic(10); setActiveTab(tab.id as VisionTab); }}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
                ))}
            </div>
          </nav>

          <div className="relative min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>

        {/* Quota Indication */}
        <div className="p-8 border-t border-white/5 space-y-4 bg-black/20 animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Free Tier Usage</span>
            <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-gradient-to-r from-emerald-600 to-emerald-400 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
          </div>
          <p className="text-[8px] font-bold text-gray-700 leading-relaxed uppercase tracking-widest">
            Heliex uses Google AI Studio Free Tier. Generating visuals may take up to 30s depending on neural load.
          </p>
        </div>
      </div>

      {/* Main Preview Workspace */}
      <div className="flex-1 p-6 md:p-12 bg-transparent flex items-center justify-center relative overflow-hidden group">
        
        {/* Dynamic Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none animate-nebula-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_100%)] pointer-events-none"></div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-8 animate-pulse z-10 transition-all duration-700">
            <div className="relative">
              <div className="absolute -inset-12 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
              {/* Spinning Ring Animation */}
              <div className="absolute -inset-4 border-2 border-dashed border-purple-500/20 rounded-full animate-spin-slow"></div>
              <div className="absolute -inset-8 border border-white/5 rounded-full animate-spin-reverse-slow"></div>
              
              <div className="w-24 h-24 rounded-3xl bg-purple-500/10 flex items-center justify-center relative backdrop-blur-2xl border border-white/10">
                <span className="material-symbols-outlined text-5xl text-purple-400 animate-float-mascot">psychology</span>
              </div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] animate-pulse">Neural Synthesis</h3>
              <div className="flex items-center justify-center gap-2">
                 <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-purple-500/40"></div>
                 <p className="text-[10px] font-black text-gray-600 tracking-[0.4em] uppercase">Processing Quantum Data</p>
                 <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-purple-500/40"></div>
              </div>
            </div>
          </div>
        ) : resultImage ? (
          <div className="w-full max-w-3xl animate-pop-in z-10 space-y-8">
            <div className="relative group/result rounded-[2.5rem] overflow-hidden border border-white/10 shadow-cosmic-soft bg-black/40 ring-1 ring-white/5 p-2">
              <div className="relative rounded-[2.2rem] overflow-hidden">
                <img src={resultImage} className="w-full h-auto transition-transform duration-2000 group-hover/result:scale-105" />
                
                {/* Visual Scanning Effect on Entrance */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_rgba(168,85,247,1)] animate-[reveal_2s_ease-in-out_forwards] pointer-events-none opacity-0 group-hover/result:opacity-100"></div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/result:opacity-100 transition-opacity duration-700 p-10 flex flex-col justify-end">
                  <div className="flex gap-4 animate-slide-up-fade">
                    <button 
                      onClick={() => { setCurrentImage(resultImage); setActiveTab('edit'); triggerHaptic(10); }}
                      className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-purple-500/40 transition-all active:scale-95 group/btn"
                    >
                      <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:rotate-12">edit_note</span>
                      Modify in Studio
                    </button>
                    <a 
                      href={resultImage} 
                      download="heliex-vision.png"
                      className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-purple-500 transition-all active:scale-95 shadow-glow group/btn"
                    >
                      <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:-translate-y-1">download</span>
                      Export 2K Resolution
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 opacity-30 select-none animate-slide-up-fade" style={{ animationDelay: '500ms' }}>
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-white"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white">Synthesized Result</span>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-white"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-10 opacity-20 z-10 select-none animate-slide-up-fade">
             <div className="relative">
                <div className="absolute -inset-16 bg-white/5 rounded-full blur-[100px] animate-nebula-pulse"></div>
                <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/10 relative overflow-hidden group/canvas-placeholder">
                    <span className="material-symbols-outlined text-7xl text-white group-hover/canvas-placeholder:scale-110 transition-transform duration-1000">image_search</span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/canvas-placeholder:animate-shimmer"></div>
                </div>
             </div>
             <div className="text-center max-w-sm space-y-4">
               <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Neural Canvas</h3>
               <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-[0.25em]">Ready to manifest your concepts. Define a prompt or upload data to initiate the creative synthesis cycle.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionStudio;
