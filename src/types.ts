export type NodeColorTheme = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'slate';

export type NodeStatus = 'idea' | 'in-progress' | 'completed' | 'blocked';
export type NodePriority = 'low' | 'medium' | 'high';

export interface ThoughtNode {
  id: string;
  title: string;
  notes?: string;
  parentId: string | null;
  x: number;
  y: number;
  color: NodeColorTheme;
  icon?: string;
  isCollapsed?: boolean;
  tags?: string[];
  priority?: NodePriority;
  status?: NodeStatus;
  createdAt: number;
  updatedAt: number;
}

export interface WeaveConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  style?: 'curved' | 'dashed' | 'dotted';
  color?: string;
}

export interface LoomindData {
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, ThoughtNode>;
  weaves: WeaveConnection[];
  createdAt: number;
  updatedAt: number;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export type CanvasMode = 'select' | 'pan' | 'weave' | 'add';

export interface DraggingState {
  nodeId: string;
  startX: number;
  startY: number;
  initialNodeX: number;
  initialNodeY: number;
}
