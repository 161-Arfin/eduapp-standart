import React, { useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import DropdownNavbarComponent from "../../atoms/DropdownNavbarComponent";
import { useDispatch, useSelector } from "react-redux";
import { setDropdownNavbar } from "@/lib/redux/actions/DropdownNavbarSlice";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const FrontNavbar = () => {
  const { data }: any = useSession();
  const dispatch = useDispatch();
  const [isOpenToggleNavbar, setIsOpenToggleNavbar] = useState(false);
  const [isOpenSubToggleNavbar, setIsOpenSubToggleNavbar] = useState(false);
  const isDropdownNavbar = useSelector(
    (state: any) => state.dropdownNavbar.data,
  );
  const isToggledDropdownNavbar = useSelector(
    (state: any) => state.dropdownNavbar.data,
  );
  const dropdownRef = useRef(null);

  return (
    <header className="bg-white border-b border-gray-200 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full">
      <nav className="relative max-w-[85rem] w-full md:flex md:items-center md:justify-between md:gap-3 mx-auto px-4 sm:px-6 lg:px-8 py-2 bg-white">
        {/* <!-- Logo w/ Collapse Button --> */}
        <div className="flex items-center justify-between">
          <a
            className="flex-none font-semibold text-xl text-black focus:outline-hidden focus:opacity-80"
            href="#"
            aria-label="Brand"
          >
            Arsip
          </a>

          {/* <!-- Collapse Button --> */}
          <div className="md:hidden">
            <button
              type="button"
              className="hs-collapse-toggle relative size-9 flex justify-center items-center text-sm font-semibold rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
              id="hs-header-classic-collapse"
              aria-expanded="false"
              aria-controls="hs-header-classic"
              aria-label="Toggle navigation"
              data-hs-collapse="#hs-header-classic"
              onClick={() => setIsOpenToggleNavbar(!isOpenToggleNavbar)}
            >
              <svg
                className={`${
                  isOpenToggleNavbar ? "hidden" : ""
                } hs-collapse-open:hidden size-4`}
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
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
              <svg
                className={`${
                  isOpenToggleNavbar ? "block" : "hidden"
                } hs-collapse-open:block shrink-0 size-4`}
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <span className="sr-only">Toggle navigation</span>
            </button>
          </div>
          {/* <!-- End Collapse Button --> */}
        </div>
        {/* <!-- End Logo w/ Collapse Button --> */}

        {/* <!-- Collapse for mobile screen --> */}
        <div className="md:hidden">
          <div
            id="hs-header-classic"
            className={`hs-collapse ${
              isOpenToggleNavbar ? "h-36" : "h-0"
            } overflow-hidden transition-all duration-300 basis-full grow`}
            aria-labelledby="hs-header-classic-collapse"
          >
            <div className="overflow-hidden overflow-y-auto max-h-36 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
              <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center md:justify-end gap-0.5 md:gap-1">
                <Link
                  className="p-2 flex items-center text-sm text-blue-600 focus:outline-hidden focus:text-blue-600"
                  href="/home"
                  aria-current="page"
                >
                  <svg
                    className="shrink-0 size-4 me-3 md:me-2 block md:hidden"
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
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                  Home
                </Link>

                <Link
                  className="p-2 flex items-center text-sm text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500"
                  href="/dashboard"
                >
                  <svg
                    className="shrink-0 size-4 me-3 md:me-2 block md:hidden"
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Dashboard
                </Link>

                {/* <!-- Dropdown --> */}
                <div
                  className={`hs-dropdown [--strategy:static] md:[--strategy:fixed] [--adaptive:none] md:[--adaptive:adaptive] [--is-collapse:true] md:[--is-collapse:false] ${
                    isOpenSubToggleNavbar ? "open" : ""
                  }`}
                >
                  <button
                    id="hs-header-classic-dropdown"
                    type="button"
                    className="hs-dropdown-toggle w-full p-2 flex items-center text-sm text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    aria-label="Dropdown"
                    onClick={() =>
                      setIsOpenSubToggleNavbar(!isOpenSubToggleNavbar)
                    }
                  >
                    <svg
                      className="shrink-0 size-4 me-3 md:me-2"
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
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {data?.user?.name || "User"}
                    <svg
                      className={`${
                        isOpenSubToggleNavbar ? "-rotate-180 md:rotate-0" : ""
                      } duration-300 shrink-0 size-4 ms-auto md:ms-1`}
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
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  <div
                    className={`hs-dropdown-menu transition-[opacity,margin] duration-[0.1ms] md:duration-[150ms] ${
                      isOpenSubToggleNavbar
                        ? "block opacity-100"
                        : "hidden opacity-0"
                    } relative w-full md:w-52 z-10 top-full ps-7 md:ps-0 md:bg-white md:rounded-lg md:shadow-md before:absolute before:-top-4 before:start-0 before:w-full before:h-5 md:after:hidden after:absolute after:top-1 after:start-4.5 after:w-0.5 after:h-[calc(100%-4px)] after:bg-gray-100`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="hs-header-classic-dropdown"
                  >
                    <div className="py-1 md:px-1 space-y-0.5">
                      <Link
                        className="py-1.5 px-2 flex items-center text-sm text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500"
                        href="/auth/profile"
                        onClick={() => dispatch(setDropdownNavbar(false))}
                      >
                        Profil
                      </Link>

                      <Link
                        className="py-1.5 px-2 flex items-center text-sm text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500"
                        href="/auth/change-password"
                        onClick={() => dispatch(setDropdownNavbar(false))}
                      >
                        Ubah Password
                      </Link>

                      <a
                        className="py-1.5 px-2 flex items-center text-sm text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500"
                        href="#"
                        onClick={() => {
                          signOut();
                          localStorage.removeItem("menuFeatures");
                          localStorage.removeItem("instansiUser");
                        }}
                      >
                        Logout
                      </a>
                    </div>
                  </div>
                </div>
                {/* <!-- End Dropdown --> */}
              </div>
            </div>
          </div>
        </div>
        {/* <!-- End Collapse for mobile screen --> */}

        {/* <!-- Collapse for pc screen --> */}
        <div
          id="hs-header-classic"
          className={`hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block`}
          aria-labelledby="hs-header-classic-collapse"
        >
          <div className="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
            <div className="py-2 md:py-0 flex flex-col md:flex-row md:items-center md:justify-end gap-0.5 md:gap-1">
              <Link
                className="p-2 flex items-center text-sm text-blue-600 focus:outline-hidden focus:text-blue-600"
                href="/home"
                aria-current="page"
              >
                <svg
                  className="shrink-0 size-4 me-3 md:me-2 block md:hidden"
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
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Home
              </Link>

              {data?.user.usertypeId == 5 ||
              data?.user.usertypeId == 1 ||
              data?.user.usertypeId == 2 ||
              data?.user.usertypeId == 3 ? (
                <Link
                  className="p-2 flex items-center text-sm text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500"
                  href="/dashboard"
                >
                  <svg
                    className="shrink-0 size-4 me-3 md:me-2 block md:hidden"
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Dashboard
                </Link>
              ) : null}

              {/* <!-- Button Group --> */}
              <div className="relative hidden md:flex flex-wrap items-center gap-x-1.5 md:ps-2.5 mt-1 md:mt-0 md:ms-1.5 before:block before:absolute before:top-1/2 before:-start-px before:w-px before:h-4 before:bg-gray-300 before:-translate-y-1/2">
                <a
                  className="p-2 w-full flex items-center text-sm text-gray-800 hover:text-gray-500 focus:outline-hidden focus:text-gray-500"
                  href="#"
                  onClick={() => dispatch(setDropdownNavbar(!isDropdownNavbar))}
                >
                  <svg
                    className="shrink-0 size-4 me-3 md:me-2"
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {data?.user?.name || "User"}
                </a>
              </div>
              {/* <!-- End Button Group --> */}
              {/* <!-- Dropdown --> */}
              <CSSTransition
                in={isToggledDropdownNavbar}
                timeout={300}
                classNames="dropdown-navbar"
                unmountOnExit
                nodeRef={dropdownRef}
                appear={true}
              >
                <DropdownNavbarComponent ref={dropdownRef} />
              </CSSTransition>
              {/* <!-- End Dropdown --> */}
            </div>
          </div>
        </div>
        {/* <!-- End Collapse for pc screen --> */}
      </nav>
    </header>
  );
};

export default FrontNavbar;
