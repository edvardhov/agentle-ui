import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/use-theme";
import { GITHUB_URL, NPM_URL, NPM_VERSION_URL, PACKAGE_VERSION } from "./nav";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <Link to="/" className="topbar__brand" aria-label="agentle-ui home">
        <img
          className="topbar__logo topbar__logo--light"
          src={`${import.meta.env.BASE_URL}brand/agentle-ui-light.svg`}
          alt="agentle ui"
          width={110}
          height={20}
        />
        <img
          className="topbar__logo topbar__logo--dark"
          src={`${import.meta.env.BASE_URL}brand/agentle-ui-dark.svg`}
          alt="agentle ui"
          width={110}
          height={20}
        />
        <a
          href={NPM_VERSION_URL}
          className="topbar__tag"
          target="_blank"
          rel="noreferrer"
          aria-label={`agentle-ui v${PACKAGE_VERSION} on npm`}
          title="View on npm"
        >
          v{PACKAGE_VERSION}
        </a>
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
        <a
          href={NPM_URL}
          className="theme-toggle"
          target="_blank"
          rel="noreferrer"
          aria-label="View on npm"
          title="npm"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-toggle__icon theme-toggle__icon--npm">
            <path
              d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.64l.004-3.583H8.851v3.564H5.113z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          href={GITHUB_URL}
          className="theme-toggle"
          target="_blank"
          rel="noreferrer"
          aria-label="View on GitHub"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-toggle__icon theme-toggle__icon--github">
            <path
              d="M12 2C6.477 2 2 6.484 2 12.021c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.021C22 6.484 17.522 2 12 2z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </header>
  );
}
