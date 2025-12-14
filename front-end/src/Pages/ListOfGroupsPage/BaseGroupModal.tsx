import React, { ReactNode } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "rgb(54, 65, 118)",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "auto",
  zIndex: 1300,
  opacity: 1,
  outline: "none",
};

const backdropStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.53)",
  backdropFilter: "blur(4px)",
};

const buttonStyle = {
  "&:hover": {
    backgroundColor: "rgb(105, 121, 199)",
  },
  "&:disabled": {
    backgroundColor: "rgb(110, 110, 112)",
  },
};

interface BaseGroupModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: ReactNode;
  description: string;
  loading: boolean;
  error: string;
  success: string;
  submitButtonText: string;
  submitButtonLoadingText: string;
  submitButtonIcon?: ReactNode;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitDisabled: boolean;
  children: ReactNode;
  infoAlert?: ReactNode;
}

const BaseGroupModal: React.FC<BaseGroupModalProps> = ({
  open,
  onClose,
  title,
  titleIcon,
  description,
  loading,
  error,
  success,
  submitButtonText,
  submitButtonLoadingText,
  submitButtonIcon,
  onSubmit,
  isSubmitDisabled,
  children,
  infoAlert,
}) => {
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      BackdropProps={{
        sx: backdropStyle,
      }}
    >
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
            sx={
              titleIcon
                ? { display: "flex", alignItems: "center", gap: 1 }
                : undefined
            }
          >
            {titleIcon}
            {title}
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
          {description}
        </Typography>

        <form onSubmit={onSubmit}>
          {children}

          {infoAlert}

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
              disabled={loading || isSubmitDisabled}
              startIcon={
                loading ? (
                  <CircularProgress size={20} />
                ) : (
                  submitButtonIcon || null
                )
              }
              sx={buttonStyle}
            >
              {loading ? submitButtonLoadingText : submitButtonText}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default BaseGroupModal;

