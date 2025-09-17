import Box from "@mui/material/Box";
// import React from "react";
import { useState, useEffect } from "react";
import { getUser, logoutUser, checkLogin } from "../../services/userServices";

interface AllUsers {
  username: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}
const HomePage = () => {
  const [message, setMessage] = useState("");
  const [allUsers, setAllUsers] = useState<AllUsers[] | []>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // returns username, email, and id if user is logged in
  useEffect(() => {
    checkLogin()
      .then((res) => {
        if (res) {
          setUser(res);
        } else {
          console.log("User not logged in");
        }
      });
  }, []);

  //test function: Get all usernames
  useEffect(() => {
    if (!user) return;
    getUser()
      .then((res) => {
        console.log("users response:", res);
        setAllUsers(res)
      })
      .catch(() => setAllUsers([]));
  }, [user]);

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
          {user? `Currently logged in as: ${user.username}, ${user.email}` : "Not logged in"}
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
