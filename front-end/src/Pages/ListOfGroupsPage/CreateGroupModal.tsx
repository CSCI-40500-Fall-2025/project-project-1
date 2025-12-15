import React, { useState } from "react";
import { TextField, InputAdornment, Typography, Alert } from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { useAuth } from "../../AuthContext";
import { createGroup } from "../../services/groupServices";
import type { Group } from "../../services/groupServices";
import BaseGroupModal from "./BaseGroupModal";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (createdGroup: Group) => void; // Optional callback when create is successful
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
  const { user: authUser } = useAuth();

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

    if (!authUser) {
      setError("Please log in to create a group");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Attempting to create group with:", {
        group_name: trimmedName,
        user_id: authUser.userID,
      });

      // Call the createGroup service function
      const result = await createGroup(trimmedName, authUser.userID);

      console.log("Create successful:", result);

      setSuccess("Group created successfully!");

      // Call the onCreate callback if provided
      if (onCreate && result) {
        onCreate(result);
      }

      // Reset form and close modal after success
      setTimeout(() => {
        resetAndClose();
        // Reload while preserving the current URL
        const currentUrl = window.location.href;
        window.location.href = currentUrl;
      }, 1500);
    } catch (err: unknown) {
      console.error("Create group error:", err);

      // Provide user-friendly error messages
      let errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create group. Please try again.";

      if (err instanceof Error && err.message.includes("Failed to fetch")) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }

      setError(errorMessage);
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
    setError("");
  };

  return (
    <BaseGroupModal
      open={open}
      onClose={resetAndClose}
      title="Create New Group"
      titleIcon={<GroupAddIcon />}
      description="Create a new group and invite friends with a unique invitation code."
      loading={loading}
      error={error}
      success={success}
      submitButtonText="Create Group"
      submitButtonLoadingText="Creating..."
      submitButtonIcon={<GroupAddIcon />}
      onSubmit={handleSubmit}
      isSubmitDisabled={!groupName.trim() || !authUser}
      infoAlert={
        <Alert severity="info" sx={{ mb: 2 }} icon={<GroupAddIcon />}>
          A 6-character invitation code will be generated automatically.
        </Alert>
      }
    >
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
    </BaseGroupModal>
  );
};

export default CreateGroupModal;
