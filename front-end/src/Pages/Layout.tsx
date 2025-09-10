// import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbar loggedIn={true} />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
