import { describe, expect, it } from "vitest";

import type { GraphPayload } from "./contracts";
import { graphValidator } from "./validator.ts";

describe("GraphValidator missing node references", () => {
  it("rejects an edge when source node id is missing from nodes list", () => {
    const missingSourceId = "module.utils.missing_source";
    const expectedError = `Missing source node reference: ${missingSourceId}`;

    const graphPayload: GraphPayload = {
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

    const validationResult = graphValidator.validate(graphPayload);

    expect(validationResult.ok).toBe(false);
    expect(validationResult.errors).toEqual([expectedError]);
  });

  it("rejects an edge when target node id is missing from nodes list", () => {
    const missingTargetId = "module.pipeline.missing_target";
    const expectedError = `Missing target node reference: ${missingTargetId}`;

    const graphPayload: GraphPayload = {
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

    const validationResult = graphValidator.validate(graphPayload);

    expect(validationResult.ok).toBe(false);
    expect(validationResult.errors).toEqual([expectedError]);
  });
});
