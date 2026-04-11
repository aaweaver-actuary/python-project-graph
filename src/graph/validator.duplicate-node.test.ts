import { describe, expect, it } from "vitest";

import type { GraphPayload } from "./contracts";
import { graphValidator } from "./validator.ts";

describe("GraphValidator duplicate node ids", () => {
  it("rejects payload when one node id appears twice", () => {
    const duplicatedId = "module.utils.parse_config";

    const payload: GraphPayload = {
      nodes: [
        {
          id: duplicatedId,
          kind: "function",
          name: "parse_config",
          module: "module.utils",
          file_path: "src/module/utils.py",
        },
        {
          id: duplicatedId,
          kind: "function",
          name: "parse_config_duplicate",
          module: "module.utils",
          file_path: "src/module/utils.py",
        },
      ],
      edges: [],
    };

    const result = graphValidator.validate(payload);

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Duplicate node id:");
    expect(result.errors[0]).toContain(duplicatedId);
  });

  it("rejects payload with one error per distinct duplicated node id", () => {
    const duplicatedIdA = "module.pipeline.run_model";
    const duplicatedIdB = "module.utils.parse_config";

    const payload: GraphPayload = {
      nodes: [
        {
          id: duplicatedIdA,
          kind: "function",
          name: "run_model",
          module: "module.pipeline",
          file_path: "src/module/pipeline.py",
        },
        {
          id: duplicatedIdA,
          kind: "function",
          name: "run_model_duplicate",
          module: "module.pipeline",
          file_path: "src/module/pipeline.py",
        },
        {
          id: duplicatedIdB,
          kind: "function",
          name: "parse_config",
          module: "module.utils",
          file_path: "src/module/utils.py",
        },
        {
          id: duplicatedIdB,
          kind: "function",
          name: "parse_config_duplicate",
          module: "module.utils",
          file_path: "src/module/utils.py",
        },
      ],
      edges: [],
    };

    const result = graphValidator.validate(payload);

    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(2);

    const duplicateIdErrors = result.errors.filter((errorMessage) =>
      errorMessage.startsWith("Duplicate node id:"),
    );

    expect(duplicateIdErrors).toHaveLength(2);
    expect(
      duplicateIdErrors.some((errorMessage) =>
        errorMessage.includes(duplicatedIdA),
      ),
    ).toBe(true);
    expect(
      duplicateIdErrors.some((errorMessage) =>
        errorMessage.includes(duplicatedIdB),
      ),
    ).toBe(true);
  });
});
