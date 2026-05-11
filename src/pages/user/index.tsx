import TableUser from "@/views/containers/organisms/UserMenu/TableUser";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const IndexPage = () => {
  return (
    <AppShell title="User">
      <TableUser />
    </AppShell>
  );
};

export default IndexPage;
