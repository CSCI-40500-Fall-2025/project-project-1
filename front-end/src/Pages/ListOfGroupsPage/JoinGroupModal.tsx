import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../../AuthContext";
import { joinGroup } from "../../services/groupServices";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onJoin?: (joinedGroup: any) => void; // Optional callback when join is successful
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  open,
  onClose,
  onJoin,
}) => {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user: authUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = invitationCode.trim();

    if (!code) {
      setError("Please enter an invitation code");
      return;
    }

    if (code.length !== 6) {
      setError("Invitation code must be exactly 6 characters");
      return;
    }

    if (!authUser) {
      setError("Please log in to join a group");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Attempting to join group with:", {
        invitation_code: code,
        user_id: authUser.userID,
      });

      // Call the joinGroup service function
      const result = await joinGroup(code, authUser.userID);

      console.log("Join successful:", result);

      setSuccess("Successfully joined the group!");

      // Call the onJoin callback if provided
      if (onJoin && result.group) {
        onJoin(result.group);
      }

      // Clear form and close modal after success
      setTimeout(() => {
        setInvitationCode("");
        onClose();
        // Optional: refresh the page or update state
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("Join group error:", err);

      // Provide user-friendly error messages
      let errorMessage =
        err.message || "Failed to join group. Please try again.";

      if (err.message.includes("Group not found")) {
        errorMessage = "Invalid invitation code. Please check and try again.";
      } else if (err.message.includes("already a member")) {
        errorMessage = "You are already a member of this group.";
      } else if (err.message.includes("Failed to fetch")) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setInvitationCode("");
      setError("");
      setSuccess("");
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2">
            Join a Group
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the 6-character invitation code provided by your group admin.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Invitation Code"
            value={invitationCode}
            onChange={(e) => {
              // Allow both uppercase and lowercase, but remove non-alphanumeric
              const value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
              setInvitationCode(value);
              setError("");
            }}
            placeholder="e.g. ABC123"
            inputProps={{
              maxLength: 6,
              style: {
                letterSpacing: "0.1em",
                fontFamily: "monospace",
                fontSize: "1.2rem",
              },
            }}
            disabled={loading}
            autoFocus
            sx={{ mb: 2 }}
            error={!!error && !success}
            helperText={
              invitationCode.length === 6
                ? "✓ 6 characters"
                : `${6 - invitationCode.length} characters remaining`
            }
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button onClick={handleClose} disabled={loading} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || invitationCode.length !== 6 || !authUser}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{
                backgroundColor: "#252061ff",
                "&:hover": {
                  backgroundColor: "#484663ff",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc",
                },
              }}
            >
              {loading ? "Joining..." : "Join Group"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default JoinGroupModal;
