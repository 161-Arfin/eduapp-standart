import React from "react";

type RadioComponentProps = {
  label: string;
  name: string;
  options: any;
  lengthOptions: string;
  formikValue: string | number;
  formikOnChange: any;
  isPriority?: boolean;
};

const RadioComponent = ({
  label,
  name,
  options,
  lengthOptions,
  formikValue,
  formikOnChange,
  isPriority,
}: RadioComponentProps) => {
  const radioHandler = (e: any) => {
    let isSelected = e.target.checked;
    let value = parseInt(e.target.value); // Convert to number

    if (isSelected) {
      formikOnChange(value);
    }
  };

  return (
    <>
      <label
        className={`block text-sm font-medium mb-2 ${
          isPriority && "after:content-['*'] after:ml-0.5 after:text-red-500"
        }`}
      >
        {label}
      </label>
      <div className={`grid ${lengthOptions} gap-2`}>
        {options?.map((item: any) => (
          <label
            key={item.id}
            className="flex p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <input
              type="radio"
              name={name}
              className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none"
              id={`radio-${item.id}-${name}`}
              value={item.id}
              onChange={radioHandler}
              checked={item.id == formikValue}
            />
            <span className="text-sm text-gray-500 ms-3">{item.label}</span>
          </label>
        ))}
      </div>
    </>
  );
};

export default RadioComponent;
