import CreateUser from "@/views/containers/organisms/UserMenu/CreateUser";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const CreatePage = () => {
  return (
    <AppShell title="Tambah User">
      <CreateUser />
    </AppShell>
  );
};

export default CreatePage;
