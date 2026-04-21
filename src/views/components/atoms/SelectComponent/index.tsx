import React, { useEffect, useState } from "react";
import { Label, Listbox, ListboxButton } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

type SelectComponentProps = {
  id: string;
  label: string;
  options: any;
  selectedValue: any;
  isInvalid?: boolean;
  errorMessage?: string;
  isPriority?: boolean;
  disabled?: boolean;
  defaultValue?: any;
};

const SelectComponent = ({
  id,
  label,
  options,
  selectedValue,
  isInvalid,
  errorMessage,
  isPriority,
  disabled = false,
  defaultValue,
}: SelectComponentProps) => {
  const [selected, setSelected] = useState<any>(options[0] ?? null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (defaultValue && Object.keys(defaultValue).length > 0) {
      setSelected(defaultValue);
      return;
    }

    setSelected(options[0] ?? null);
  }, [defaultValue, options]);

  return (
    <div className="mb-3">
      <Listbox value={selected} onChange={(e) => setSelected(e)}>
        <Label
          className={`block text-sm/6 font-medium mb-1 ${isPriority && "after:content-['*'] after:ml-0.5 after:text-red-500"
            }`}
        >
          {label}
        </Label>
        <div className="max-w-full space-y-1">
          <div className="relative">
            <ListboxButton
              id={id}
              className={`grid w-full cursor-default grid-cols-1 rounded-lg ${disabled ? "bg-gray-200" : "bg-white"
                } py-[7px] px-3 text-left text-gray-700 outline outline-1 -outline-offset-1 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${isInvalid
                  ? "outline-red-500 focus:outline-red-500"
                  : "outline-gray-200 focus:outline-blue-700"
                }`}
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
            >
              <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                <span className="block truncate">
                  {selected?.name || "- Pilih opsi -"}
                </span>
              </span>
              <ChevronUpDownIcon
                aria-hidden="true"
                className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
              />
            </ListboxButton>
            {isInvalid ? (
              <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none pe-8">
                <svg
                  className="shrink-0 size-4 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" x2="12" y1="8" y2="12"></line>
                  <line x1="12" x2="12.01" y1="16" y2="16"></line>
                </svg>
              </div>
            ) : null}

            <div
              className={`absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm ${isOpen ? "opacity-100" : "opacity-0 h-0 invisible"
                } transition-all duration-200 ease-in-out`}
            >
              {options.map((item: any) => (
                <div
                  key={item.id}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 focus:bg-blue-500 focus:text-white focus:outline-none hover:bg-blue-500 hover:text-white hover:outline-none"
                  onClick={() => {
                    setIsOpen(false);
                    setSelected(item);
                    selectedValue(item);
                  }}
                >
                  <div className="flex items-center">
                    <span className="ml-3 block truncate font-normal">
                      {item.name}
                    </span>
                  </div>

                  <span
                    className={`absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 ${selected?.id !== item.id && "hidden"
                      } group-hover:text-white`}
                  >
                    <CheckIcon aria-hidden="true" className="size-5" />
                  </span>
                </div>
              ))}
            </div>
          </div>
          {isInvalid ? (
            <p className="text-sm text-red-600 mt-1">
              {errorMessage ? errorMessage : "Invalid input"}
            </p>
          ) : null}
        </div>
      </Listbox>
    </div>
  );
};

export default SelectComponent;

