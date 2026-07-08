import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

interface DocPageContextValue {
  headings: TocEntry[];
  registerHeading: (entry: TocEntry) => void;
}

const DocPageContext = createContext<DocPageContextValue | null>(null);

export function DocPage({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [headings, setHeadings] = useState<TocEntry[]>([]);

  const registerHeading = (entry: TocEntry) => {
    setHeadings((current) => {
      if (current.some((item) => item.id === entry.id)) return current;
      return [...current, entry];
    });
  };

  useEffect(() => {
    setHeadings([]);
  }, [location.pathname]);

  const value = useMemo(() => ({ headings, registerHeading }), [headings]);

  return (
    <DocPageContext.Provider value={value}>
      <article className="doc-page">{children}</article>
    </DocPageContext.Provider>
  );
}

export function useDocPage() {
  const ctx = useContext(DocPageContext);
  if (!ctx) throw new Error("useDocPage must be used within DocPage");
  return ctx;
}
