import UpdateProfile from "@/views/containers/organisms/Auth/UpdateProfile";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const UpdateProfilePage = () => {
  return (
    <AppShell title="Edit Profil">
      <UpdateProfile />
    </AppShell>
  );
};

export default UpdateProfilePage;
