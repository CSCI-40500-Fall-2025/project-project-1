import React, { useState } from "react";
import { TextField } from "@mui/material";
import { useAuth } from "../../AuthContext";
import { joinGroup } from "../../services/groupServices";
import type { Group } from "../../services/groupServices";
import BaseGroupModal from "./BaseGroupModal";

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onJoin?: (joinedGroup: Group) => void; // Optional callback when join is successful
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
        resetAndClose();
        // Reload while preserving the current URL
        const currentUrl = window.location.href;
        window.location.href = currentUrl;
      }, 1500);
    } catch (err: unknown) {
      console.error("Join group error:", err);

      // Provide user-friendly error messages
      let errorMessage = "Failed to join group. Please try again.";

      if (err instanceof Error) {
        errorMessage = err.message;

        if (err.message.includes("Group not found")) {
          errorMessage = "Invalid invitation code. Please check and try again.";
        } else if (err.message.includes("already a member")) {
          errorMessage = "You are already a member of this group.";
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "Cannot connect to server. Please check your connection.";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setInvitationCode("");
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <BaseGroupModal
      open={open}
      onClose={resetAndClose}
      title="Join a Group"
      description="Enter the 6-character invitation code provided by your group admin."
      loading={loading}
      error={error}
      success={success}
      submitButtonText="Join Group"
      submitButtonLoadingText="Joining..."
      onSubmit={handleSubmit}
      isSubmitDisabled={invitationCode.length !== 6 || !authUser}
    >
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
    </BaseGroupModal>
  );
};

export default JoinGroupModal;
