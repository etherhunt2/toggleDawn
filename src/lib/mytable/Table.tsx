import React, { useMemo } from "react";
import clsx from "clsx";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  Row,
} from "@tanstack/react-table";
import Cell from "./Cell";
import Header from "./Header";
import PlusIcon from "./img/Plus";
// import './style.css';

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  dispatch: React.Dispatch<any>;
  skipReset: boolean;
}

const defaultColumn = {
  minSize: 50,
  size: 150,
  maxSize: 400,
  cell: Cell,
  header: Header,
};

const Table = <T extends object>({
  columns,
  data,
  dispatch: dataDispatch,
  skipReset,
}: TableProps<T>) => {
  const sortTypes = useMemo(
    () => ({
      alphanumericFalsyLast: (rowA: Row<T>, rowB: Row<T>, columnId: string) => {
        if (!rowA.getValue(columnId) && !rowB.getValue(columnId)) {
          return 0;
        }

        if (!rowA.getValue(columnId)) {
          return 1;
        }

        if (!rowB.getValue(columnId)) {
          return -1;
        }

        return isNaN(rowA.getValue(columnId))
          ? String(rowA.getValue(columnId)).localeCompare(
              String(rowB.getValue(columnId))
            )
          : (rowA.getValue(columnId) as number) -
              (rowB.getValue(columnId) as number);
      },
    }),
    []
  );

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    meta: {
      dataDispatch,
    },
  });

  function isTableResizing() {
    return table.getState().columnSizingInfo.isResizingColumn !== null;
  }

  return (
    <div className={clsx("table", isTableResizing() && "noselect")}>
      <div>
        {table.getHeaderGroups().map((headerGroup) => (
          <div className="tr" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Header key={header.id} header={header} />
            ))}
          </div>
        ))}
      </div>
      <div>
        {table.getRowModel().rows.map((row) => (
          <div className="tr" key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <div className="td" key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
        <div
          className="tr add-row"
          onClick={() => dataDispatch({ type: "add_row" })}
        >
          <span className="svg-icon svg-gray" style={{ marginRight: 4 }}>
            <PlusIcon />
          </span>
          New
        </div>
      </div>
    </div>
  );
};

export default Table;
