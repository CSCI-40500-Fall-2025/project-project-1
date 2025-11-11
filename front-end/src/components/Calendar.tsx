import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import { RRule } from "rrule";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './Calendar.css';
import { upsertCalendar, getCalendar } from "../services/calendarServices";
import type { CalendarEvent, RecurrenceRule } from "../const";
import { Dialog, TextField, Button, Select, MenuItem } from "@mui/material";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);

// interface MyEvent {
//   start: Date;
//   end: Date;
//   title: string;
//   rrule?: Partial<RRuleOptions>; // { freq: RRule.WEEKLY, count: 5, }
// }

const CustomToolbar = (toolbar: any) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
                <button type="button" onClick={() => toolbar.onNavigate('TODAY')}>Today</button>
        <button type="button" onClick={() => toolbar.onNavigate('PREV')}>&lt;</button>
        <button type="button" onClick={() => toolbar.onNavigate('NEXT')}>&gt;</button>
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

// const CustomEvent = ({ event }: { event: MyEvent }) => {
//   const tooltipContent = `${event.title}<br>${moment(event.start).format('MMM D, YYYY h:mm A')} to ${moment(event.end).format('h:mm A')}`;
//   return (
//     <div data-tooltip-id="event-tooltip" data-tooltip-html={tooltipContent}>
//       {event.title}
//     </div>
//   );
// };

export default function ReactBigCalendar() {
  const [eventsData, setEventsData] = useState<CalendarEvent[]>([
    { // Sample event with recurrence 
      title: "Weekly Meeting",
      start: new Date(2025, 10, 3, 10, 0),
      end: new Date(2025, 10, 3, 11, 0),
      rrule: {
        freq: RRule.DAILY,
        count: 10,
      },
    }
  ]);
  const [currentView, setCurrentView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<CalendarEvent>({ 
    title: "",
    start: new Date(),
    end: new Date(),
    rrule: undefined,
  });

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setShowModal(true);
    setNewEvent({ title: "", start, end, rrule: undefined });
  };

  const handleSubmit = () => {
    const mapFreq = {1: RRule.DAILY, 2: RRule.WEEKLY, 3: RRule.MONTHLY};
    let rrule: RecurrenceRule | undefined;
    if (newEvent.rrule?.freq === -1) {
      rrule = undefined; // No recurrence
    } else if (newEvent.rrule) {
      const freqKey = newEvent.rrule.freq as 1 | 2 | 3; // cast to literal key type
      rrule = { ...newEvent.rrule, freq: mapFreq[freqKey] };
    }
     
    const new_event: CalendarEvent = { ...newEvent, rrule };
    const updatedEvents = [...eventsData, new_event];
    setEventsData(updatedEvents);
    upsertCalendar(updatedEvents).catch(err => console.error(err));
    setShowModal(false);
  }

  const handleEditEvent = (clickedEvent: CalendarEvent) => {
    // current just deleting :D
    // THOUGHTS: add an id to each event OR make event titles unique per user to identify them
    const updatedEvents = eventsData.filter(event => event.title !== clickedEvent.title);
    setEventsData(updatedEvents);
    upsertCalendar(updatedEvents).catch(err => console.error(err));
  }

  //Fetch calendar data on component mount
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const events  = await getCalendar();
        // console.log("Fetched calendar events:", events);
        const parsedEvents = events.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEventsData(parsedEvents);
      } catch (err) {
        console.error("Failed to load calendar:", err);
      }
    };

    fetchCalendar();
  }, []);

  function expandRecurringEvents(events: CalendarEvent[]) {
    const expanded: CalendarEvent[] = [];

    events.forEach((event) => {
      if (event.rrule) { //if event has a recurrence rule specified by rrule property
        const rule = new RRule({ //creates a RRule instance with {freq, count, dtstart}
          ...event.rrule,
          dtstart: event.start,
        });

        const occurrences = rule.all(); //generate all recurrence dates that match the rule.

        occurrences.forEach((date) => { //for each occurrence date, create a new event instance
          const duration = event.end.getTime() - event.start.getTime();
          expanded.push({
            ...event,
            start: new Date(date),
            end: new Date(date.getTime() + duration),
          });
        });
      } else { //event without recurrence
        expanded.push(event);
      }
    });

    return expanded;
  }

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
        components={{
          toolbar: CustomToolbar,
          // event: CustomEvent
        }}
      />
      {/* <Tooltip id="event-tooltip" /> */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <TextField label="Event title" value={newEvent.title} onChange={(e) =>
          setNewEvent((prev) => ({ ...prev, title: e.target.value} ))
        }/>
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
              freq: prev.rrule?.freq || 0,
              count: parseInt(e.target.value, 10) || 0
            }
          }))
        }/>
        <Button onClick={handleSubmit}>Add Event</Button>
      </Dialog>
    </div>
    
  );
}
