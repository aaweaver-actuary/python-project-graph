import type { GraphPayload, NodeKind } from './contracts';

export type GraphKindSelection = Record<NodeKind, boolean>;

export interface GraphFilterState {
  kindSelection: GraphKindSelection;
  moduleQuery: string;
  filePathQuery: string;
  hideDisconnected: boolean;
}

const DEFAULT_KIND_SELECTION: GraphKindSelection = {
  module: true,
  class: true,
  method: true,
  function: true,
  import: true,
  constant: true,
  variable: true,
  package: true,
};

export const DEFAULT_GRAPH_FILTER_STATE: GraphFilterState = {
  kindSelection: DEFAULT_KIND_SELECTION,
  moduleQuery: '',
  filePathQuery: '',
  hideDisconnected: false,
};

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

function hasConnectedEdge(
  nodeId: string,
  edges: GraphPayload['edges'],
): boolean {
  return edges.some((edge) => edge.source === nodeId || edge.target === nodeId);
}

export function applyGraphFilters(
  payload: GraphPayload,
  filterState: GraphFilterState,
): GraphPayload {
  const moduleQuery = normalizeQuery(filterState.moduleQuery);
  const filePathQuery = normalizeQuery(filterState.filePathQuery);

  const filteredNodes = payload.nodes.filter((node) => {
    if (!filterState.kindSelection[node.kind]) {
      return false;
    }

    if (moduleQuery.length > 0 && !node.module.toLowerCase().includes(moduleQuery)) {
      return false;
    }

    if (
      filePathQuery.length > 0 &&
      !node.file_path.toLowerCase().includes(filePathQuery)
    ) {
      return false;
    }

    return true;
  });

  const allowedNodeIds = new Set(filteredNodes.map((node) => node.id));

  const filteredEdges = payload.edges.filter(
    (edge) => allowedNodeIds.has(edge.source) && allowedNodeIds.has(edge.target),
  );

  if (!filterState.hideDisconnected) {
    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }

  const connectedNodes = filteredNodes.filter((node) =>
    hasConnectedEdge(node.id, filteredEdges),
  );


  return {
    nodes: connectedNodes,
    edges: filteredEdges,
  };
}
