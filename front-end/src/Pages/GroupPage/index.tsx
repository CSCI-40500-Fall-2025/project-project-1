import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PostAddIcon from "@mui/icons-material/PostAdd";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";
import { getGroupDetails } from "../../services/groupServices";
import type { GroupDetails } from "../../services/groupServices";

const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) {
        setError("Group ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const details = await getGroupDetails(groupId);
        setGroupDetails(details);
      } catch (err) {
        console.error("Error fetching group details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch group details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!groupDetails) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
        }}
      >
        <Typography>Group not found</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)",
        padding: 2,
        gap: 2,
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* Left Sidebar */}
      <Box
        sx={{
          width: "300px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flexShrink: 0,
        }}
      >
        {/* Group Information */}
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 600 }}>
            {groupDetails.group.group_name}
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <Typography
            variant="body2"
            sx={{ marginBottom: 1, color: "text.secondary" }}
          >
            <strong>Invitation Code:</strong>
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {groupDetails.group.invitation_code}
          </Typography>
          <Typography
            variant="body2"
            sx={{ marginBottom: 2, color: "text.secondary" }}
          >
            <strong>Members:</strong> {groupDetails.group.num_members}
          </Typography>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EventIcon />}
            onClick={() => navigate(`/group/${groupId}/events`)}
            sx={{
              backgroundColor: "#5B6BC7",
              "&:hover": {
                backgroundColor: "#6B7AE8",
              },
              marginTop: 1,
            }}
          >
            View Events
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EventIcon />}
            onClick={() => navigate(`/group/${groupId}/schedule-event`)}
            sx={{
              backgroundColor: "#5B6BC7",
              "&:hover": {
                backgroundColor: "#6B7AE8",
              },
              marginTop: 1,
            }}
          >
            View Calendar
          </Button>
        </Paper>

        {/* Group Members */}
        <Paper
          elevation={2}
          sx={{
            padding: 2,
            flex: 1,
            overflow: "auto",
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 600 }}>
            Members
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          {groupDetails.members.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              No members in this group.
            </Typography>
          ) : (
            <List sx={{ padding: 0 }}>
              {groupDetails.members.map((member) => (
                <ListItem
                  key={member.id}
                  sx={{
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      marginRight: 1.5,
                      bgcolor: "#252061ff",
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {member.username}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {member.email}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* Middle Forum/Post Feed */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 0, // Allows flexbox to shrink
        }}
      >
        {/* Create Post Section */}
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Avatar sx={{ bgcolor: "#252061ff", width: 40, height: 40 }}>
              <PersonIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Share something with the group..."
                multiline
                rows={3}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 1.5,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<PostAddIcon />}
                  sx={{
                    backgroundColor: "#5B6BC7",
                    "&:hover": {
                      backgroundColor: "#6B7AE8",
                    },
                  }}
                >
                  Post
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Posts Feed */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Placeholder for posts - will be replaced with actual posts later */}
          <Paper elevation={2} sx={{ padding: 3 }}>
            <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
              <Avatar sx={{ bgcolor: "#252061ff", width: 40, height: 40 }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Group Admin
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 hours ago
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              Welcome to {groupDetails.group.group_name}! This is where you can
              share announcements, updates, and communicate with the group.
            </Typography>
          </Paper>

          {/* Empty state when no posts */}
          <Paper
            elevation={2}
            sx={{
              padding: 4,
              textAlign: "center",
              backgroundColor: "rgba(0, 0, 0, 0.02)",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No posts yet. Be the first to share something with the group!
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default GroupPage;
