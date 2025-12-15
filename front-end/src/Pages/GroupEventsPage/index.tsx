import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
  Chip,
  Collapse,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getGroupEvents } from "../../services/calendarServices";
import { getGroupDetails } from "../../services/groupServices";
import type { Event } from "../../const";
import type { GroupDetails } from "../../services/groupServices";
import CreateGroupEventModal from "./CreateGroupEventModal";
import AddIcon from "@mui/icons-material/Add";

const GroupEventsPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId) {
        setError("Group ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch both group details and events in parallel
        const [groupData, eventsData] = await Promise.all([
          getGroupDetails(groupId),
          getGroupEvents(groupId),
        ]);

        setGroupDetails(groupData);
        setEvents(eventsData);
      } catch (err) {
        console.error("Error fetching group events:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch group events. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleEventExpanded = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const isEventExpanded = (eventId: string) => expandedEvents.has(eventId);

  const isPastEvent = (eventDatetime: string) => {
    return new Date(eventDatetime) < new Date();
  };

  const filteredEvents = showPastEvents
    ? events
    : events.filter((event) => !isPastEvent(event.event_datetime));

  const refreshEvents = async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);
      const eventsData = await getGroupEvents(groupId);
      setEvents(eventsData);
    } catch (err) {
      console.error("Error refreshing events:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
          gap: 2,
        }}
      >
        <Typography color="error">{error}</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/group/${groupId}`)}
        >
          Back to Group
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        padding: 2,
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: 3,
          gap: 2,
          position: "relative",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/group/${groupId}`)}
        >
          Back
        </Button>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {groupDetails?.group.group_name || "Group"} Events
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginLeft: "auto",
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateEventModalOpen(true)}
            sx={{
              backgroundColor: "#5B6BC7",
              "&:hover": {
                backgroundColor: "#6B7AE8",
              },
            }}
          >
            Create Event
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={showPastEvents}
                onChange={(e) => setShowPastEvents(e.target.checked)}
                color="primary"
              />
            }
            label="Show Past Events"
          />
        </Box>
      </Box>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            padding: 4,
            textAlign: "center",
            backgroundColor: "rgba(0, 0, 0, 0.02)",
          }}
        >
          <EventIcon
            sx={{ fontSize: 64, color: "text.secondary", marginBottom: 2 }}
          />
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ marginBottom: 1 }}
          >
            No events scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {showPastEvents
              ? "This group doesn't have past events."
              : "No upcoming events. Toggle 'Show Past Events' to see previous events."}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredEvents.map((event) => {
            const isExpanded = isEventExpanded(event.event_id);
            return (
              <Paper
                key={event.event_id}
                elevation={2}
                sx={{
                  padding: 3,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => toggleEventExpanded(event.event_id)}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {event.event_title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={`${event.attendees} attending`}
                      size="small"
                      sx={{ backgroundColor: "#252061ff", color: "white" }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEventExpanded(event.event_id);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDate(event.event_datetime)}
                    </Typography>
                  </Box>

                  {event.location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2">{event.location}</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Host: {event.host_username || event.event_host}
                    </Typography>
                  </Box>
                </Box>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Divider sx={{ marginY: 2 }} />

                  {/* Description Section */}
                  <Box sx={{ marginBottom: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, marginBottom: 1 }}
                    >
                      Description
                    </Typography>
                    {event.event_description ? (
                      <Typography
                        variant="body1"
                        sx={{ color: "text.secondary", whiteSpace: "pre-wrap" }}
                      >
                        {event.event_description}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontStyle: "italic" }}
                      >
                        No description provided
                      </Typography>
                    )}
                  </Box>

                  {/* Attendees Section */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, marginBottom: 1 }}
                    >
                      Who&apos;s Attending
                    </Typography>
                    {event.participants && event.participants.length > 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <PeopleIcon
                          fontSize="small"
                          color="action"
                          sx={{ mt: 0.5 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ mb: 1, color: "text.secondary" }}
                          >
                            {event.participants.length}{" "}
                            {event.participants.length === 1
                              ? "person is"
                              : "people are"}{" "}
                            attending
                          </Typography>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {event.participants.map((participant) => (
                              <Chip
                                key={participant.user_id}
                                label={participant.username}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.75rem",
                                  height: "24px",
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontStyle: "italic" }}
                      >
                        No attendees yet
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Create Event Modal */}
      {groupId && (
        <CreateGroupEventModal
          open={createEventModalOpen}
          onClose={() => setCreateEventModalOpen(false)}
          groupId={groupId}
          onEventCreated={refreshEvents}
        />
      )}
    </Box>
  );
};

export default GroupEventsPage;
