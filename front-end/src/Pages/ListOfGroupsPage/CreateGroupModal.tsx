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
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "auto",
};

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (groupName: string) => Promise<void>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = groupName.trim();

    if (!trimmedName) {
      setError("Please enter a group name");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Group name must be at least 2 characters");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Group name must be less than 50 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await onCreate(trimmedName);

      setSuccess("Group created successfully!");

      // Reset form and close modal after success
      setTimeout(() => {
        resetAndClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setGroupName("");
    setError("");
    setSuccess("");
    onClose();
  };

  const handleClose = () => {
    if (!loading) {
      resetAndClose();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
    setError("");
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
          <Typography
            variant="h5"
            component="h2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <GroupAddIcon />
            Create New Group
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            disabled={loading}
            sx={{
              "&:disabled": {
                opacity: 0.5,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create a new group and invite friends with a unique invitation code.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={handleNameChange}
            placeholder="e.g., Family, Work Team, Friends"
            disabled={loading}
            autoFocus
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography
                    variant="caption"
                    color={groupName.length > 50 ? "error" : "text.disabled"}
                  >
                    {groupName.length}/50
                  </Typography>
                </InputAdornment>
              ),
            }}
            error={!!error && !error.includes("created")}
            helperText={
              groupName.length > 45
                ? `${50 - groupName.length} characters remaining`
                : ""
            }
          />

          <Alert severity="info" sx={{ mb: 2 }} icon={<GroupAddIcon />}>
            A 6-character invitation code will be generated automatically.
          </Alert>

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

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}
          >
            <Button onClick={handleClose} disabled={loading} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !groupName.trim()}
              startIcon={
                loading ? <CircularProgress size={20} /> : <GroupAddIcon />
              }
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
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateGroupModal;
