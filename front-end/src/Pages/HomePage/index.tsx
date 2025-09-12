import Box from "@mui/material/Box";
// import React from "react";
import { useState, useEffect } from "react";
import { createUser, getUser } from "../../services/userServices";

interface User {
  username: string;
}
const HomePage = () => {
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[] | null>(null);
  
  useEffect(() => {
    getUser()
      .then((res) => {
        setUsers(res)
        console.log("users response:", res);
      })
      .catch((err) => setUsers(err.message));
  }, []); // runs once on mount

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
            {users && users.map((user, i) => (
              <div key={i}>{user.username}</div>
            ))}
          </div>
      </Box>

  );
};

export default HomePage;
