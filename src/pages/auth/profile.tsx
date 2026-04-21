import Profile from "@/views/containers/organisms/Auth/Profile";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const ProfilePage = () => {
  return (
    <AppShell title="User Account">
      <Profile />
    </AppShell>
  );
};

export default ProfilePage;
