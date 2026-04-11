import type { GraphPayload } from "./contracts";
import type { GraphDataSource } from "./bootstrap.contracts";

export const graphFixturePayload: GraphPayload = {
  nodes: [
    {
      id: "module.utils",
      kind: "module",
      name: "utils",
      module: "module.utils",
      file_path: "src/module/utils.py",
    },
    {
      id: "module.utils.parse_config",
      kind: "function",
      name: "parse_config",
      module: "module.utils",
      file_path: "src/module/utils.py",
      line_start: 42,
      line_end: 68,
    },
    {
      id: "module.pipeline",
      kind: "module",
      name: "pipeline",
      module: "module.pipeline",
      file_path: "src/module/pipeline.py",
    },
    {
      id: "module.pipeline.run_model",
      kind: "function",
      name: "run_model",
      module: "module.pipeline",
      file_path: "src/module/pipeline.py",
      line_start: 10,
      line_end: 30,
    },
  ],
  edges: [
    {
      source: "module.utils",
      target: "module.utils.parse_config",
      kind: "contains",
    },
    {
      source: "module.pipeline",
      target: "module.pipeline.run_model",
      kind: "contains",
    },
    {
      source: "module.utils.parse_config",
      target: "module.pipeline.run_model",
      kind: "dependency",
    },
    {
      source: "module.utils",
      target: "module.pipeline",
      kind: "imports",
    },
  ],
};

const cloneGraphPayload = (payload: GraphPayload): GraphPayload => ({
  nodes: payload.nodes.map((node) => ({ ...node })),
  edges: payload.edges.map((edge) => ({ ...edge })),
});

const graphFixturePayloadBaseline = cloneGraphPayload(graphFixturePayload);

export const fixtureGraphDataSource: GraphDataSource = {
  loadGraph: (): Promise<GraphPayload> =>
    Promise.resolve(cloneGraphPayload(graphFixturePayloadBaseline)),
};
