import React, { useEffect, useRef, useState } from "react";
import CardDashboardComponent from "../../atoms/CardDashboardComponent";
import { dashboardCounter } from "@/utils/data/static";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import SpinLoadingComponent from "../../atoms/SpinLoadingComponent";

type CounterDashboardProps = {
  icon: any;
};

const CounterDashboard = ({ icon }: CounterDashboardProps) => {
  const { data }: any = useSession();
  const usertypeId = data?.user?.usertypeId;
  const instansiId = data?.user?.instansiId;
  const [count, setCount] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const counterFetchKeyRef = useRef<string | null>(null);
  const emptyDashboardData = {
    arsip: 0,
    arsip_active: 0,
    arsip_inactive: 0,
  };

  const getCounterValue = (dataKey: string, fallbackValue: number) => {
    const value = count?.[dataKey];
    return value !== undefined && value !== null
      ? value.toString()
      : fallbackValue.toString();
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
    if (usertypeId == undefined || instansiId == undefined) {
      return;
    }

    const fetchKey = `${usertypeId}:${instansiId}`;
    if (counterFetchKeyRef.current === fetchKey) {
      return;
    }
    counterFetchKeyRef.current = fetchKey;

    countDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usertypeId, instansiId]);

  return (
    <>
      {/* Toast */}
      <ToastContainer />
      {isLoading == false ? (
        dashboardCounter.map((item: any, index: number) => (
          <div key={index} className="flex flex-wrap -mx-3 mb-0">
            {item.counter.map((counter: any, index: number) => (
              <div key={index} className={`mb-4 w-full ${counter.width} px-3`}>
                <CardDashboardComponent
                  icon={icon[counter.icon]}
                  label={counter.title}
                  value={getCounterValue(counter.dataKey, counter.value)}
                />
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="w-full h-[400px] flex justify-center items-center">
          <SpinLoadingComponent />
        </div>
      )}
    </>
  );
};

export default CounterDashboard;
