import React from "react";

type DetailComponentProps = {
  data: any;
  row: any;
  children?: React.ReactNode;
};

const DetailComponent = ({ data, row, children }: DetailComponentProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="divide-y divide-gray-200">
          {row.map((item: any) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 w-10">
                {item.label}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 w-2">
                :
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {data?.[item.id] ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
        {children && <tfoot>{children}</tfoot>}
      </table>
    </div>
  );
};

export default DetailComponent;
