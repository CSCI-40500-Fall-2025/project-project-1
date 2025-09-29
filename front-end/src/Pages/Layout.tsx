// import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const loggedIn = user !== null;
  return (
    <>
      <Navbar loggedIn={loggedIn} logOut={logout} />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
