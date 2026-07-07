import React from "react";
import SearchComponent from "../SearchComponent";

type CardContainerComponentProps = {
  title?: string;
  children: React.ReactNode;
  buttonCard?: string;
  actionButtonCard: any;
  isLoading?: boolean;
  iconButton?: any;
  handleSearchValue?: any;
  handleSearchCurrentValue?: any;
  withSearchComp?: boolean;
  isLoadingSearch?: boolean;
};

const CardContainerComponent = ({
  title,
  children,
  buttonCard,
  actionButtonCard,
  isLoading,
  iconButton,
  handleSearchValue,
  handleSearchCurrentValue,
  withSearchComp,
  isLoadingSearch,
}: CardContainerComponentProps) => {
  return (
    // Card
    <div className="relative mb-3 flex min-w-0 flex-col rounded-md border-none bg-white text-gray-600 shadow-lg">
      {/* Card Header */}
      {title ? (
        <div className="rounded-md bg-transparent border-b-0 py-4 items-center justify-between flex px-4 mb-0">
          <h6 className="text-[#6777ef] leading-tight font-medium">{title}</h6>
          {buttonCard && (
            <button
              type="button"
              onClick={() => actionButtonCard()}
              disabled={isLoading}
              className="inline-flex w-[200px] items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-100 focus:bg-gray-50 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-full flex items-center justify-center gap-2">
                  <span
                    className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-gray-600 rounded-full"
                    role="status"
                    aria-label="loading"
                  ></span>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center gap-2">
                  {buttonCard}
                  {iconButton}
                </div>
              )}
            </button>
          )}
          {withSearchComp && (
            <SearchComponent
              handleClick={(e) => handleSearchValue(e)}
              changeValue={(e) => handleSearchCurrentValue(e)}
              isLoading={isLoadingSearch}
            />
          )}
        </div>
      ) : null}
      {/* Card Body */}
      <div className="flex-auto px-4 py-4 text-gray-600">
        {/* Row */}
        <div className="flex flex-wrap mt-0 mx-0">
          {/* Col */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default CardContainerComponent;
