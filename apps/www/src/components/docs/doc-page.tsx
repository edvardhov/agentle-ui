import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

export function DocPageProvider({ children }: { children: ReactNode }) {
  const [headings, setHeadings] = useState<TocEntry[]>([]);

  const registerHeading = useCallback((entry: TocEntry) => {
    setHeadings((current) => {
      if (current.some((item) => item.id === entry.id)) return current;
      return [...current, entry];
    });
  }, []);

  const value = useMemo(() => ({ headings, registerHeading }), [headings, registerHeading]);

  return <DocPageContext.Provider value={value}>{children}</DocPageContext.Provider>;
}

export function DocPage({ children }: { children: ReactNode }) {
  return <article className="doc-page">{children}</article>;
}

export function useDocPage() {
  const ctx = useContext(DocPageContext);
  if (!ctx) throw new Error("useDocPage must be used within DocPageProvider");
  return ctx;
}
