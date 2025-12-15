import Box from "@mui/material/Box";
import ReactBigCalendar from "../../components/Calendar";
import { TextField, Button } from "@mui/material";
import React, { useState } from "react";
import moment from "moment";
import { getTimeSlotRecommendations, type TimeSlotRecommendation } from "../../services/mlServices";
import { getUserEvents } from "../../services/calendarServices";

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
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [openSlot, setOpenSlot] = useState<{ start: string; end: string } | null>(null);
  
  const handleDateSelect = (start: Date, end: Date) => {
    setFormData(prev => ({
      ...prev,
      event_datetime: moment(start).format('YYYY-MM-DDTHH:mm'),
      event_end_datetime: moment(end).format('YYYY-MM-DDTHH:mm'),
    }));
  };

  const handleGetRecommendations = async () => {
    // Validate that title is provided
    if (!formData.event_title || formData.event_title.trim() === '') {
      alert('Please enter an event title before getting recommendations');
      return;
    }
    
    setLoadingRecommendations(true);
    
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const events = await getUserEvents();
      const existingEvents = events.map(event => ({
        // Prefer explicit ISO start/end fields for the ML service
        start_time: event.start_time ? new Date(event.start_time).toISOString() : (event.event_datetime ? new Date(event.event_datetime).toISOString() : undefined),
        end_time: event.end_time ? new Date(event.end_time).toISOString() : (event.event_datetime ? new Date(new Date(event.event_datetime).getTime() + 60 * 60 * 1000).toISOString() : undefined),
        event_title: event.event_title,
        location: event.location || undefined,
      }));
      
      const response = await getTimeSlotRecommendations({
        user_id: "current_user",
        existing_events: existingEvents,
        date_range_start: startDate.toISOString(),
        date_range_end: endDate.toISOString(),
        duration_hours: 1,
        event_title: formData.event_title,  // Send event title for semantic analysis
        event_description: formData.event_description,  // Send description for semantic analysis
      });
      
      if (response.success && response.recommendations.length > 0) {
        // Automatically create event with the best recommendation (highest score)
        const bestRecommendation = response.recommendations[0];
        await handleAutoCreateEvent(bestRecommendation);
      } else {
        alert('No available time slots found. Please try a different date range.');
      }
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      alert('Failed to schedule event. Please try again.');
    } finally {
      setLoadingRecommendations(false);
    }
  };



  const handleAutoCreateEvent = async (recommendation: TimeSlotRecommendation) => {
    if (!formData.event_title || formData.event_title.trim() === '') {
      alert('Event title is required');
      return;
    }

    try {
      setLoadingRecommendations(true);
      const start = new Date(recommendation.datetime);
      // Use the ML-predicted duration
      const durationHours = recommendation.duration_hours || 1;
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

      // Call backend API directly with frontend's authentication
      const response = await fetch('https://project-project-1.onrender.com/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          event_title: formData.event_title,
          event_description: formData.event_description || '',
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          location: formData.location || '',
          event_datetime: start.toISOString(),
          attendees: 1
        })
      });

      if (response.ok) {
        await response.json();
        alert(`✅ Event "${formData.event_title}" created successfully at ${moment(start).format('MMM D, h:mm A')}!`);
        
        // Log to ML service for future learning (fire and forget)
        fetch('http://localhost:5001/api/ml/log-accepted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_title: formData.event_title,
            event_description: formData.event_description || '',
            start_time: start.toISOString(),
            end_time: end.toISOString()
          })
        }).catch(() => {}); // Ignore errors
        
        // Refresh calendar to show new event
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to create event: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Auto-create error:', error);
      alert('Failed to automatically create event. Please try manual creation.');
    } finally {
      setLoadingRecommendations(false);
    }
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
          gap: 1.5,
          marginRight: 4,
          marginTop: 10,
          backgroundColor: "#6447ccff",
          height: "60%",
          justifyContent: "center",
          alignItems: "center",
          width: 500,
          borderRadius: 5,
          boxShadow: 5
        }}
        onSubmit={handleSubmit}
      >
        <Button
          variant="contained"
          onClick={handleGetRecommendations}
          disabled={loadingRecommendations}
          sx={{
            color: "white",
            backgroundColor: 'rgb(221, 47, 120)',
            '&:hover': {
              backgroundColor: '#da4cceff',
            },
            mb: 2,
          }}
        >
          {loadingRecommendations ? 'Creating Event...' : 'Smart Schedule'}
        </Button>
        <TextField
          label="Title"
          name="event_title"
          value={formData.event_title}
          onChange={handleChange}
        />
        <TextField
          label="Description"
          name="event_description"
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
      <ReactBigCalendar onDateSelect={handleDateSelect} openAt={openSlot} />
    </Box>

  );
};

export default FirstPage;
