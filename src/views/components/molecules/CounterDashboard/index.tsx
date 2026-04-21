import React, { useEffect, useState } from "react";
import CardDashboardComponent from "../../atoms/CardDashboardComponent";
import { dashboardCounter } from "@/utils/data/static";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import SpinLoadingComponent from "../../atoms/SpinLoadingComponent";
import { getPackageCapabilities } from "@/utils/packageCapabilities";

type CounterDashboardProps = {
  icon: any;
};

const CounterDashboard = ({ icon }: CounterDashboardProps) => {
  const { data }: any = useSession();
  const packageCapabilities = getPackageCapabilities(data?.user?.usertypeId);
  const [count, setCount] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const emptyDashboardData = {
    arsip: 0,
    peminjaman: 0,
    pengembalian: 0,
  };

  const getCounterValue = (title: string, fallbackValue: number) => {
    switch (title) {
      case "Menu":
        return count?.menu?.toString();
      case "SubMenu":
        return count?.submenu?.toString();
      case "User":
        return count?.users?.toString();
      case "Level User":
        return count?.usertype?.toString();
      case "Rak":
        return count?.rak?.toString();
      case "Baris":
        return count?.baris?.toString();
      case "Box":
        return count?.box?.toString();
      case "Map":
        return count?.map?.toString();
      case "Arsip":
        return count?.arsip?.toString();
      default:
        return fallbackValue.toString();
    }
  };

  const countDashboard = async () => {
    try {
      const response = await fetch(`/api/dashboard/count`, {
        method: "GET",
      });
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setCount(emptyDashboardData);
        setIsLoading(false);
        return;
      }

      const responseJson = await response.json();

      if (!response.ok || responseJson.status === false) {
        setCount(emptyDashboardData);
        setIsLoading(false);

        if (response.status !== 401) {
          toast.error(responseJson.message || "Gagal memuat dashboard.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        return;
      }

      if (responseJson.status === true) {
        setCount(responseJson.data ?? emptyDashboardData);
        setIsLoading(false);
      } else {
        setCount(emptyDashboardData);
        setIsLoading(false);
        toast.error(responseJson.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard count:", error);
      setCount(emptyDashboardData);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data?.user.usertypeId != undefined) {
      countDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user]);

  return (
    <>
      {/* Toast */}
      <ToastContainer />
      {isLoading == false ? (
        dashboardCounter.map((item: any, index: number) =>
          data?.user.usertypeId == 5 &&
            (item.id == 1 || item.id == 2 || item.id == 3) ? (
            <div key={index} className="flex flex-wrap -mx-3 mb-0">
              {item.counter.map((counter: any, index: number) => (
                <div
                  key={index}
                  className={`mb-4 w-full ${counter.width} px-3`}
                >
                  <CardDashboardComponent
                    icon={icon[counter.icon]}
                    label={counter.title}
                    value={
                      counter.title == "Menu"
                        ? count?.menu?.toString()
                        : counter.title == "SubMenu"
                          ? count?.submenu?.toString()
                          : counter.title == "User"
                            ? count?.users?.toString()
                            : counter.title == "Level User"
                              ? count?.usertype?.toString()
                              : counter.title == "Rak"
                                ? count?.rak?.toString()
                                : counter.title == "Baris"
                                  ? count?.baris?.toString()
                                  : counter.title == "Box"
                                    ? count?.box?.toString()
                                    : counter.title == "Map"
                                      ? count?.map?.toString()
                                      : counter.title == "Arsip"
                                        ? count?.arsip?.toString()
                                        : counter.value.toString()
                    }
                  />
                </div>
              ))}
            </div>
          ) : (data?.user.usertypeId == 1 || data?.user.usertypeId == 2) &&
            (item.id == 1 || item.id == 2) ? (
            <div key={index} className="flex flex-wrap -mx-3 mb-0">
              {item.counter.map((counter: any, index: number) => (
                <div
                  key={index}
                  className={`mb-4 w-full ${counter.width} px-3`}
                >
                  <CardDashboardComponent
                    icon={icon[counter.icon]}
                    label={counter.title}
                    value={
                      counter.title == "Rak"
                        ? count?.rak?.toString()
                        : counter.title == "Baris"
                          ? count?.baris?.toString()
                          : counter.title == "Box"
                            ? count?.box?.toString()
                            : counter.title == "Map"
                              ? count?.map?.toString()
                              : counter.title == "Arsip"
                                ? count?.arsip?.toString()
                                : counter.value.toString()
                    }
                  />
                </div>
              ))}
            </div>
          ) : !packageCapabilities.canManageRetention && item.id == 1 ? (
            <div key={index} className="flex flex-wrap -mx-3 mb-0">
              {item.counter
                .filter((counter: any) => counter.title == "Arsip")
                .map((counter: any, index: number) => (
                <div
                  key={index}
                  className={`mb-4 w-full ${counter.width} px-3`}
                >
                  <CardDashboardComponent
                    icon={icon[counter.icon]}
                    label={counter.title}
                    value={getCounterValue(counter.title, counter.value)}
                  />
                </div>
              ))}
            </div>
          ) : null
        )
      ) : (
        <div className="w-full h-[400px] flex justify-center items-center">
          <SpinLoadingComponent />
        </div>
      )}
    </>
  );
};

export default CounterDashboard;

