export type NodeKind =
  | 'module'
  | 'class'
  | 'method'
  | 'function'
  | 'import'
  | 'constant'
  | 'variable'
  | 'package'

export type EdgeKind =
  | 'dependency'
  | 'imports'
  | 'inherits'
  | 'calls'
  | 'contains'
  | 'references'

export interface GraphNode {
  id: string
  kind: NodeKind
  name: string
  module: string
  file_path: string
  line_start?: number
  line_end?: number
  docstring?: string
  topological_rank?: number
}

export interface GraphEdge {
  source: string
  target: string
  kind: EdgeKind
}

export interface GraphPayload {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphValidationResult {
  ok: boolean
  errors: string[]
}

export interface GraphValidator {
  validate(payload: GraphPayload): GraphValidationResult
}