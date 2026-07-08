import type { ReactNode } from "react";

interface CalloutProps {
  title?: string;
  children: ReactNode;
  variant?: "info" | "tip";
}

export function Callout({ title, children, variant = "info" }: CalloutProps) {
  return (
    <aside className={`callout callout--${variant}`}>
      {title ? <p className="callout__title">{title}</p> : null}
      <div className="callout__body">{children}</div>
    </aside>
  );
}
