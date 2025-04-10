import { faker } from "@faker-js/faker";
import { randomColor } from "./utils";
import React from "react";

interface RowData {
  ID: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  music: string;
}

interface ColumnOption {
  label: string;
  backgroundColor: string;
}

interface Column {
  id: string | number;
  label: string;
  accessor?: string;
  minWidth?: number;
  width?: number;
  dataType: string;
  options: ColumnOption[];
  disableResizing?: boolean;
  Cell?: React.FC<{ row: any; dataDispatch: any }>;
}

interface TableData {
  columns: Column[];
  data: RowData[];
  skipReset: boolean;
}

export default function makeData(count: number): TableData {
  const data: RowData[] = [];
  const options: ColumnOption[] = [];

  for (let i = 0; i < count; i++) {
    const row: RowData = {
      ID: faker.number.int(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      age: Math.floor(20 + Math.random() * 20),
      music: faker.music.genre(),
    };
    options.push({ label: row.music, backgroundColor: randomColor() });
    data.push(row);
  }

  const columns: Column[] = [
    {
      id: "firstName",
      label: "First Name",
      accessor: "firstName",
      minWidth: 100,
      dataType: "text",
      options: [],
    },
    {
      id: "lastName",
      label: "Last Name",
      accessor: "lastName",
      minWidth: 100,
      dataType: "text",
      options: [],
    },
    {
      id: "age",
      label: "Age",
      accessor: "age",
      width: 80,
      dataType: "number",
      options: [],
    },
    {
      id: "email",
      label: "E-Mail",
      accessor: "email",
      width: 300,
      dataType: "text",
      options: [],
    },
    {
      id: "music",
      label: "Music Preference",
      accessor: "music",
      dataType: "select",
      width: 200,
      options: options,
    },
    {
      id: 999999,
      width: 20,
      label: "+",
      disableResizing: true,
      dataType: "null",
      options: [],
      Cell: ({ row, dataDispatch }) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "0.5rem",
            marginInline: "1rem",
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent the default form submission behavior
              dataDispatch({ type: "delete_row", rowIndex: row.index });
            }}
            className="remove-button"
          >
            <svg
              fill="#000000"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              viewBox="0 0 490.646 490.646"
              xmlSpace="preserve"
            >
              <g>
                <g>
                  <path
                    d="M399.179,67.285l-74.794,0.033L324.356,0L166.214,0.066l0.029,67.318l-74.802,0.033l0.025,62.914h307.739L399.179,67.285z
                    M198.28,32.11l94.03-0.041l0.017,35.262l-94.03,0.041L198.28,32.11z"
                  />
                  <path
                    d="M91.465,490.646h307.739V146.359H91.465V490.646z M317.461,193.372h16.028v250.259h-16.028V193.372L317.461,193.372z
                    M237.321,193.372h16.028v250.259h-16.028V193.372L237.321,193.372z M157.18,193.372h16.028v250.259H157.18V193.372z"
                  />
                </g>
              </g>
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return { columns, data, skipReset: false };
}
