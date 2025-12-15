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
import {
  getGroupEvents,
  attendEvent,
  unattendEvent,
  checkUserAttendance,
  deleteEvent,
} from "../../services/calendarServices";
import { getGroupDetails } from "../../services/groupServices";
import type { Event } from "../../const";
import type { GroupDetails } from "../../services/groupServices";
import CreateGroupEventModal from "./CreateGroupEventModal";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../AuthContext";

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
  const [userAttending, setUserAttending] = useState<Set<string>>(new Set());
  const [attendingLoading, setAttendingLoading] = useState<Set<string>>(
    new Set()
  );
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const { user: authUser } = useAuth();

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

        // Check attendance for all events if user is logged in
        if (authUser?.userID) {
          const attendanceChecks = eventsData.map((event) =>
            checkUserAttendance(event.event_id)
              .then((isAttending) => ({
                eventId: event.event_id,
                isAttending,
              }))
              .catch(() => ({
                eventId: event.event_id,
                isAttending: false,
              }))
          );
          const attendanceResults = await Promise.all(attendanceChecks);
          const attendingSet = new Set(
            attendanceResults
              .filter((result) => result.isAttending)
              .map((result) => result.eventId)
          );
          setUserAttending(attendingSet);
        }
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
  }, [groupId, authUser?.userID]);

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

      // Refresh attendance status
      if (authUser?.userID) {
        const attendanceChecks = eventsData.map((event) =>
          checkUserAttendance(event.event_id)
            .then((isAttending) => ({
              eventId: event.event_id,
              isAttending,
            }))
            .catch(() => ({
              eventId: event.event_id,
              isAttending: false,
            }))
        );
        const attendanceResults = await Promise.all(attendanceChecks);
        const attendingSet = new Set(
          attendanceResults
            .filter((result) => result.isAttending)
            .map((result) => result.eventId)
        );
        setUserAttending(attendingSet);
      }
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

  const handleToggleAttendance = async (
    eventId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent expanding/collapsing the event

    if (!authUser?.userID) {
      setError("Please log in to attend events");
      return;
    }

    const isAttending = userAttending.has(eventId);
    setAttendingLoading((prev) => new Set(prev).add(eventId));

    try {
      if (isAttending) {
        await unattendEvent(eventId);
        setUserAttending((prev) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      } else {
        await attendEvent(eventId);
        setUserAttending((prev) => new Set(prev).add(eventId));
      }
      // Refresh events to update attendee count
      await refreshEvents();
    } catch (err) {
      console.error("Error toggling attendance:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update attendance. Please try again."
      );
    } finally {
      setAttendingLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleDeleteEvent = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding/collapsing the event

    if (!authUser?.userID) {
      setError("Please log in to delete events");
      return;
    }

    // Confirm deletion
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingEvent(eventId);

    try {
      await deleteEvent(eventId);
      // Refresh events to remove deleted event from list
      await refreshEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete event. Please try again."
      );
    } finally {
      setDeletingEvent(null);
    }
  };

  const isEventHost = (event: Event) => {
    return authUser?.userID === event.event_host;
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
        height: "100%",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        overflow: "hidden",
        minHeight: 0,
        gap: 2,
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          color: "white",
          borderRadius: 3,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            position: "relative",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/group/${groupId}`)}
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.5)",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            variant="outlined"
          >
            Back
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
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
            <FormControlLabel
              control={
                <Switch
                  checked={showPastEvents}
                  onChange={(e) => setShowPastEvents(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "white",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: "white", fontWeight: 500 }}>
                  Show Past Events
                </Typography>
              }
            />
          </Box>
        </Box>
      </Paper>

      {/* Create Event Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
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
      </Box>

      {/* Events List */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          // Custom scrollbar styling
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(102, 126, 234, 0.5)",
            borderRadius: "10px",
            "&:hover": {
              background: "rgba(102, 126, 234, 0.7)",
            },
          },
          // Firefox scrollbar styling
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(102, 126, 234, 0.5) rgba(102, 126, 234, 0.1)",
        }}
      >
        {filteredEvents.length === 0 ? (
          <Box
            sx={{
              padding: 6,
              textAlign: "center",
              backgroundColor: "transparent",
              borderRadius: 3,
              border: "2px dashed rgba(102, 126, 234, 0.5)",
            }}
          >
            <EventIcon
              sx={{
                fontSize: 80,
                color: "#9e9e9e",
                marginBottom: 2,
                opacity: 0.5,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                marginBottom: 1,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.76)",
              }}
            >
              No events scheduled
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#757575", maxWidth: "500px", margin: "0 auto" }}
            >
              {showPastEvents
                ? "This group doesn't have past events."
                : "No upcoming events. Toggle 'Show Past Events' to see previous events."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {filteredEvents.map((event) => {
              const isExpanded = isEventExpanded(event.event_id);
              const isPast = isPastEvent(event.event_datetime);
              return (
                <Box
                  key={event.event_id}
                  sx={{
                    padding: 3.5,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    backgroundColor: "rgba(48, 43, 127, 0.92)",
                    borderRadius: 3,
                    border: isExpanded
                      ? "2px solidrgb(82, 97, 165)"
                      : "1px solid rgba(102, 126, 234, 0.3)",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-4px)",
                      borderColor: "#667eea",
                    },
                    opacity: isPast ? 0.85 : 1,
                  }}
                  onClick={() => toggleEventExpanded(event.event_id)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 2.5,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "white",
                          marginBottom: 0.5,
                          fontSize: "1.5rem",
                        }}
                      >
                        {event.event_title}
                      </Typography>
                      {isPast && (
                        <Chip
                          label="Past Event"
                          size="small"
                          sx={{
                            backgroundColor: "#9e9e9e",
                            color: "white",
                            fontSize: "0.7rem",
                            height: "20px",
                            marginTop: 0.5,
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Chip
                        icon={<PeopleIcon sx={{ color: "white !important" }} />}
                        label={`${event.attendees} attending`}
                        size="medium"
                        sx={{
                          backgroundColor: "#667eea",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          height: "32px",
                        }}
                      />
                      <IconButton
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEventExpanded(event.event_id);
                        }}
                        sx={{
                          backgroundColor: isExpanded
                            ? "#667eea"
                            : "rgba(102, 126, 234, 0.1)",
                          color: isExpanded ? "white" : "#667eea",
                          "&:hover": {
                            backgroundColor: "#667eea",
                            color: "white",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      paddingLeft: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        padding: 1,
                        borderRadius: 1,
                        backgroundColor: "rgba(102, 126, 234, 0.2)",
                      }}
                    >
                      <EventIcon
                        sx={{ color: "#9bb5ff", fontSize: "1.3rem" }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: "rgba(255, 255, 255, 0.95)",
                        }}
                      >
                        {formatDate(event.event_datetime)}
                      </Typography>
                    </Box>

                    {event.location && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          padding: 1,
                          borderRadius: 1,
                          backgroundColor: "rgba(102, 126, 234, 0.2)",
                        }}
                      >
                        <LocationOnIcon
                          sx={{ color: "#9bb5ff", fontSize: "1.3rem" }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: "rgba(255, 255, 255, 0.95)",
                          }}
                        >
                          {event.location}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        padding: 1,
                        borderRadius: 1,
                        backgroundColor: "rgba(102, 126, 234, 0.2)",
                      }}
                    >
                      <PersonIcon
                        sx={{ color: "#9bb5ff", fontSize: "1.3rem" }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: "rgba(255, 255, 255, 0.95)",
                        }}
                      >
                        Host:{" "}
                        <Box
                          component="span"
                          sx={{ fontWeight: 600, color: "white" }}
                        >
                          {event.host_username || event.event_host}
                        </Box>
                      </Typography>
                    </Box>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Divider
                      sx={{
                        marginY: 3,
                        borderColor: "rgba(102, 126, 234, 0.2)",
                        borderWidth: 1,
                      }}
                    />

                    {/* Attend/Unattend/Delete Button */}
                    {authUser && (
                      <Box sx={{ marginBottom: 3 }}>
                        {isEventHost(event) ? (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={(e) =>
                              handleDeleteEvent(event.event_id, e)
                            }
                            disabled={deletingEvent === event.event_id}
                            sx={{
                              backgroundColor: "#d32f2f",
                              padding: "10px 24px",
                              fontSize: "0.95rem",
                              fontWeight: 600,
                              borderRadius: 2,
                              textTransform: "none",
                              boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)",
                              "&:hover": {
                                backgroundColor: "#c62828",
                                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
                              },
                            }}
                          >
                            {deletingEvent === event.event_id
                              ? "Deleting..."
                              : "Delete Event"}
                          </Button>
                        ) : (
                          <Button
                            variant={
                              userAttending.has(event.event_id)
                                ? "outlined"
                                : "contained"
                            }
                            onClick={(e) =>
                              handleToggleAttendance(event.event_id, e)
                            }
                            disabled={attendingLoading.has(event.event_id)}
                            sx={{
                              backgroundColor: userAttending.has(event.event_id)
                                ? "transparent"
                                : "#667eea",
                              color: userAttending.has(event.event_id)
                                ? "#667eea"
                                : "white",
                              borderColor: "#667eea",
                              borderWidth: 2,
                              padding: "10px 24px",
                              fontSize: "0.95rem",
                              fontWeight: 600,
                              borderRadius: 2,
                              textTransform: "none",
                              boxShadow: userAttending.has(event.event_id)
                                ? "none"
                                : "0 2px 8px rgba(102, 126, 234, 0.3)",
                              "&:hover": {
                                backgroundColor: userAttending.has(
                                  event.event_id
                                )
                                  ? "rgba(102, 126, 234, 0.1)"
                                  : "#5568d3",
                                borderColor: "#5568d3",
                                boxShadow: userAttending.has(event.event_id)
                                  ? "none"
                                  : "0 4px 12px rgba(102, 126, 234, 0.4)",
                              },
                            }}
                          >
                            {attendingLoading.has(event.event_id)
                              ? "Loading..."
                              : userAttending.has(event.event_id)
                                ? "Unattend"
                                : "Attend"}
                          </Button>
                        )}
                      </Box>
                    )}

                    {/* Description Section */}
                    <Box
                      sx={{
                        marginBottom: 3,
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(102, 126, 234, 0.15)",
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          marginBottom: 1.5,
                          color: "#9bb5ff",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <EventIcon sx={{ fontSize: "1.2rem" }} />
                        Description
                      </Typography>
                      {event.event_description ? (
                        <Typography
                          variant="body1"
                          sx={{
                            color: "rgba(255, 255, 255, 0.9)",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.7,
                          }}
                        >
                          {event.event_description}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontStyle: "italic",
                          }}
                        >
                          No description provided
                        </Typography>
                      )}
                    </Box>

                    {/* Attendees Section */}
                    <Box
                      sx={{
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(102, 126, 234, 0.15)",
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          marginBottom: 1.5,
                          color: "#9bb5ff",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <PeopleIcon sx={{ fontSize: "1.2rem" }} />
                        Who&apos;s Attending
                      </Typography>
                      {event.participants && event.participants.length > 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1.5,
                                color: "rgba(255, 255, 255, 0.8)",
                                fontWeight: 500,
                              }}
                            >
                              {event.participants.length}{" "}
                              {event.participants.length === 1
                                ? "person is"
                                : "people are"}{" "}
                              attending
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              {event.participants.map((participant) => (
                                <Chip
                                  key={participant.user_id}
                                  label={participant.username}
                                  size="medium"
                                  sx={{
                                    backgroundColor: "#9bb5ff",
                                    color: "#1a1a1a",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    height: "32px",
                                    "&:hover": {
                                      backgroundColor: "#b8cfff",
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontStyle: "italic",
                          }}
                        >
                          No attendees yet
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

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
