import { describe, expect, it } from "vitest";

import type { GraphPayload } from "./contracts";
import { graphValidator } from "./validator.ts";

describe("GraphValidator missing node references", () => {
  it("rejects an edge when source node id is missing from nodes list", () => {
    const missingSourceId = "module.utils.missing_source";
    const expectedMissingSourceError = `Missing source node reference: ${missingSourceId}`;

    const payload: GraphPayload = {
      nodes: [
        {
          id: "module.pipeline.run_model",
          kind: "function",
          name: "run_model",
          module: "module.pipeline",
          file_path: "src/module/pipeline.py",
        },
      ],
      edges: [
        {
          source: missingSourceId,
          target: "module.pipeline.run_model",
          kind: "dependency",
        },
      ],
    };

    const result = graphValidator.validate(payload);

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([expectedMissingSourceError]);
  });

  it("rejects an edge when target node id is missing from nodes list", () => {
    const missingTargetId = "module.pipeline.missing_target";
    const expectedMissingTargetError = `Missing target node reference: ${missingTargetId}`;

    const payload: GraphPayload = {
      nodes: [
        {
          id: "module.utils.parse_config",
          kind: "function",
          name: "parse_config",
          module: "module.utils",
          file_path: "src/module/utils.py",
        },
      ],
      edges: [
        {
          source: "module.utils.parse_config",
          target: missingTargetId,
          kind: "dependency",
        },
      ],
    };

    const result = graphValidator.validate(payload);

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([expectedMissingTargetError]);
  });
});
