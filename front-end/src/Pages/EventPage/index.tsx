import Box from "@mui/material/Box";
import ReactBigCalendar from "../../components/Calendar";

const EventPage = () => {

  return (
    <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 64px)",
          padding: 2,
        }}
      >
          <ReactBigCalendar />
      </Box>

  );
};

export default EventPage;
