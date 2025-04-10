import React from "react";

interface Column {
  id: string;
  label: string;
  accessor: string;
}

interface ViewTableProps {
  columns: Column[];
  data: Record<string, any>[];
}

const ViewTable: React.FC<ViewTableProps> = ({ columns, data }) => {
  return (
    <div>
      <div className="w-full lg:w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Responsive Table
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse table-auto">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300"
                        >
                          {row[column.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTable;
