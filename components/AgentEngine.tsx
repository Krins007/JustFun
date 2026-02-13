import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  Handle, 
  Position, 
  Connection, 
  Edge, 
  Node,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel,
  MarkerType,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import { WorkflowNodeData, WorkflowNodeType, WorkflowContext } from '../types';
import { GoogleGenAI } from "@google/genai";

const NodeContainer = ({ children, status, selected }: { children?: React.ReactNode, status: string, selected?: boolean }) => {
  const getStatusBorder = () => {
    if (status === 'processing') return 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] ring-2 ring-indigo-500/20';
    if (status === 'success') return 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    if (status === 'error') return 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    if (selected) return 'border-indigo-400 shadow-glow';
    return 'border-white/10';
  };

  return (
    <div className={`glass-panel w-64 rounded-3xl overflow-hidden border transition-all duration-500 ${getStatusBorder()}`}>
      {children}
    </div>
  );
};

const CustomNode = ({ id, data, selected }: { id: string, data: WorkflowNodeData, selected?: boolean }) => {
  const { setNodes } = useReactFlow();

  const handleConfigChange = (key: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              config: { ...node.data.config, [key]: value },
            },
          };
        }
        return node;
      })
    );
  };

  const getIcon = () => {
    switch (data.type) {
      case 'trigger': return 'bolt';
      case 'agent': return 'psychology';
      case 'tool': return 'construction';
      case 'memory': return 'database';
      case 'output': return 'output';
      default: return 'widgets';
    }
  };

  return (
    <NodeContainer status={data.status} selected={selected}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-[#0d101d]" />
      
      <div className="flex items-center gap-3 p-4 bg-white/[0.03] border-b border-white/5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 ${data.status === 'processing' ? 'animate-pulse' : ''}`}>
          <span className="material-symbols-outlined text-[18px] text-indigo-400">{getIcon()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white truncate">{data.label}</p>
          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter truncate">{data.subType || data.type}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {data.type === 'trigger' && (
          <textarea 
            className="w-full bg-black/20 border border-white/5 rounded-xl text-[10px] text-gray-400 p-2.5 h-16 resize-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder-gray-700 font-medium"
            placeholder="Define start sequence..."
            value={data.config.prompt || ''}
            onChange={(e) => handleConfigChange('prompt', e.target.value)}
          />
        )}
        
        {data.type === 'agent' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Processor</span>
              <span className="text-[9px] font-bold text-indigo-400">Flash 3.0</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full bg-indigo-500 transition-all duration-1000 ${data.status === 'processing' ? 'w-full' : (data.status === 'success' ? 'w-full' : 'w-0')}`}></div>
            </div>
          </div>
        )}

        {(data.status === 'success' || data.status === 'error') && (data.output || data.error) && (
          <div className={`mt-2 p-2 rounded-lg border text-[8px] font-mono break-all max-h-24 overflow-y-auto no-scrollbar ${data.status === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'}`}>
             {data.status === 'error' ? `Error: ${data.error}` : `Result: ${typeof data.output === 'string' ? data.output : JSON.stringify(data.output)}`}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-[#0d101d]" />
    </NodeContainer>
  );
};

const nodeTypes = {
  workflowNode: CustomNode,
};

const AgentEngineInner: React.FC = () => {
  const { setNodes: updateNodesState, getNodes, getEdges } = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'trigger-1',
      type: 'workflowNode',
      position: { x: 400, y: 50 },
      data: { label: 'User Intent', type: 'trigger', status: 'idle', config: { prompt: 'Analyze high-limit AI trends.' } },
    },
    {
      id: 'agent-1',
      type: 'workflowNode',
      position: { x: 400, y: 300 },
      data: { label: 'Flash Orchestrator', type: 'agent', status: 'idle', config: {} },
    },
    {
      id: 'tool-1',
      type: 'workflowNode',
      position: { x: 750, y: 300 },
      data: { label: 'Web Intelligence', type: 'tool', subType: 'Global Search', status: 'idle', config: {} },
    },
  ]);
  
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: 'trigger-1', target: 'agent-1', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } },
    { id: 'e2-3', source: 'agent-1', target: 'tool-1', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } },
  ]);

  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } }, eds)), [setEdges]);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg}`]);

  const executeNode = async (nodeId: string, currentContext: WorkflowContext): Promise<any> => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    const node = currentNodes.find(n => n.id === nodeId);
    if (!node) return;

    updateNodesState(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'processing' } } : n));
    addLog(`Initiating Sequence: [${node.data.label}]`);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let output: any = null;

    try {
      await new Promise(r => setTimeout(r, 800));

      const incomingEdges = currentEdges.filter(e => e.target === nodeId);
      const parentIds = incomingEdges.map(e => e.source);
      const parentDataPoints = parentIds.map(pid => currentContext.nodeOutputs[pid]).filter(Boolean);
      const specificInput = parentDataPoints.length > 0 ? parentDataPoints.join('\n---\n') : currentContext.globalInput;

      if (node.data.type === 'trigger') {
        output = node.data.config.prompt || 'No signal defined.';
      } else if (node.data.type === 'agent') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview', 
          contents: `Agent Task: ${specificInput}. Context: ${currentContext.globalInput}`,
          config: { 
            systemInstruction: "You are an autonomous Flash node. Execute the task precisely and concisely using the Flash reasoning model.",
            tools: [{ googleSearch: {} }]
          }
        });
        output = response.text;
      } else if (node.data.type === 'tool') {
        const searchResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Search retrieval sequence: ${specificInput}`,
            config: { tools: [{ googleSearch: {} }] }
        });
        output = searchResponse.text;
      } else if (node.data.type === 'output') {
        output = specificInput || 'Sequence terminal reached.';
      }

      updateNodesState(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'success', output } } : n));
      return output;
    } catch (err: any) {
      updateNodesState(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'error', error: err.message } } : n));
      addLog(`Critical Failure at [${node.data.label}]: ${err.message}`);
      throw err;
    }
  };

  const runWorkflow = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setLogs([]);
    addLog("--- SYSTEM BOOT: FLASH CORE ---");

    try {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const triggerNode = currentNodes.find(n => n.data.type === 'trigger');
      if (!triggerNode) throw new Error("Trigger missing.");

      updateNodesState(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', output: null, error: null } })));

      let currentContext: WorkflowContext = { memory: {}, nodeOutputs: {}, globalInput: '' };
      const triggerOutput = await executeNode(triggerNode.id, currentContext);
      currentContext.globalInput = triggerOutput;
      currentContext.nodeOutputs[triggerNode.id] = triggerOutput;

      const processed = new Set<string>([triggerNode.id]);
      const executeDownstream = async (sourceId: string) => {
        const downstreamEdges = currentEdges.filter(e => e.source === sourceId);
        for (const edge of downstreamEdges) {
          if (!processed.has(edge.target)) {
            const out = await executeNode(edge.target, currentContext);
            currentContext.nodeOutputs[edge.target] = out;
            processed.add(edge.target);
            await executeDownstream(edge.target);
          }
        }
      };
      await executeDownstream(triggerNode.id);
      addLog("--- FLOW SYNCHRONIZED ---");
    } catch (err) {
      addLog("--- FLOW INTERRUPTED ---");
    } finally {
      setIsExecuting(false);
    }
  };

  const addNode = (type: WorkflowNodeType, subType?: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'workflowNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: subType || `Node ${type.toUpperCase()}`, 
        type, 
        subType, 
        status: 'idle', 
        config: {} 
      },
    };
    updateNodesState(nds => nds.concat(newNode));
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent animate-slide-up-fade relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-[#0d101d]/90 backdrop-blur-3xl rounded-2xl border border-white/5 shadow-2xl">
          <button onClick={() => addNode('agent')} className="px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest">Agent</button>
          <button onClick={() => addNode('tool', 'Search')} className="px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tool</button>
          <button onClick={() => addNode('output', 'Terminal')} className="px-4 py-2 hover:bg-white/5 rounded-xl text-[10px] font-black text-orange-400 uppercase tracking-widest">Output</button>
        </div>
        <button onClick={runWorkflow} disabled={isExecuting} className="bg-indigo-600 px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-glow">
          {isExecuting ? 'Deploying...' : 'Initiate Sequence'}
        </button>
      </div>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView>
        <Background color="rgba(99, 102, 241, 0.05)" variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>
      <div className="absolute bottom-6 left-6 w-80 glass-panel rounded-3xl p-5 border border-white/5 shadow-cosmic-soft">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3">Core Telemetry</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
          {logs.map((log, i) => (
            <p key={i} className="text-[9px] text-gray-400 font-mono">{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

const AgentEngine: React.FC = () => (
  <ReactFlowProvider>
    <AgentEngineInner />
  </ReactFlowProvider>
);

export default AgentEngine;