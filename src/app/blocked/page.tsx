import { NextPage } from "next";
import React from "react";

const BlockedPage: NextPage = () => {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <p>You are allowed to access this page.</p>
    </main>
  );
};

export default BlockedPage;
