
import React, { useState, useRef, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";

type VisionTab = 'trending' | 'generate' | 'edit' | 'analyze';

interface Tool {
  name: string;
  description: string;
  icon: string;
  prompt: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  tools: Tool[];
}

const VisionStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VisionTab>('trending');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('photorealistic');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: Category[] = useMemo(() => [
    {
      id: 'viral-styles',
      name: 'Viral Styles',
      description: 'Anime, Ghibli & Pixar',
      icon: 'auto_fix_high',
      gradient: 'from-indigo-600 to-blue-700',
      tools: [
        { name: 'Ghibli Magic', color: 'text-emerald-400', description: 'Watercolor anime style', icon: 'forest', prompt: 'Transform into Studio Ghibli anime style. Soft watercolor textures, hand-painted backgrounds, warm lighting, whimsical atmosphere, 1990s anime cel shading.' },
        { name: 'Makoto Shinkai', color: 'text-blue-400', description: 'Dramatic skies & lighting', icon: 'cloud', prompt: 'Convert to Makoto Shinkai style. Hyper-detailed skies, dramatic lighting, urban landscapes, emotional atmosphere, vibrant color grading.' },
        { name: 'Claymation', color: 'text-orange-400', description: '3D stop-motion aesthetic', icon: 'interests', prompt: 'Transform into claymation style. Aardman Animation aesthetic, fingerprint textures on clay, stop-motion lighting, physical miniature sets.' },
        { name: 'Pixar 3D', color: 'text-pink-400', description: 'Professional CGI render', icon: 'movie_filter', prompt: 'Convert to Pixar 3D animation style. Subsurface scattering skin, exaggerated proportions, big expressive eyes, physically-based rendering, Toy Story aesthetic.' }
      ]
    },
    {
      id: 'retro-lab',
      name: 'Retro Lab',
      description: 'Nostalgic film stock',
      icon: 'camera_roll',
      gradient: 'from-amber-600 to-orange-700',
      tools: [
        { name: '80s Synthwave', color: 'text-fuchsia-400', description: 'Neon grid aesthetics', icon: 'grid_view', prompt: 'Transform into 1980s synthwave aesthetic. Neon pink and cyan grid lines, sunset gradients, chrome reflections, retro futuristic.' },
        { name: '90s Grunge', color: 'text-stone-400', description: 'Film grain & textures', icon: 'grain', prompt: 'Apply 90s grunge aesthetic. Film grain, muted colors, distressed textures, photocopied look, zine aesthetic.' },
        { name: 'Kodak Portra', color: 'text-yellow-400', description: 'Classic film stock', icon: 'photo_camera', prompt: 'Apply Kodak Portra 400 characteristics. Warm skin tones, soft grain, pastel colors, authentic film structure.' },
        { name: 'VHS Damage', color: 'text-purple-400', description: 'Analog degradation', icon: 'videocam_off', prompt: 'Apply VHS tracking error lines and chrominance noise. Analog video degradation, 1980s consumer camcorder aesthetic.' }
      ]
    },
    {
      id: 'portrait-hub',
      name: 'Portrait Hub',
      description: 'Yearbook & Age effects',
      icon: 'face_retouching_natural',
      gradient: 'from-purple-600 to-pink-700',
      tools: [
        { name: '90s Yearbook', color: 'text-blue-300', description: 'Viral school photo trend', icon: 'school', prompt: 'Transform into 1990s American high school yearbook photo. Blue banner background, soft studio lighting, feathered hair, vintage photo quality.' },
        { name: 'Age Transformer', color: 'text-gray-300', description: 'Age progression/regression', icon: 'history', prompt: 'Elder vision aging effect. Wrinkles, gray hair, wise expression, time passage, dignified aging.' },
        { name: 'Na\'vi Avatar', color: 'text-cyan-400', description: 'Pandora tribal look', icon: 'nature_people', prompt: 'Transform into Avatar movie Na\'vi. Blue skin, bioluminescent spots, large yellow eyes, cat-like features, tribal markings.' },
        { name: 'Bold Glamour', color: 'text-rose-400', description: 'Beauty enhancement', icon: 'sparkles', prompt: 'Apply professional beauty retouching. Skin smoothing, eye brightening, subtle face sculpting, maintain natural texture.' }
      ]
    },
    {
      id: 'background',
      name: 'BG Magic',
      description: 'Sky swap & expansion',
      icon: 'wallpaper',
      gradient: 'from-cyan-600 to-teal-700',
      tools: [
        { name: 'Golden Hour', color: 'text-orange-300', description: 'Sunset lighting match', icon: 'wb_sunny', prompt: 'Swap sky to golden hour sunset. Warm orange and pink tones, long shadows, adjust foreground lighting to match.' },
        { name: 'Season Shifter', color: 'text-blue-100', description: 'Spring to Winter', icon: 'ac_unit', prompt: 'Transform to winter wonderland. Snow coverage, bare branches, cool blue lighting, snowflakes, cozy atmosphere.' },
        { name: 'Infinite Zoom', color: 'text-indigo-300', description: 'AI outpainting', icon: 'zoom_out_map', prompt: 'Expand canvas by 200% in all directions. Generate coherent extension matching original style and perspective.' },
        { name: 'Tourist Remover', color: 'text-red-300', description: 'Clean landmark shots', icon: 'person_remove', prompt: 'Remove all people and moving objects from scene. Reconstruct background naturally using surrounding context.' }
      ]
    }
  ], []);

  const handle429Error = async () => {
    // If we hit 429, it means the shared key is exhausted.
    // Offer the user to use their own key (which has a separate free quota).
    const confirmed = window.confirm("Rate limit reached on shared key. Would you like to use your own personal API key for higher individual limits? (Free-tier projects are supported)");
    if (confirmed) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  const initiateAction = (mode: 'generate' | 'edit') => {
    if (!selectedTool) return;
    setPrompt(selectedTool.prompt);
    setActiveTab(mode);
    if (mode === 'edit' && !currentImage) {
      fileInputRef.current?.click();
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResultImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const config: any = {
        imageConfig: { 
          aspectRatio: aspectRatio as any
        }
      };

      let response;
      const modelName = 'gemini-2.5-flash-image';

      if (activeTab === 'edit' && currentImage) {
        const base64Data = currentImage.split(',')[1];
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: 'image/png' } },
              { text: prompt }
            ],
          },
          config
        });
      } else {
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [{ text: `${prompt}. Style: ${style}.` }],
          },
          config
        });
      }

      const parts = response.candidates?.[0]?.content.parts || [];
      const imgPart = parts.find(p => p.inlineData);
      if (imgPart?.inlineData) {
        setResultImage(`data:image/png;base64,${imgPart.inlineData.data}`);
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || "";
      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        await handle429Error();
      }
      setAnalysisResult(`Synthesis failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCurrentImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (task: string) => {
    if (!currentImage) return;
    setIsLoading(true);
    setAnalysisResult('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = currentImage.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest', // Use Lite for higher limits on text analysis
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: task }
          ],
        },
        config: {
          systemInstruction: "Analyze visual stream with high precision and brevity."
        }
      });
      setAnalysisResult(response.text || "No insights found.");
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        await handle429Error();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-transparent relative overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[420px] flex-shrink-0 border-r border-white/5 bg-[#08090f]/90 backdrop-blur-3xl p-6 flex flex-col gap-6 z-20 overflow-y-auto no-scrollbar">
        <header className="animate-pop-in flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-vibrant-indigo">
              <span className="material-symbols-outlined text-white text-[20px]">local_cafe</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Vision <span className="text-gradient">Studio</span></h2>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 ml-1">Architect v4.6 // High-Limit Flash</p>
            <button onClick={() => (window as any).aistudio.openSelectKey()} className="text-[8px] font-black text-indigo-400/60 hover:text-indigo-400 uppercase tracking-widest transition-all">Select Personal Key</button>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="flex gap-1 p-1.5 bg-[#0d0f17] rounded-2xl relative overflow-hidden border border-white/5 animate-slide-up-fade" style={{ animationDelay: '0.1s' }}>
          {(['trending', 'generate', 'edit', 'analyze'] as VisionTab[]).map(tab => (
            <button 
              key={tab} 
              onClick={() => {
                setActiveTab(tab);
                if (tab !== 'trending') {
                    setSelectedTool(null);
                    setSelectedCategory(null);
                }
              }} 
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 z-10 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-glow' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 transition-all duration-500 min-h-0">
          {activeTab === 'trending' ? (
            <div className="space-y-6 animate-reveal h-full flex flex-col">
              {!selectedCategory ? (
                <div className="grid grid-cols-1 gap-3.5 staggered-list">
                  {categories.map((cat, i) => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat)}
                      style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                      className="group relative h-28 overflow-hidden rounded-[1.8rem] border border-white/5 transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-700`}></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] opacity-40"></div>
                      <div className="relative h-full flex items-center gap-5 px-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <span className="material-symbols-outlined text-[32px]">{cat.icon}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[13px] font-black uppercase text-white tracking-[0.15em] group-hover:tracking-[0.2em] transition-all">{cat.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-medium">{cat.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !selectedTool ? (
                <div className="space-y-5 animate-spring-in">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors group">
                      <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Hub
                    </button>
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em]">{selectedCategory.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 staggered-list">
                    {selectedCategory.tools.map((tool, i) => (
                      <button 
                        key={tool.name} 
                        onClick={() => setSelectedTool(tool)}
                        style={{ animationDelay: `${i * 0.05}s` }}
                        className="group flex flex-col gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] hover:border-white/10 transition-all text-left relative overflow-hidden"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${tool.color} group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                          <span className="material-symbols-outlined text-[24px]">{tool.icon}</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white leading-tight uppercase tracking-wider">{tool.name}</p>
                          <p className="text-[9px] text-gray-500 mt-1 leading-relaxed opacity-80">{tool.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-reveal h-full flex flex-col">
                   <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedTool(null)} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors group">
                      <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Tools
                    </button>
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Neural Sequence Ready</span>
                  </div>

                  <div className="flex flex-col gap-4 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                         <span className={`material-symbols-outlined text-[100px] ${selectedTool.color}`}>{selectedTool.icon}</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedTool.name}</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{selectedTool.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 flex-1">
                     <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] ml-2">Choose Synthesis Method</p>
                     
                     <button 
                        onClick={() => initiateAction('generate')}
                        className="group relative flex items-center gap-5 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-500 text-left"
                     >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:shadow-glow transition-all">
                             <span className="material-symbols-outlined text-[32px]">edit_note</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[13px] font-black text-white uppercase tracking-wider">Neural Synthesis</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Generate brand new image from prompt</p>
                        </div>
                     </button>

                     <button 
                        onClick={() => initiateAction('edit')}
                        className="group relative flex items-center gap-5 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-500 text-left"
                     >
                        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:shadow-glow transition-all">
                             <span className="material-symbols-outlined text-[32px]">image_search</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[13px] font-black text-white uppercase tracking-wider">Style Transformation</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Apply viral style to your own photo</p>
                        </div>
                     </button>
                  </div>
                </div>
              )}
            </div>
          ) : (activeTab === 'generate' || activeTab === 'edit') ? (
            <div className="space-y-6 animate-spring-in">
              {activeTab === 'edit' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Source Artifact</p>
                    {currentImage && <button onClick={() => setCurrentImage(null)} className="text-[9px] font-black text-red-500 uppercase">Clear</button>}
                  </div>
                  {!currentImage ? (
                    <div onClick={() => fileInputRef.current?.click()} className="group h-44 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all duration-500">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600 group-hover:scale-110 group-hover:text-indigo-400 transition-all">
                        <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300">Upload Data Frame</p>
                      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </div>
                  ) : (
                    <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-lg h-44 animate-pop-in">
                      <img src={currentImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                         <span className="text-[9px] font-black text-white uppercase tracking-widest opacity-80">Reference Buffer Active</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Synthesis Logic</p>
                <div className="relative">
                  <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder="Input descriptive sequence..." 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white text-xs h-28 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all hover:bg-white/[0.06] no-scrollbar placeholder-gray-700" 
                  />
                  <div className="absolute bottom-3 right-3 text-[8px] font-black text-gray-700 tracking-tighter uppercase">{prompt.length} CHR</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 ml-1">Composition</p>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-[#0d0f17] border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none hover:border-white/20 transition-all appearance-none">
                    <option value="1:1">Standard 1:1</option>
                    <option value="16:9">Wide 16:9</option>
                    <option value="9:16">Portrait 9:16</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 ml-1">Visual Core</p>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-[#0d0f17] border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none hover:border-white/20 transition-all appearance-none">
                    <option value="photorealistic">Hyper Realistic</option>
                    <option value="anime">Celestial Anime</option>
                    <option value="digital-art">Unreal Render</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={generateImage} 
                disabled={isLoading || !prompt} 
                className={`w-full py-4 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-super-glow transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group overflow-hidden relative ${isLoading ? 'animate-pulse' : 'hover:bg-indigo-500 hover:scale-[1.02]'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">{isLoading ? 'Processing Neural Sequence...' : (activeTab === 'edit' ? 'Modify Result' : 'Initiate Synthesis')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-spring-in">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Target Buffer</p>
              {!currentImage ? (
                <div onClick={() => fileInputRef.current?.click()} className="group h-64 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all duration-500">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gray-600 group-hover:scale-110 group-hover:text-indigo-400 group-hover:rotate-12 transition-all">
                    <span className="material-symbols-outlined text-[48px]">scan</span>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300">Analyze Visual Stream</p>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/10 shadow-xl animate-pop-in">
                    <img src={currentImage} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <button onClick={() => setCurrentImage(null)} className="absolute top-4 right-4 p-2 bg-red-500/80 rounded-full text-white hover:scale-110 active:scale-90 transition-all shadow-lg"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button onClick={() => analyzeImage("Describe the subject and style in extreme detail.")} className="py-3.5 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm">Extract Insight</button>
                    <button onClick={() => analyzeImage("Identify colors, lighting style and technical metadata.")} className="py-3.5 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm">Technical Scan</button>
                  </div>
                  {analysisResult && (
                    <div className="p-5 bg-[#0d0f17] rounded-[1.8rem] border border-indigo-500/10 text-[11px] text-indigo-100 leading-relaxed animate-reveal shadow-lg">
                      <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                         <span className="material-symbols-outlined text-[16px] text-indigo-400">psychology</span>
                         <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Neural Logic Report</span>
                      </div>
                      {analysisResult}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 p-8 md:p-14 bg-[#020408]/60 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)] pointer-events-none animate-neural-pulse"></div>
        
        {resultImage ? (
          <div className="max-w-5xl w-full animate-reveal relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-cosmic-soft group-hover:scale-[1.015] transition-transform duration-1000 cursor-zoom-in">
              <img src={resultImage} className="w-full h-auto" alt="AI Generated Artifact" />
              <div className="absolute bottom-10 right-10 flex gap-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                <a 
                  href={resultImage} 
                  download="heliex_vision.png" 
                  className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-110 active:scale-90 transition-all shadow-2xl"
                >
                  <span className="material-symbols-outlined text-[28px]">download</span>
                </a>
                <button 
                  onClick={() => { setCurrentImage(resultImage); setActiveTab('edit'); }} 
                  className="w-14 h-14 bg-indigo-600 rounded-2xl text-white flex items-center justify-center hover:bg-indigo-500 hover:scale-110 active:scale-90 transition-all shadow-2xl shadow-indigo-500/20"
                >
                  <span className="material-symbols-outlined text-[28px]">edit_note</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center opacity-10 animate-float-mascot max-w-sm flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center mb-8 relative">
              <span className="material-symbols-outlined text-[80px] text-white">camera</span>
              <div className="absolute inset-0 rounded-full border border-indigo-500/40 animate-spin-slow"></div>
              <div className="absolute inset-2 rounded-full border border-purple-500/20 animate-spin-reverse-slow"></div>
            </div>
            <p className="text-lg font-black uppercase tracking-[0.5em] text-white leading-tight">Neural Nexus<br/><span className="text-sm opacity-60">Ready for Buffer</span></p>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-[#020408]/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-reveal">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-2 border-purple-500/10 border-b-purple-500 rounded-full animate-spin-reverse-slow"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-400 animate-pulse">neurology</span>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center gap-2">
              <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Synthesizing Sequence</p>
              <div className="w-48 h-[2px] bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-shimmer w-full"></div>
              </div>
              <p className="text-[10px] font-bold text-gray-500 mt-4">Flash Diffusion Core Active...</p>
              <p className="text-[8px] text-indigo-400/50 uppercase tracking-widest mt-2">Free High-Limit Tier</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionStudio;
