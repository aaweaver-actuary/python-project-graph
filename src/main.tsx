import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { orchestrateGraphBootstrap } from "./graph/bootstrap.orchestrator";
import { fixtureGraphDataSource } from "./graph/fixture-data-source.adapter";
import { graphValidator } from "./graph/validator";
import "./index.css";

const bootstrapDependencies = {
  dataSource: fixtureGraphDataSource,
  validator: graphValidator,
};

const runBootstrap = () => orchestrateGraphBootstrap(bootstrapDependencies);

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <App runBootstrap={runBootstrap} />
  </StrictMode>,
);
