export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface PropsTableProps {
  title?: string;
  rows: PropRow[];
}

export function PropsTable({ title, rows }: PropsTableProps) {
  return (
    <div className="props-table-wrap">
      {title ? <p className="props-table__title">{title}</p> : null}
      <table className="props-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code>{row.type}</code>
              </td>
              <td>{row.default ? <code>{row.default}</code> : "—"}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
