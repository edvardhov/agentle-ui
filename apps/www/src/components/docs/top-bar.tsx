import { Link } from "react-router-dom";
import { GITHUB_URL, PACKAGE_VERSION } from "./nav";

export function TopBar() {
  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand">
        <span className="topbar__wordmark">agentle-ui</span>
        <span className="topbar__tag">v{PACKAGE_VERSION}</span>
      </Link>
      <div className="topbar__actions">
        <a href={GITHUB_URL} className="topbar__link" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}
