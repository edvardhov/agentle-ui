import { NavLink } from "react-router-dom";
import { NAV_SECTIONS } from "./nav";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label="Documentation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="sidebar__section">
            <p className="sidebar__title">{section.title}</p>
            <ul className="sidebar__list">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `sidebar__link${isActive ? " sidebar__link--active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
