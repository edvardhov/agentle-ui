import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DocPage, DocPageProvider } from "./doc-page";
import { Sidebar } from "./sidebar";
import { Toc } from "./toc";
import { TopBar } from "./top-bar";

export function DocLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    bodyRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="doc-shell">
      <TopBar />
      <DocPageProvider key={pathname}>
        <div ref={bodyRef} className="doc-shell__body">
          <Sidebar />
          <main ref={mainRef} className="doc-main">
            <DocPage>
              <Outlet />
            </DocPage>
          </main>
          <Toc />
        </div>
      </DocPageProvider>
    </div>
  );
}
