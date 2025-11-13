import Box from "@mui/material/Box";
import ReactBigCalendar from "../../components/Calendar";
import { TextField, Button } from "@mui/material";
import React, { useState } from "react";

const FirstPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    location: '',
  });

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
        }}
        onSubmit={handleSubmit}
      >
        <TextField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
        <TextField
          label="Start Time"
          name="start"
          value={formData.start}
          onChange={handleChange}
        />
        <TextField
          label="End Time"
          name="end"
          value={formData.end}
          onChange={handleChange}
        />
        <TextField
          label="Location"
          name="location"
          value={formData.end}
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
      <ReactBigCalendar />
    </Box>

  );
};

export default FirstPage;
