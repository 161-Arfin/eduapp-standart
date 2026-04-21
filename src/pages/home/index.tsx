import FrontHeroBody from "@/views/components/molecules/FrontHeroBody";
import FrontNavbar from "@/views/components/molecules/FrontNavbar";
import AppShellFront from "@/views/containers/templates/AppShellFront";
import React from "react";

const Dashboard = () => {
  return (
    <AppShellFront title="Dashboard">
      {/* <!-- Navbar --> */}
      <FrontNavbar />

      {/* <!-- Hero / Body --> */}
      <FrontHeroBody />
    </AppShellFront>
  );
};

export default Dashboard;
