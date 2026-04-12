// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";

import type { GraphPayload } from "./contracts";
import { graphFixturePayload } from "./fixture-data-source.adapter";
import {
  DetailPanel,
  deriveSelectedNodeDetails,
  type NodeDetails,
} from "./node-details";

interface NodeDetailsContract {
  id: string;
  name: string;
  kind: GraphPayload["nodes"][number]["kind"];
  module: string;
  file_path: string;
  line_start?: number;
  line_end?: number;
  inboundCount: number;
  outboundCount: number;
}

type DeriveSelectedNodeDetailsContract = (
  payload: GraphPayload,
  selectedNodeId: string | null,
) => NodeDetailsContract | null;

describe("node details derivation", () => {
  it("enforces deriveSelectedNodeDetails signature at compile-time", () => {
    expectTypeOf<
      typeof deriveSelectedNodeDetails
    >().toEqualTypeOf<DeriveSelectedNodeDetailsContract>();
  });

  it("returns null when selectedNodeId is null", () => {
    expect(deriveSelectedNodeDetails(graphFixturePayload, null)).toBeNull();
  });

  it("returns null when selectedNodeId is not found in payload", () => {
    expect(
      deriveSelectedNodeDetails(graphFixturePayload, "module.missing"),
    ).toBeNull();
  });

  it("derives parse_config details with symmetric inbound/outbound counts and line range", () => {
    const details = deriveSelectedNodeDetails(
      graphFixturePayload,
      "module.utils.parse_config",
    );

    expect(details).not.toBeNull();

    if (details === null) {
      expect.unreachable("expected selected node details for parse_config");
    }

    expect(details.id).toBe("module.utils.parse_config");
    expect(details.name).toBe("parse_config");
    expect(details.kind).toBe("function");
    expect(details.module).toBe("module.utils");
    expect(details.file_path).toBe("src/module/utils.py");
    expect(details.line_start).toBe(42);
    expect(details.line_end).toBe(68);
    expect(details.inboundCount).toBe(1);
    expect(details.outboundCount).toBe(1);
  });

  it("derives module.utils details with asymmetric counts and absent line range", () => {
    const details = deriveSelectedNodeDetails(
      graphFixturePayload,
      "module.utils",
    );

    expect(details).not.toBeNull();

    if (details === null) {
      expect.unreachable("expected selected node details for module.utils");
    }

    expect(details.id).toBe("module.utils");
    expect(details.name).toBe("utils");
    expect(details.kind).toBe("module");
    expect(details.module).toBe("module.utils");
    expect(details.file_path).toBe("src/module/utils.py");
    expect(details.line_start).toBeUndefined();
    expect(details.line_end).toBeUndefined();
    expect(details.inboundCount).toBe(0);
    expect(details.outboundCount).toBe(2);
  });

  it("renders ?-end when details has line_end without line_start", () => {
    const details: NodeDetails = {
      id: "module.partial.fn",
      name: "partial_fn",
      kind: "function",
      module: "module.partial",
      file_path: "src/module/partial.py",
      line_end: 27,
      inboundCount: 1,
      outboundCount: 0,
    };

    render(createElement(DetailPanel, { details }));

    expect(screen.getByTestId("detail-line-range").textContent).toBe("?-27");
  });
});
