import { useDocPage } from "./doc-page";

export function Toc() {
  const { headings } = useDocPage();

  if (headings.length === 0) return null;

  return (
    <aside className="toc" aria-label="On this page">
      <p className="toc__title">On this page</p>
      <ul className="toc__list">
        {headings.map((heading) => (
          <li key={heading.id} className={`toc__item toc__item--h${heading.level}`}>
            <a href={`#${heading.id}`} className="toc__link">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
