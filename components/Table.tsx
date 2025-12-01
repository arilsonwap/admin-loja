import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto" role="region" aria-label="Tabela de dados" tabIndex={0}>
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow" role="table">
        <thead className="bg-gray-100">
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                role="columnheader"
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200" role="rowgroup">
          {data.length === 0 ? (
            <tr role="row">
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500"
                role="cell"
              >
                Nenhum registro encontrado
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-gray-50" role="row">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap" role="cell">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
