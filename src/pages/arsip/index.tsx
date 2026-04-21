import TableArsip from "@/views/containers/organisms/ArsipMenu/TableArsip";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const IndexPage = () => {
  return (
    <AppShell title="Arsip">
      <TableArsip />
    </AppShell>
  );
};

export default IndexPage;
