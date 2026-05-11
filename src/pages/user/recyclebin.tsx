import RecyclebinUser from "@/views/containers/organisms/UserMenu/RecyclebinUser";
import AppShell from "@/views/containers/templates/AppShell";
import React from "react";

const RecyclebinPage = () => {
  return (
    <AppShell title="Recycle Bin Users">
      <RecyclebinUser />
    </AppShell>
  );
};

export default RecyclebinPage;
