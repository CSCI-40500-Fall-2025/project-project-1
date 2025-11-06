import { useState } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import type { TodayEvent } from "../const";

type EventCardProps = {
  event: TodayEvent;
};

const EventCard = ({ event }: EventCardProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card
        sx={{
          maxWidth: 360,
          minWidth: 100,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: "#252061ff",
          height: "100%" ,
          cursor: "pointer",
          "&:hover": {
            boxShadow: 6,
            transform: "scale(1.05)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          },
        }}
      >
        <CardActionArea
          onClick={handleOpen}
          sx={{ display: "block", height: "100%" }}
        >
          <CardContent sx={{ height: "100%" }}>
            <Box display="flex" alignItems="center" mb={1}>
              <EventIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {event.eventName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.eventTime}
                </Typography>
              </Box>
            </Box>
            {event.location && (
              <Box>
                <Typography variant="body1" color="text.secondary">
                  <strong>Meet Us @ </strong> {event.location}
                </Typography>
              </Box>
            )}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                With the <strong>{event.groupName}</strong>
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>

      {/* --- Modal --- */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#1e1e2f",
              color: "#fff",
              borderRadius: 2,
              p: 2,
            },
          },
        }}
      >
        <DialogTitle>{event.eventName}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Time:</strong> {event.eventTime}
            <br />
            <strong>Organizer:</strong> {event.organizerName}
            <strong>Location:</strong> {event.location}
            <br />
            {event.eventDescription}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventCard;
