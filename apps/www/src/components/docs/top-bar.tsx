import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/use-theme";
import { GITHUB_URL, PACKAGE_VERSION } from "./nav";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand" aria-label="agentle-ui home">
        <img
          className="topbar__logo topbar__logo--light"
          src="/brand/agentle-ui-light.svg"
          alt="agentle ui"
          width={110}
          height={20}
        />
        <img
          className="topbar__logo topbar__logo--dark"
          src="/brand/agentle-ui-dark.svg"
          alt="agentle ui"
          width={110}
          height={20}
        />
        <span className="topbar__tag">v{PACKAGE_VERSION}</span>
      </Link>
      <div className="topbar__actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-toggle__icon">
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-toggle__icon">
              <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
        <a href={GITHUB_URL} className="topbar__link" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}
