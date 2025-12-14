import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupBox from "../../components/GroupBox";
import JoinGroupModal from "./JoinGroupModal";
import CreateGroupModal from "./CreateGroupModal";
import { useAuth } from "../../AuthContext";
import { getUserGroups } from "../../services/groupServices";
import type { Group as ApiGroup } from "../../services/groupServices";
import type { Group } from "../../const";

const ListOfGroupsPage = () => {
  // State for modals and menu
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  // State for groups
  const [groupList, setGroupList] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser } = useAuth();

  const transformGroup = (apiGroup: ApiGroup, index: number): Group => {

    const hash = apiGroup.group_id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      groupID: hash || index + 1,
      groupName: apiGroup.group_name,
      memberIDs: [], 
    };
  };

  // Fetch user's groups
  useEffect(() => {
    const fetchGroups = async () => {
      if (!authUser?.userID) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiGroups = await getUserGroups(authUser.userID);
        const transformedGroups = apiGroups.map((group, index) =>
          transformGroup(group, index)
        );
        setGroupList(transformedGroups);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch groups. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [authUser?.userID]);

  // Refresh groups after creating or joining
  const refreshGroups = async () => {
    if (!authUser?.userID) return;

    try {
      const apiGroups = await getUserGroups(authUser.userID);
      const transformedGroups = apiGroups.map((group, index) =>
        transformGroup(group, index)
      );
      setGroupList(transformedGroups);
    } catch (err) {
      console.error("Error refreshing groups:", err);
    }
  };

  // Handle the "+" button click
  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
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
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              minHeight: "200px",
            }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        ) : groupList.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              minHeight: "200px",
            }}
          >
            <Typography color="text.secondary">
              No groups yet. Create or join a group to get started!
            </Typography>
          </Box>
        ) : (
          groupList.map((g, index) => (
            <GroupBox key={`group-${g.groupID}-${index}`} group={g} />
          ))
        )}

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
        onClose={() => {
          setJoinModalOpen(false);
          refreshGroups();
        }}
      />

      <CreateGroupModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          refreshGroups();
        }}
      />
    </Box>
  );
};

export default ListOfGroupsPage;
