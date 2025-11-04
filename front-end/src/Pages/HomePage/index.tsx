import Box from "@mui/material/Box";
import { useAuth } from "../../AuthContext";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { TodayEvent } from "../../const";
import EventCard from "../../components/EventCard";

const HomePage = () => {
  const { user: authUser } = useAuth();
  const today = new Date();
  const userName = authUser ? authUser.username : "Guest";
  const todayEvents: TodayEvent[] = [
    {
      eventID: 1,
      eventName: "Morning Yoga",
      eventTime: "08:00 AM",
      organizerName: "Alice",
      eventDescription: "Start your day with yoga.",
      groupName: "Wellness Group",
    },
    {
      eventID: 2,
      eventName: "GYM Session",
      eventTime: "10:00 AM",
      organizerName: "Bob",
      eventDescription: "GYMMMM",
      groupName: "Fitness Group",
      location: "Local Gym",
    },
    {
      eventID: 3,
      eventName: "Book Club Meeting",
      eventTime: "02:00 PM",
      organizerName: "Carol",
      eventDescription: "Discussing 'The Great Gatsby'.",
      groupName: "Book Lovers",
    },
    {
      eventID: 4,
      eventName: "Cooking Workshop",
      eventTime: "05:00 PM",
      organizerName: "Dave",
      eventDescription: "Learn to cook Italian cuisine.",
      groupName: "Culinary Arts",
      location: "Community Center",
    },
    {
      eventID: 5,
      eventName: "Evening Run",
      eventTime: "07:00 PM",
      organizerName: "Eve",
      eventDescription: "Group run in the park.",
      groupName: "Runners Club",
    }
  ];

  console.log("HomePage - authUser:", authUser);
  return (
    <Box
      sx={{
        display: "flex",
        alignContent: "space-between",
        flexDirection: "column",
        width: "100%",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flexGrow: 2,
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          sx={{ paddingTop: 4, fontWeight: "normal" }}
        >
          Hello, {userName}!
        </Typography>
        <Typography component="h2" variant="h5" sx={{ lineHeight: "normal" }}>
          Today is{" "}
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          .
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography
          component="h2"
          variant="h4"
          sx={{ paddingTop: 2, fontWeight: "bold" }}
        >
          {`Today's Events`}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {todayEvents.map((event) => (
          <Grid size={3} key={event.eventID}>
            <EventCard event={event} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage;
