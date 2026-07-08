import type { ReactNode } from "react";

interface CustomizePanelProps {
  children: ReactNode;
}

export function CustomizePanel({ children }: CustomizePanelProps) {
  return (
    <details className="customize">
      <summary className="customize__summary">Customize</summary>
      <div className="customize__body">{children}</div>
    </details>
  );
}
