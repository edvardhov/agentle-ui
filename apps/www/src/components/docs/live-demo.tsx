import type { ReactNode } from "react";

interface LiveDemoProps {
  title: string;
  description?: string;
  controls?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function LiveDemo({ title, description, controls, footer, children }: LiveDemoProps) {
  return (
    <section className="live-demo">
      <div className="live-demo__header">
        <div>
          <p className="live-demo__title">{title}</p>
          {description ? <p className="live-demo__desc">{description}</p> : null}
        </div>
        {controls ? <div className="live-demo__controls">{controls}</div> : null}
      </div>
      <div className="live-demo__surface">{children}</div>
      {footer}
    </section>
  );
}
