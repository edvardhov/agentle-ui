import { Route, Routes } from "react-router-dom";
import { DocLayout } from "./components/docs/doc-layout";
import { ActionCardPage } from "./docs/action-card";
import { ApiReferencePage } from "./docs/api-reference";
import { CliPage } from "./docs/cli";
import { ConceptsPage } from "./docs/concepts";
import { GettingStartedPage } from "./docs/getting-started";
import { HomePage } from "./docs/home";
import { MarkdownStabilizerPage } from "./docs/markdown-stabilizer";
import { PromptSurfacePage } from "./docs/prompt-surface";
import { ThoughtVisualizerPage } from "./docs/thought-visualizer";
import "./styles.css";

export default function App() {
  return (
    <Routes>
      <Route element={<DocLayout />}>
        <Route index element={<HomePage />} />
        <Route path="getting-started" element={<GettingStartedPage />} />
        <Route path="concepts" element={<ConceptsPage />} />
        <Route path="markdown-stabilizer" element={<MarkdownStabilizerPage />} />
        <Route path="thought-visualizer" element={<ThoughtVisualizerPage />} />
        <Route path="action-card" element={<ActionCardPage />} />
        <Route path="prompt-surface" element={<PromptSurfacePage />} />
        <Route path="cli" element={<CliPage />} />
        <Route path="api-reference" element={<ApiReferencePage />} />
      </Route>
    </Routes>
  );
}
