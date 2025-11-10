import { Box, Typography } from "@mui/material";
import GroupBox from "../../components/GroupBox";


const ListOfGroupsPage = () => {
  //fetch user's list of groups
  const groupList = [
    { groupID: 1, groupName: 'bums 1', memberIDs: ['a', 'b', 'c'] },
    { groupID: 2, groupName: 'bums 2', memberIDs: ['a', 'b', 'c'] },
    { groupID: 3, groupName: 'bums 3', memberIDs: ['a', 'b', 'c'] },
    { groupID: 4, groupName: 'bums 4', memberIDs: ['a', 'b', 'c'] },
    { groupID: 5, groupName: 'bums 5', memberIDs: ['a', 'b', 'c'] },
  ];


  const handleAddGroup = () => {
    alert("Function not implemented");
  };


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "calc(100vh - 64px)",
        padding: 2,
      }}
    >
      <Typography variant="h3" sx={{ marginBottom: 2 }}>
        My Groups
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)", // phones
            sm: "repeat(2, 1fr)", // small tablets
            md: "repeat(3, 1fr)", // medium screens
            lg: "repeat(4, 1fr)", // large screens
            xl: "repeat(5, 1fr)", // extra large screens
          },
          gap: "1rem",
        }}
      >
        {groupList.map((g) => (
          <GroupBox key={g.groupID} group={g} />
        ))}


        {/* add group button box */}
        <Box
          onClick={handleAddGroup}
          sx={{
            width: 200,
            height: 200,
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: "#252061ff",
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "white",
            "&:hover": {
              boxShadow: 6,
              backgroundColor: '#484663ff',
              transform: "scale(1.05)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            },
          }}
        >
          <Typography variant="h1" sx={{ userSelect: "none" }}>
            +
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};


export default ListOfGroupsPage;