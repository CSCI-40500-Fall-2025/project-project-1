import Box from "@mui/material/Box";
import { useAuth } from "../../AuthContext";

const HomePage = () => {
  const { user: authUser } = useAuth();
  const userName = authUser ? authUser.username : "Guest";

  console.log("HomePage - authUser:", authUser);

  // returns username, email, and id if user is logged in
  // useEffect(() => {
  //   checkLogin()
  //     .then((res) => {
  //       if (res) {
  //         setUser(res);
  //       } else {
  //         console.log("User not logged in");
  //       }
  //     });
  // }, []);

  //test function: Get all usernames
  // useEffect(() => {
  //   if (!user) return;
  //   getUser()
  //     .then((res) => {
  //       console.log("users response:", res);
  //       setAllUsers(res)
  //     })
  //     .catch(() => setAllUsers([]));
  // }, [user]);

  // const handleLogout = () => {
  //   logoutUser()
  //   .then((res) => {
  //     console.log("logout response: ", res);
  //   })
  //   .catch(() => console.log("error logging out"))
  // }
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
      <div>Welcome, {userName}!</div>

      {/* <div>BING BONG {message}</div>
          {user? `Currently logged in as: ${user.username}, ${user.email}` : "Not logged in"}
          <div>Users: </div>
          <div>
            {allUsers ? allUsers.map((user, i) => (
              <div key={i}>{user.username}</div>
            )) : ""}
          </div> */}
    </Box>
  );
};

export default HomePage;
