import React from "react";

type CheckboxComponentProps = {
  label: string;
  name: string;
  onChecked: any;
};
const CheckboxComponent = ({
  label,
  onChecked,
  name,
}: CheckboxComponentProps) => {
  return (
    <div className="flex justify-between w-full py-4">
      <div className="mr-4">
        <input
          type="checkbox"
          name={name}
          id={name}
          className="mr-2"
          onClick={onChecked}
        />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  );
};

export default CheckboxComponent;
