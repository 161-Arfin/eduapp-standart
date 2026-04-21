import { setShowModal } from "@/lib/redux/actions/ShowModalSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

type ModalComponentProps = {
  title: string;
  children: React.ReactNode;
  action?: any;
  isLoadingAction?: boolean;
  dataTarget: string;
  fileInputReset?: any;
};

const ModalComponent = ({
  title,
  children,
  action,
  isLoadingAction,
  dataTarget,
  fileInputReset,
}: ModalComponentProps) => {
  const dispatch = useDispatch();
  const isShowModal = useSelector((state: any) => state.showModal.data);

  return (
    <div
      id="hs-slide-down-animation-modal"
      className={`hs-overlay size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none ${
        isShowModal[dataTarget] ? "visible" : "invisible"
      }`}
    >
      <div
        className={`hs-overlay-animation-target ${
          isShowModal[dataTarget] ? "mt-7 opacity-100" : "mt-0 opacity-0"
        } duration-500 ease-out transition-all md:max-w-6xl md:w-[95%] m-3 sm:mx-auto`}
      >
        <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200 bg-white">
            <h3
              id="hs-slide-down-animation-modal-label"
              className="font-bold text-gray-800"
            >
              {title}
            </h3>
            <button
              type="button"
              className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Close"
              data-hs-overlay="#hs-slide-down-animation-modal"
              onClick={() => {
                if (isShowModal["detailAnggotaModal"]) {
                  dispatch(setShowModal({ [dataTarget]: false }));
                  dispatch(setShowModal({ filterModal: true }));
                } else {
                  dispatch(setShowModal({ [dataTarget]: false }));
                }
                if (dataTarget == "editArsipModal") {
                  fileInputReset();
                }
              }}
            >
              <span className="sr-only">Close</span>
              <svg
                className="shrink-0 size-4"
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
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          {/* Body */}
          <div className="p-4 overflow-y-auto">{children}</div>
          {/* Footer */}
          <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t border-gray-200 bg-white">
            {action && (
              <button
                type="button"
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                onClick={action}
                disabled={isLoadingAction}
              >
                {isLoadingAction ? "Loading..." : "Cari Data"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
