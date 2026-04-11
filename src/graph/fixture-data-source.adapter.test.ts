import { describe, expect, it } from "vitest";

import type { GraphPayload } from "./contracts";
import type { GraphDataSource } from "./bootstrap.contracts";
import { graphValidator } from "./validator";

interface FixtureDataSourceAdapterModule {
  fixtureGraphDataSource: GraphDataSource;
  graphFixturePayload: GraphPayload;
}

const loadFixtureDataSourceAdapter =
  async (): Promise<FixtureDataSourceAdapterModule> =>
    (await import("./fixture-data-source.adapter")) as FixtureDataSourceAdapterModule;

const cloneGraphPayload = (payload: GraphPayload): GraphPayload => ({
  nodes: payload.nodes.map((node) => ({ ...node })),
  edges: payload.edges.map((edge) => ({ ...edge })),
});

describe("fixture-backed GraphDataSource adapter", () => {
  it("returns a runtime Promise<GraphPayload> from loadGraph", async () => {
    const { fixtureGraphDataSource, graphFixturePayload } =
      await loadFixtureDataSourceAdapter();

    const loadGraphPromise = fixtureGraphDataSource.loadGraph();

    expect(loadGraphPromise).toBeInstanceOf(Promise);
    expect(Promise.resolve(loadGraphPromise)).toBe(loadGraphPromise);

    const payload = await loadGraphPromise;

    expect(payload).toEqual(graphFixturePayload);
  });

  it("resolves fixture payload with exactly 4 nodes and 4 edges", async () => {
    const { fixtureGraphDataSource, graphFixturePayload } =
      await loadFixtureDataSourceAdapter();

    const payload = await fixtureGraphDataSource.loadGraph();

    expect(payload.nodes).toHaveLength(4);
    expect(payload.edges).toHaveLength(4);
    expect(payload).toEqual(graphFixturePayload);
  });

  it("returns a payload that validates successfully with graphValidator", async () => {
    const { fixtureGraphDataSource } = await loadFixtureDataSourceAdapter();

    const payload = await fixtureGraphDataSource.loadGraph();
    const validation = graphValidator.validate(payload);

    expect(validation.ok).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("is deterministic across repeated loadGraph calls", async () => {
    const { fixtureGraphDataSource, graphFixturePayload } =
      await loadFixtureDataSourceAdapter();

    const firstPayload = await fixtureGraphDataSource.loadGraph();
    const secondPayload = await fixtureGraphDataSource.loadGraph();

    expect(firstPayload).not.toBe(secondPayload);
    expect(firstPayload.nodes).not.toBe(secondPayload.nodes);
    expect(firstPayload.edges).not.toBe(secondPayload.edges);
    expect(firstPayload).toEqual(secondPayload);
    expect(firstPayload).toEqual(graphFixturePayload);
    expect(secondPayload).toEqual(graphFixturePayload);
  });

  it("preserves the baseline when an earlier loadGraph payload is mutated", async () => {
    const { fixtureGraphDataSource, graphFixturePayload } =
      await loadFixtureDataSourceAdapter();
    const baselinePayload = cloneGraphPayload(graphFixturePayload);

    const firstPayload = await fixtureGraphDataSource.loadGraph();
    const firstNode = firstPayload.nodes.at(0);
    const firstEdge = firstPayload.edges.at(0);

    if (!firstNode || !firstEdge) {
      throw new Error(
        "fixture payload must include at least one node and edge",
      );
    }

    firstNode.name = "mutated_node_name";
    firstEdge.target = "mutated.edge.target";
    firstPayload.edges.pop();

    const secondPayload = await fixtureGraphDataSource.loadGraph();

    expect(firstPayload).not.toEqual(baselinePayload);
    expect(secondPayload).toEqual(baselinePayload);
    expect(secondPayload).toEqual(graphFixturePayload);
  });

  it("is unaffected by external mutation of graphFixturePayload", async () => {
    const { fixtureGraphDataSource, graphFixturePayload } =
      await loadFixtureDataSourceAdapter();
    const baselinePayload = cloneGraphPayload(graphFixturePayload);
    const firstFixtureNode = graphFixturePayload.nodes.at(0);

    if (!firstFixtureNode) {
      throw new Error("graphFixturePayload must include at least one node");
    }

    const originalNodeName = firstFixtureNode.name;

    try {
      try {
        firstFixtureNode.name = "external_mutation_probe";
      } catch {
        // Immutable fixtures may reject writes.
      }

      const payloadAfterMutationAttempt =
        await fixtureGraphDataSource.loadGraph();

      expect(payloadAfterMutationAttempt).toEqual(baselinePayload);
    } finally {
      try {
        firstFixtureNode.name = originalNodeName;
      } catch {
        // Preserve teardown safety for immutable fixtures.
      }
    }
  });
});
