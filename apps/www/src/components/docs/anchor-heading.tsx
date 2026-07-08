import { useLayoutEffect, type ReactNode } from "react";
import { useDocPage } from "./doc-page";

interface AnchorHeadingProps {
  id: string;
  level: 2 | 3;
  children: ReactNode;
}

export function AnchorHeading({ id, level, children }: AnchorHeadingProps) {
  const { registerHeading } = useDocPage();
  const Tag = level === 2 ? "h2" : "h3";
  const text = String(children);

  useLayoutEffect(() => {
    registerHeading({ id, text, level });
  }, [id, text, level, registerHeading]);

  return (
    <Tag id={id} className={`doc-heading doc-heading--h${level}`}>
      <a href={`#${id}`} className="doc-heading__anchor" aria-label={`Link to ${children}`}>
        #
      </a>
      {children}
    </Tag>
  );
}
