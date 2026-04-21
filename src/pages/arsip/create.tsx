import CreateArsip from "@/views/containers/organisms/ArsipMenu/CreateArsip";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const CreatePage = () => {
  return (
    <AppShell title="Tambah Arsip">
      <CreateArsip />
    </AppShell>
  );
};

export default CreatePage;
