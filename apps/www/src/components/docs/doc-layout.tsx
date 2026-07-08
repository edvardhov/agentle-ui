import { Outlet } from "react-router-dom";
import { DocPage } from "./doc-page";
import { Sidebar } from "./sidebar";
import { Toc } from "./toc";
import { TopBar } from "./top-bar";

export function DocLayout() {
  return (
    <div className="doc-shell">
      <TopBar />
      <div className="doc-shell__body">
        <Sidebar />
        <main className="doc-main">
          <DocPage>
            <Outlet />
          </DocPage>
        </main>
        <Toc />
      </div>
    </div>
  );
}
