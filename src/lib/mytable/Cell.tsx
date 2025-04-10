import React from "react";
import { Table, TableMeta } from "@tanstack/react-table";

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    dataDispatch: (action: { type: string; columnId: string; rowIndex: number; value: any }) => void;
  }
}

const Cell = ({ getValue, row, column, table }: { getValue: () => any; row: any; column: any; table: Table<any> }) => {
  const initialValue = getValue();
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    table.options.meta?.dataDispatch({
      type: "update_cell",
      columnId: column.id,
      rowIndex: row.index,
      value: value,
    });
  };

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="cell-input"
    />
  );
};

export default Cell;
