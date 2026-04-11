import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { orchestrateGraphBootstrap } from "./graph/bootstrap.orchestrator";
import { fixtureGraphDataSource } from "./graph/fixture-data-source.adapter";
import { graphValidator } from "./graph/validator";
import "./index.css";

const runBootstrap = () =>
  orchestrateGraphBootstrap({
    dataSource: fixtureGraphDataSource,
    validator: graphValidator,
  });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App runBootstrap={runBootstrap} />
  </StrictMode>,
)
