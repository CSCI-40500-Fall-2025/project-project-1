import Box from "@mui/material/Box";
// import React from "react";
import { useState, useEffect } from "react";
import { getUser, logoutUser } from "../../services/userServices";

interface User {
  username: string;
}
const HomePage = () => {
  const [message, setMessage] = useState("");
  const [allUsers, setAllUsers] = useState<User[] | []>([]);
  
  useEffect(() => {
    getUser()
      .then((res) => {
        console.log("users response:", res);
        setAllUsers(res)
      })
      .catch(() => setAllUsers([]));
  }, []); // runs once on mount

  const handleLogout = () => {
    logoutUser()
    .then((res) => {
      console.log("logout response: ", res);
    })
    .catch(() => console.log("error logging out"))
  }
  return (
    <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
          padding: 2,
          flexDirection: "column",
        }}
      >
          <div>BING BONG {message}</div>
          <div>Users: </div>
          <div>
            {allUsers ? allUsers.map((user, i) => (
              <div key={i}>{user.username}</div>
            )) : ""}
          </div>
          <button onClick={handleLogout}>Logout</button>
      </Box>

  );
};

export default HomePage;
