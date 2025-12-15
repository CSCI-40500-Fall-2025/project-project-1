import React, { useState } from "react";
import { TextField, Box } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { useAuth } from "../../AuthContext";
import { createEvent } from "../../services/calendarServices";
import type { Event } from "../../const";
import BaseGroupModal from "../ListOfGroupsPage/BaseGroupModal";

interface CreateGroupEventModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  onEventCreated?: () => void;
}

const CreateGroupEventModal: React.FC<CreateGroupEventModalProps> = ({
  open,
  onClose,
  groupId,
  onEventCreated,
}) => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user: authUser } = useAuth();

  const resetAndClose = () => {
    setEventTitle("");
    setEventDescription("");
    setLocation("");
    setStartTime("");
    setEndTime("");
    setError("");
    setSuccess("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventTitle.trim()) {
      setError("Please enter an event title");
      return;
    }

    if (!startTime) {
      setError("Please select a start time");
      return;
    }

    if (!endTime) {
      setError("Please select an end time");
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError("Please enter valid dates");
      return;
    }

    if (endDate <= startDate) {
      setError("End time must be after start time");
      return;
    }

    if (!authUser) {
      setError("Please log in to create an event");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const eventData: Partial<Event> = {
        group_id: groupId,
        event_title: eventTitle.trim(),
        event_description: eventDescription.trim() || null,
        location: location.trim() || null,
        start_time: startDate,
        end_time: endDate,
        event_datetime: startDate.toISOString(),
        event_host: authUser.userID,
        attendees: 1,
      };

      await createEvent(eventData);

      setSuccess("Event created successfully!");

      if (onEventCreated) {
        onEventCreated();
      }

      setTimeout(() => {
        resetAndClose();
      }, 1500);
    } catch (err: unknown) {
      console.error("Create event error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseGroupModal
      open={open}
      onClose={resetAndClose}
      title="Create Group Event"
      titleIcon={<EventIcon />}
      description="Create a new event for this group. All group members will be able to see it."
      loading={loading}
      error={error}
      success={success}
      submitButtonText="Create Event"
      submitButtonLoadingText="Creating..."
      submitButtonIcon={<EventIcon />}
      onSubmit={handleSubmit}
      isSubmitDisabled={!eventTitle.trim() || !startTime || !endTime}
      disableBackdropClick={true}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Event Title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          required
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Description"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          multiline
          rows={3}
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          fullWidth
          disabled={loading}
        />

        <TextField
          label="Start Date & Time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          fullWidth
          disabled={loading}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          label="End Date & Time"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          fullWidth
          disabled={loading}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
    </BaseGroupModal>
  );
};

export default CreateGroupEventModal;
