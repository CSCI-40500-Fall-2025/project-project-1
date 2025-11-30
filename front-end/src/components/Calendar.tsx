import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import { RRule } from "rrule";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './Calendar.css';
import { getUserEvents, createEvent, updateEvent } from "../services/calendarServices";
import type { CalendarEvent, Event } from "../const";
import { Dialog, TextField, Button, Select, MenuItem } from "@mui/material";
import { Tooltip } from 'react-tooltip';
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";


moment.locale("en-GB");
const localizer = momentLocalizer(moment);

const CustomToolbar = (toolbar: any) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => toolbar.onNavigate('TODAY')}>Today</button>
        <button type="button" onClick={() => toolbar.onNavigate('PREV')}><BsChevronCompactLeft style={{fontSize: '25px'}}/></button>
        <button type="button" onClick={() => toolbar.onNavigate('NEXT')}><BsChevronCompactRight style={{fontSize: '25px'}}/></button>
      </span>
      <span className="rbc-toolbar-label">{toolbar.label}</span>
      <span className="rbc-btn-group">
        <button type="button" className={toolbar.view === 'month' ? 'rbc-active' : ''} onClick={() => toolbar.onView('month')}>Month</button>
        <button type="button" className={toolbar.view === 'week' ? 'rbc-active' : ''} onClick={() => toolbar.onView('week')}>Week</button>
        <button type="button" className={toolbar.view === 'day' ? 'rbc-active' : ''} onClick={() => toolbar.onView('day')}>Day</button>
        <button type="button" className={toolbar.view === 'agenda' ? 'rbc-active' : ''} onClick={() => toolbar.onView('agenda')}>Agenda</button>
      </span>
    </div>
  );
};

const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  const tooltipContent = `
    <div style="font-weight: bold; margin-bottom: 8px;">${event.title}</div>
    <div style="margin-bottom: 4px;"><strong>Date:</strong> ${moment(event.start).format('MMM D, YYYY')}</div>
    <div style="margin-bottom: 4px;"><strong>Start Time:</strong> ${moment(event.start).format('h:mm A')}</div>
    <div style="margin-bottom: 4px;"><strong>End Time:</strong> ${moment(event.end).format('h:mm A')}</div>
    <div><strong>Additional Information:</strong> ${event.rrule ? `Repeats ${event.rrule.freq === 1 ? 'daily' : event.rrule.freq === 2 ? 'weekly' : event.rrule.freq === 3 ? 'monthly' : 'custom'} (${event.rrule.count} times)` : 'One-time event'}</div>
  `;
  return (
    <div data-tooltip-id="event-tooltip" data-tooltip-html={tooltipContent}>
      {event.title}
    </div>
  );
};

export default function ReactBigCalendar() {
  const [eventsData, setEventsData] = useState<CalendarEvent[]>([
    { // Sample event with recurrence 
      start: new Date(2025, 10, 3, 10, 0),
      end: new Date(2025, 10, 3, 11, 0),
      title: "Weekly Meeting",
      Event: {      
        event_id: "",
        group_id: null,
        event_title: "Weekly Meeting",
        event_description: "test",
        location: "room 101",
        event_datetime: "2025-12-01T10:00:00",
        event_host: "rydhrtshrthstshertsh",
        attendees: 5,
        start_time: new Date(2025, 10, 3, 10, 0),
        end_time: new Date(2025, 10, 3, 11, 0),
        rrule: {
          freq: RRule.DAILY,
          count: 10,
        }
      },
    }
  ]);
  const [currentView, setCurrentView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({ 
    event_id: "",
    group_id: null,
    event_title: "",
    event_description: "q",
    location: "",
    event_datetime: "",
    event_host: "",
    attendees: 0,
    start_time: new Date(),
    end_time: new Date(),
    rrule: null,
  });

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setShowModal(true);
    setNewEvent({ 
      event_id: "",
      group_id: null,
      event_title: "",
      event_description: "",
      location: "",
      event_datetime: "",
      event_host: "",
      attendees: 0,
      start_time: start,
      end_time: end,
      rrule: undefined,
    });
  };

  const handleSubmit = () => {
    // Editing existing event (new events have no id)
    if (newEvent.event_id !== "" ) {
      updateEvent(newEvent.event_id, 
        {
          event_title: newEvent.event_title,
          event_description: newEvent.event_description,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
          rrule: newEvent.rrule,
          location: newEvent.location,
        }
      ).then((updatedEvent) => { //after updating event successfully on backend, update local state
        setEventsData((prev) => {
          const filteredEvents = prev.filter(event => event.Event.event_id !== updatedEvent.event_id);
          return [
            ...filteredEvents,
            {
              start: new Date(updatedEvent.start_time),
              end: new Date(updatedEvent.end_time),
              title: updatedEvent.event_title,
              Event: updatedEvent
            },
          ];
        });
        fetchCalendar(); //rerender for expandrecurring events
      }).catch((err) => {
        console.error("Failed to update event:", err);
      });
    } else { // Creating new event
        createEvent(newEvent).then((createdEvent) => {
          console.log("Event created successfully:", createdEvent);
          setEventsData((prev) => [
            ...prev,
            {
              start: new Date(createdEvent.start_time),
              end: new Date(createdEvent.end_time),
              title: createdEvent.event_title,
              Event: createdEvent
            },
          ]);
          fetchCalendar(); //rerender for expandrecurring events
        }).catch((err) => {
          console.error("Failed to create event:", err);
        });
    }

    setShowModal(false);
  }

  const handleEditEvent = (clickedEvent: CalendarEvent) => {
    console.log("Editing event:", clickedEvent);
    setNewEvent({
      event_id: clickedEvent.Event.event_id,
      group_id: clickedEvent.Event.group_id,
      event_title: clickedEvent.Event.event_title,
      event_description: clickedEvent.Event.event_description,
      location: clickedEvent.Event.location,
      event_datetime: clickedEvent.Event.event_datetime,
      event_host: clickedEvent.Event.event_host,
      attendees: clickedEvent.Event.attendees,
      start_time: clickedEvent.originalStart ? clickedEvent.originalStart : clickedEvent.start,
      end_time: clickedEvent.originalEnd ? clickedEvent.originalEnd : clickedEvent.end,
      rrule: clickedEvent.Event.rrule || undefined,
    });

    setShowModal(true);
  }

  const fetchCalendar = async () => {
    try {
      const events = await getUserEvents(); 
      
      const parsedEvents = events.map(event => ({
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        title: event.event_title,
        rrule: event.rrule || undefined,
        Event: event
      }));
      
      setEventsData(parsedEvents); 
    } catch (err) {
      console.error("Failed to load calendar:", err);
    }
  };
  //Fetch calendar data on component mount
  useEffect(() => {
    fetchCalendar();
  }, []);

  function formatDateTimeLocal(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 0-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function expandRecurringEvents(events: CalendarEvent[]) {
    const expanded: CalendarEvent[] = [];

    const freqMap = {
      1: RRule.DAILY,
      2: RRule.WEEKLY,
      3: RRule.MONTHLY,
    };

    events.forEach((event) => {
      // Recurring event
      if (event.rrule && event.rrule.freq !== -1) {
        const rule = new RRule({
          ...event.rrule,
          freq: freqMap[event.rrule.freq as 1 | 2 | 3],
          dtstart: new Date(event.start), 
        });
        
        const duration = event.end.getTime() - event.start.getTime();
        //generate all occurrences based on rrule and put them in expanded array
        rule.all().forEach((occurrence) => {
          expanded.push({
            ...event,
            start: new Date(occurrence),
            end: new Date(occurrence.getTime() + duration),
            originalStart: new Date(event.start),
            originalEnd: new Date(event.end), 
            Event: { ...event.Event },
          });
        });

        return;
      }

      // Non-recurring event -> clone anyway
      expanded.push({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        Event: { ...event.Event },
      });
    });

    return expanded;
  }

  // function expandRecurringEvents(events: CalendarEvent[]) {
  //   const expanded: CalendarEvent[] = [];
  //   const freqMap = {
  //     1: RRule.DAILY,
  //     2: RRule.WEEKLY,
  //     3: RRule.MONTHLY,
  //   };

  //   events.forEach((event) => {
  //     if (event.rrule && event.rrule.freq != -1) { //if event has a recurrence rule specified by rrule property
  //       const rule = new RRule({ //creates a RRule instance with {freq, count, dtstart}
  //         ...event.rrule,
  //         freq: freqMap[event.rrule.freq as 1 | 2 | 3 ],
  //         dtstart: event.start,
  //       });

  //       const occurrences = rule.all() //generate all recurrence dates that match the rule.

  //       occurrences.forEach((date) => { //for each occurrence date, create a new event instance
  //         const duration = event.end.getTime() - event.start.getTime();
  //         expanded.push({
  //           ...event,
  //           start: new Date(date),
  //           end: new Date(date.getTime() + duration),
  //         });
  //       });
  //     } else { //event without recurrence
  //       expanded.push(event);
  //     }
  //   });

  //   return expanded;
  // }


  return (
    <div className="calendar">
      <Calendar<CalendarEvent>
        views={["day", "agenda", "week", "month"]}
        view={currentView}
        scrollToTime={new Date(1970, 1, 1, 7, 0, 0)}
        onView={(view) => setCurrentView(view)}
        selectable
        startAccessor="start"
        endAccessor="end"
        localizer={localizer}
        date={date}
        onNavigate={setDate}
        events={expandRecurringEvents(eventsData)}
        onSelectEvent={(event: CalendarEvent) => handleEditEvent(event)}
        onSelectSlot={handleSelectSlot}
        tooltipAccessor={null}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent
        }}
      />
      <Tooltip
        className="custom-tooltip"
        id="event-tooltip"
        offset={25} // moves the tooltip up a bit
      />
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <TextField label="Event title" value={newEvent.event_title} onChange={(e) =>
          setNewEvent((prev) => ({ 
            ...prev, 
            event_title: e.target.value,
          }))
        }/>
        <TextField
          label="Event Description"
          value={newEvent.event_description}
          onChange={(e) =>
            setNewEvent((prev) => ({
              ...prev,
              event_description: e.target.value,
            }))
          }
        />
        <TextField label="Location" value={newEvent.location} onChange={(e) =>
          setNewEvent((prev) => ({ 
            ...prev,
            location: e.target.value,
          }))
        }/>

        <TextField
          label="Start Time"
          type="datetime-local"
          value={formatDateTimeLocal(newEvent.start_time)}
          onChange={(e) =>
            setNewEvent((prev) => ({
              ...prev,
              start_time: new Date(e.target.value),
            }))
          }
        />

        <TextField
          label="End Time"
          type="datetime-local"
          value={formatDateTimeLocal(newEvent.end_time)}
          onChange={(e) =>
            setNewEvent((prev) => ({
              ...prev,
              end_time: new Date(e.target.value),
            }))
          }
        />

        <Select value={newEvent.rrule?.freq || -1} onChange={(e) =>
          setNewEvent((prev) => ({ 
            ...prev, 
            rrule: { 
              ...prev.rrule, 
              freq: e.target.value,
              count: prev.rrule?.count || 1
            }
          }))
        }>
          <MenuItem value={-1}>None</MenuItem>
          <MenuItem value={1}>Daily</MenuItem>
          <MenuItem value={2}>Weekly</MenuItem>
          <MenuItem value={3}>Monthly</MenuItem>
        </Select>
        <TextField type="number" label="Count" value={newEvent.rrule?.count || 0} onChange={(e) =>
          setNewEvent((prev) => ({ 
            ...prev,
            rrule: {
              ...prev.rrule,
              freq: prev.rrule?.freq || -1,
              count: parseInt(e.target.value, 10) || 0
            }
          }))
        }/>
        <Button onClick={handleSubmit}>Set Event</Button>
      </Dialog>
    </div>
    
  );
}
