import React from "react";

type TableComponentProps = {
  data: any;
  columns: any;
  dataSession?: any;
  handleScroll?: any;
  isLoadingFetchMore?: boolean;
  emptyMessage?: string;
};

const TableComponent = ({
  dataSession,
  data,
  columns,
  handleScroll,
  isLoadingFetchMore,
  emptyMessage,
}: TableComponentProps) => {
  const scrollRef = React.useRef(null);

  return (
    <div className="flex flex-col">
      <div className="-m-1.5 overflow-x-auto">
        <div className="p-1.5 min-w-full inline-block align-middle">
          {/* <div className="overflow-hidden"> */}
          <div
            className="overflow-y-auto max-h-screen"
            onScroll={() => handleScroll(scrollRef) || null}
            ref={scrollRef}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 z-5 bg-white">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                  >
                    No
                  </th>
                  {columns?.map((column: any) => (
                    <th
                      key={column.id}
                      scope="col"
                      className={`px-6 py-3 ${
                        column.align === "right"
                          ? "text-end"
                          : column.align === "center"
                            ? "text-center"
                            : "text-start"
                      } text-xs font-medium text-gray-500 uppercase`}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.map((item: any, index: number) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {index + 1}
                    </td>
                    {columns?.map((column: any) =>
                      column.id !== "action" ? (
                        <td
                          key={column.id}
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800"
                        >
                          {item[column.id]}
                        </td>
                      ) : (
                        <td
                          key={column.id}
                          className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium"
                        >
                          {column.actionButton?.map((btn: any) => (
                            <button
                              key={btn.id}
                              type="button"
                              className={`inline-flex items-center gap-x-1.5 py-1 px-2 rounded-full text-xs font-medium ${
                                btn.id === "detail"
                                  ? "bg-blue-100 text-blue-800"
                                  : btn.id === "edit"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : btn.id === "delete"
                                      ? "bg-red-100 text-red-800"
                                      : btn.id === "restore"
                                        ? "bg-blue-100 text-blue-800"
                                        : btn.id === "forceDelete"
                                          ? "bg-red-100 text-red-800"
                                          : ""
                              } ml-1`}
                              onClick={() => btn.action(item.id)}
                            >
                              {btn.title}
                            </button>
                          ))}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
                {Array.isArray(data) && data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-10 text-center text-sm font-normal text-gray-100"
                    >
                      {emptyMessage || "Data kosong"}
                    </td>
                  </tr>
                ) : null}
                {isLoadingFetchMore ? (
                  <tr>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800"
                      colSpan={columns.length + 1}
                    >
                      <div className="d-flex justify-content-center">
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
