import { Box, Typography } from "@mui/material";
import FriendCard from "../../components/FriendCard";

const FriendsPage = () => {
  //fetch friends pls
  const friends = [
    {
      userID: '1',
      username: 'nub1',
      email: 'nub@nub.com'
    },
    {
      userID: '1',
      username: 'nub2',
      email: 'nub@nub.com'
    },
    {
      userID: '1',
      username: 'nub3',
      email: 'nub@nub.com'
    },
    {
      userID: '1',
      username: 'nub4',
      email: 'nub@nub.com'
    },

  ]

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: 'column',
        alignItems: 'center',
        height: "calc(100vh - 64px)",
        padding: 2,
      }}
    >
      <Typography variant="h3" sx={{ marginBottom: 2 }}>Friends</Typography>

      {/* friend list container */}
      {friends && friends.length > 0 ? (
        <Box sx={{
          display: 'grid', 
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)", // phones
            sm: "repeat(2, 1fr)", // small tablets
            md: "repeat(3, 1fr)", // medium screens
            lg: "repeat(4, 1fr)", // large screens
            xl: "repeat(5, 1fr)", // extra large screens
          },
        }}>
          {friends.map((f, index) => (
            <FriendCard key={index} friend={f}></FriendCard>
          ))}
        </Box>
      ) : (
        <Typography>You got no friends 😢</Typography>
      )}

    </Box>

  );
};

export default FriendsPage;
