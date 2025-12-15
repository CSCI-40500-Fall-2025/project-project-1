import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { useAuth } from "../../AuthContext";
import { Typography, Paper, CircularProgress } from "@mui/material";
import type { TodayEvent, Event } from "../../const";
import EventCard from "../../components/EventCard";
import EventIcon from "@mui/icons-material/Event";
import { getUserEvents } from "../../services/calendarServices";
import {
  getUserGroups,
  type Group as ApiGroup,
} from "../../services/groupServices";

const HomePage = () => {
  const { user: authUser } = useAuth();
  const userName = authUser ? authUser.username : "Guest";
  const [todayEvents, setTodayEvents] = useState<TodayEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<TodayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayEvents = async () => {
      if (!authUser?.userID) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user events and groups in parallel
        const [events, groups] = await Promise.all([
          getUserEvents(),
          getUserGroups(authUser.userID),
        ]);

        // Create a map of group_id -> group_name
        const groupMap = new Map<string, string>();
        (groups as ApiGroup[]).forEach((group) => {
          if (group.group_id) {
            groupMap.set(group.group_id, group.group_name);
          }
        });

        // Get today's date boundaries (start and end of day)
        const today = new Date();
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        // Helper function to transform Event to TodayEvent
        const transformEvent = (event: Event, index: number): TodayEvent => {
          const eventDate = new Date(event.event_datetime || event.start_time);
          const isToday = eventDate >= todayStart && eventDate <= todayEnd;

          const timeString = isToday
            ? eventDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : eventDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

          // Get group name if event has a group_id
          const groupName = event.group_id
            ? groupMap.get(event.group_id) || "Personal Event"
            : "Personal Event";

          return {
            eventID: index + 1,
            eventName: event.event_title,
            eventTime: timeString,
            organizerName: event.host_username || "Unknown",
            eventDescription: event.event_description || "No description",
            location: event.location || undefined,
            groupName: groupName,
          };
        };

        // Filter and transform events
        const allTransformedEvents = events
          .map((event: Event, index: number) => ({
            event,
            transformed: transformEvent(event, index),
            eventDate: new Date(event.event_datetime || event.start_time),
          }))
          .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

        // Separate today's events and upcoming events
        const todayEventsList: TodayEvent[] = allTransformedEvents
          .filter(
            ({ eventDate }) => eventDate >= todayStart && eventDate <= todayEnd
          )
          .map(({ transformed }) => transformed);

        const upcomingEventsList: TodayEvent[] = allTransformedEvents
          .filter(({ eventDate }) => eventDate > todayEnd)
          .map(({ transformed }) => transformed)
          .slice(0, 10); // Limit to next 10 upcoming events

        setTodayEvents(todayEventsList);
        setUpcomingEvents(upcomingEventsList);
      } catch (err) {
        console.error("Error fetching today's events:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch events. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTodayEvents();
  }, [authUser?.userID]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: 3,
        gap: 4,
      }}
    >
      {/* Welcome Section */}
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Typography
          component="h1"
          variant="h3"
          sx={{
            fontWeight: 700,
            marginBottom: 1,
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          Hello, {userName}!
        </Typography>
        <Typography
          component="h2"
          variant="h6"
          sx={{
            opacity: 0.95,
            fontWeight: 400,
          }}
        >
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Paper>

      {/* Today's Events Section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            marginBottom: 3,
          }}
        >
          <EventIcon sx={{ fontSize: "2rem", color: "#667eea" }} />
          <Typography
            component="h2"
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            Today&apos;s Events
          </Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 6,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper
            elevation={2}
            sx={{
              padding: 4,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "rgba(211, 47, 47, 0.1)",
              border: "2px dashed rgba(211, 47, 47, 0.3)",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "error.main", marginBottom: 1 }}
            >
              Error loading events
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {error}
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Today's Events */}
            {todayEvents && todayEvents.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                  },
                  marginBottom: 4,
                }}
              >
                {todayEvents.map((event, index) => (
                  <EventCard key={`today-${index}`} event={event}></EventCard>
                ))}
              </Box>
            ) : (
              <Paper
                elevation={2}
                sx={{
                  padding: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                  border: "2px dashed rgba(102, 126, 234, 0.3)",
                  marginBottom: 4,
                }}
              >
                <EventIcon
                  sx={{
                    fontSize: 80,
                    color: "rgba(102, 126, 234, 0.5)",
                    marginBottom: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    marginBottom: 1,
                  }}
                >
                  No events today
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  You have a free day! Enjoy your time.
                </Typography>
              </Paper>
            )}

            {/* Upcoming Events */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    marginBottom: 3,
                  }}
                >
                  <EventIcon sx={{ fontSize: "2rem", color: "#667eea" }} />
                  <Typography
                    component="h2"
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    Upcoming Events
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                      xl: "repeat(4, 1fr)",
                    },
                  }}
                >
                  {upcomingEvents.map((event, index) => (
                    <EventCard
                      key={`upcoming-${index}`}
                      event={event}
                    ></EventCard>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
