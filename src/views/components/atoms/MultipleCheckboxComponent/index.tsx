import React, { useEffect, useState } from "react";

type MultipleCheckboxComponentProps = {
  label: string;
  options: any;
  defaultValue?: any;
  formikOnChange: any;
  lengthCheckboxOptions: string;
  isPriority?: boolean;
};

const MultipleCheckboxComponent = ({
  label,
  options,
  defaultValue,
  formikOnChange,
  lengthCheckboxOptions,
  isPriority,
}: MultipleCheckboxComponentProps) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    if (defaultValue) {
      setSelectedItems(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const checkboxHandler = (e: any) => {
    let isSelected = e.target.checked;
    let value = parseInt(e.target.value);

    if (isSelected) {
      setSelectedItems([...selectedItems, value]);
      formikOnChange([...selectedItems, value]);
    } else {
      setSelectedItems((prevData) => prevData.filter((id) => id !== value));
      formikOnChange(selectedItems.filter((id) => id !== value));
    }
  };

  return (
    <>
      <label
        className={`block text-sm font-medium mb-2 ${isPriority && "after:content-['*'] after:ml-0.5 after:text-red-500"
          }`}
      >
        {label}
      </label>
      <div className={`grid ${lengthCheckboxOptions} gap-2`}>
        {options.map((item: any) => (
          <label
            key={item.id_jenis}
            className="flex p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <input
              type="checkbox"
              className="shrink-0 mt-0.5 border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none"
              id={`hs-checkbox-in-form-${item.id_jenis}`}
              value={item.id_jenis}
              onChange={checkboxHandler}
              checked={selectedItems.includes(item.id_jenis)}
            />
            <span className="text-sm text-gray-500 ms-3">
              {item.jenis_name}
            </span>
          </label>
        ))}
      </div>
    </>
  );
};

export default MultipleCheckboxComponent;
