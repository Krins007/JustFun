export type ChatMode = 'chat' | 'research' | 'agents' | 'projects' | 'data' | 'creative' | 'code' | 'web' | 'doc' | 'coffee' | 'superfast';

export interface NavItem {
  icon: string;
  label: string;
  id: ChatMode;
  badge?: boolean;
  color?: string;
  isLibrary?: boolean;
}

export interface RecentItem {
  title: string;
}

export interface FeaturedTool {
  icon: string;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  id: ChatMode;
}

export interface ActionButton {
  icon: string;
  label: string;
  colorClass: string;
  delay: string;
  actionPayload?: string;
  targetMode?: ChatMode;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  isStreaming?: boolean;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
}

export interface TerminalLog {
    type: 'log' | 'error' | 'warn' | 'info' | 'result';
    content: string;
    timestamp: string;
}

export interface AttachedFile {
  id: string;
  file: File;
  type: 'image' | 'file';
  preview?: string;
}

// --- Workflow Engine Types ---

export type WorkflowNodeType = 'trigger' | 'agent' | 'tool' | 'logic' | 'output' | 'memory';

export interface WorkflowNodeData {
  label: string;
  type: WorkflowNodeType;
  subType?: string; // e.g., 'googleSearch', 'calculator'
  status: 'idle' | 'processing' | 'success' | 'error';
  config: Record<string, any>;
  output?: any;
  error?: string;
}

export interface WorkflowExecutionResult {
  nodeId: string;
  output: any;
  logs: string[];
}

export interface WorkflowContext {
  memory: Record<string, any>;
  nodeOutputs: Record<string, any>;
  globalInput: string;
}
