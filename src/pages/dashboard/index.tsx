import DashboardContent from "@/views/containers/organisms/Dashboard";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const Dashboard = () => {
  return (
    <AppShell title="Dashboard">
      <DashboardContent />
    </AppShell>
  );
};

export default Dashboard;
