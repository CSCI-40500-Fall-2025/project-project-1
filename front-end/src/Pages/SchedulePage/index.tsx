import Box from "@mui/material/Box";
import ReactBigCalendar from "../../components/Calendar";
import { TextField, Button } from "@mui/material";
import React, { useState } from "react";
import moment from "moment";

const FirstPage = () => {
  const [formData, setFormData] = useState({
    group_id: 0,
    event_title: '',
    event_description: '',
    event_datetime: '',
    event_end_datetime: '',
    location: '',
    event_host: 0,
    attendees: '',
  });
  
  const handleDateSelect = (start: Date, end: Date) => {
    setFormData(prev => ({
      ...prev,
      event_datetime: moment(start).format('YYYY-MM-DDTHH:mm'),
      event_end_datetime: moment(end).format('YYYY-MM-DDTHH:mm'),
    }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic
  }
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        height: "calc(100vh - 64px)",
        padding: 2,
      }}
    >
      <Box 
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginRight: 4,
          marginTop: 10,
          backgroundColor: "#7358d8ff",
          height: "calc(100vh - 700px)",
          justifyContent: "center",
          alignItems: "center",
          width: 500,
          borderRadius: 5,
        }}
        onSubmit={handleSubmit}
      >
        <TextField
          label="Title"
          name="title"
          value={formData.event_title}
          onChange={handleChange}
        />
        <TextField
          label="Description"
          name="description"
          value={formData.event_description}
          onChange={handleChange}
        />
        <TextField
          label="Start Date & Time"
          name="event_datetime"
          type="datetime-local"
          value={formData.event_datetime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date & Time"
          name="event_end_datetime"
          type="datetime-local"
          value={formData.event_end_datetime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
        <Button 
          type="submit"
          variant="contained"
          style={{
            backgroundColor: "rgb(221, 47, 120)",
            color: "white",
          }}
        >
          Submit
        </Button>
      </Box>
      <ReactBigCalendar onDateSelect={handleDateSelect} />
    </Box>

  );
};

export default FirstPage;
