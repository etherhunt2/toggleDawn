import React from "react";
import { flexRender, Header as HeaderType } from "@tanstack/react-table";
import clsx from "clsx";

const Header = ({ header }: { header: HeaderType<any, unknown> }) => {
  return (
    <div
      className={clsx("th", header.column.getCanSort() && "sortable")}
      onClick={header.column.getToggleSortingHandler()}
      style={{
        width: header.getSize(),
      }}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      <div
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={clsx(
          "resizer",
          header.column.getIsResizing() ? "isResizing" : ""
        )}
      />
      {header.column.getCanSort() && (
        <span className="sort-indicator">
          {header.column.getIsSorted() === "desc" ? " 🔽" : " 🔼"}
        </span>
      )}
    </div>
  );
};

export default Header;
