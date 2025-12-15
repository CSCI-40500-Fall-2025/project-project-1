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
          display: "flex",
          flexDirection: "row",
          width: 300,
          height: 150,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: "#252061ff",
          textAlign: "center",
          margin: 1,
          cursor: "pointer",
          "&:hover": {
            boxShadow: 6,
            backgroundColor: "#484663ff",
            transform: "scale(1.05)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          },
        }}
      >
        <CardActionArea onClick={handleOpen}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Box sx={{ marginTop: "10px" }}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  marginLeft: "30px",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {event.eventName}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  With the <strong>{event.groupName}</strong>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  @ {event.eventTime}
                </Typography>
                {event.location && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>@</strong> {event.location}
                  </Typography>
                )}
              </Box>
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
            <br />
            {location && (
              <>
                <strong>Location:</strong> {event.location}
              </>
            )}
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
