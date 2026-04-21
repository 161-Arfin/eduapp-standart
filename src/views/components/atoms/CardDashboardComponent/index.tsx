import React from "react";

type CardDashboardComponentProps = {
  icon: any;
  label: string;
  value: string;
};

const CardDashboardComponent = ({
  icon,
  label,
  value,
}: CardDashboardComponentProps) => {
  return (
    <div className="w-full bg-white shadow-sm border border-gray-100 rounded-md h-full flex items-center p-5 transition-shadow hover:shadow-md">
      {/* Icon Container pada sisi kiri */}
      <div className="flex-shrink-0 mr-4 w-12 h-12 flex items-center justify-center rounded-lg">
        {icon}
      </div>

      {/* Text Container pada sisi kanan */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5 truncate">
          {label}
        </div>
        <div className="text-gray-700 font-medium text-xl leading-tight">
          {value}
        </div>
      </div>
    </div>
  );
};

export default CardDashboardComponent;
