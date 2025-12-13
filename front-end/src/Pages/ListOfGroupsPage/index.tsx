import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupBox from "../../components/GroupBox";
import JoinGroupModal from "./JoinGroupModal";
import CreateGroupModal from "./CreateGroupModal"; // If you have this
import { useAuth } from "../../AuthContext";

const ListOfGroupsPage = () => {
  // State for modals and menu
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Fetch user's list of groups
  const groupList = [
    { groupID: 1, groupName: "bums 1", memberIDs: ["a", "b", "c"] },
    { groupID: 2, groupName: "bums 2", memberIDs: ["a", "b", "c"] },
    { groupID: 3, groupName: "bums 3", memberIDs: ["a", "b", "c"] },
    { groupID: 4, groupName: "bums 4", memberIDs: ["a", "b", "c"] },
    { groupID: 5, groupName: "bums 5", memberIDs: ["a", "b", "c"] },
  ];

  // Handle the "+" button click
  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleJoinClick = () => {
    handleMenuClose();
    setJoinModalOpen(true);
  };

  const handleCreateClick = () => {
    handleMenuClose();
    setCreateModalOpen(true);
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
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
          gap: "1rem",
        }}
      >
        {groupList.map((g) => (
          <GroupBox key={g.groupID} group={g} />
        ))}

        {/* Add group button box - UPDATED */}
        <Box
          onClick={handleAddClick}
          sx={{
            width: 200,
            height: 200,
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: "#252061ff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
            cursor: "pointer",
            color: "white",
            "&:hover": {
              boxShadow: 6,
              backgroundColor: "#484663ff",
              transform: "scale(1.05)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            },
          }}
        >
          <Typography variant="h1" sx={{ userSelect: "none" }}>
            +
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Add Group
          </Typography>
        </Box>
      </Box>

      {/* Add Group Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={handleCreateClick}>
          <AddIcon sx={{ mr: 1 }} />
          Create New Group
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleJoinClick}>
          <GroupAddIcon sx={{ mr: 1 }} />
          Join Existing Group
        </MenuItem>
      </Menu>

      {/* Join Group Modal */}
      <JoinGroupModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />

       <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        //onCreate={handleJoinGroup}
      />
    </Box>
  );
};

export default ListOfGroupsPage;
