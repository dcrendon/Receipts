import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles.css";

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error("Expected #root element in index.html");
}

createRoot(rootNode).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
