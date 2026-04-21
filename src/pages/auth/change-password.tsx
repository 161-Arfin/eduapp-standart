import ChangePassword from "@/views/containers/organisms/Auth/ChangePassword";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const ChangePasswordPage = () => {
  return (
    <AppShell title="Ubah Password">
      <ChangePassword />
    </AppShell>
  );
};

export default ChangePasswordPage;
