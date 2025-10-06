"use client";

import React from "react";

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface ReusableTableProps {
  columns: TableColumn[];
  data: any[];
  className?: string;
  emptyMessage?: string;
}

export default function AdminTable({
  columns,
  data,
  className = "",
  emptyMessage = "No data available",
}: ReusableTableProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, idx) => (
              <th
                key={column.key + idx}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.className || ""
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, idx) => (
                <td
                  key={column.key + idx}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                    column.className || ""
                  }`}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
