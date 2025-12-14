import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import { RRule } from "rrule";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";
import "./GroupCalendar.css";
import { getGroupEvents } from "../services/calendarServices";
import type { CalendarEvent } from "../const";
import { Tooltip } from "react-tooltip";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";

moment.locale("en-GB");
const localizer = momentLocalizer(moment);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomToolbar = (toolbar: any) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => toolbar.onNavigate("TODAY")}>
          Today
        </button>
        <button
          type="button"
          onClick={() => toolbar.onNavigate("PREV")}
          title="Previous"
        >
          <BsChevronCompactLeft style={{ fontSize: "25px" }} />
        </button>
        <button
          type="button"
          onClick={() => toolbar.onNavigate("NEXT")}
          title="Next"
        >
          <BsChevronCompactRight style={{ fontSize: "25px" }} />
        </button>
      </span>
      <span className="rbc-toolbar-label">{toolbar.label}</span>
      <span className="rbc-btn-group">
        <button
          type="button"
          className={toolbar.view === "month" ? "rbc-active" : ""}
          onClick={() => toolbar.onView("month")}
        >
          Month
        </button>
        <button
          type="button"
          className={toolbar.view === "week" ? "rbc-active" : ""}
          onClick={() => toolbar.onView("week")}
        >
          Week
        </button>
        <button
          type="button"
          className={toolbar.view === "day" ? "rbc-active" : ""}
          onClick={() => toolbar.onView("day")}
        >
          Day
        </button>
        <button
          type="button"
          className={toolbar.view === "agenda" ? "rbc-active" : ""}
          onClick={() => toolbar.onView("agenda")}
        >
          Agenda
        </button>
      </span>
    </div>
  );
};

const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  const tooltipContent = `
    <div style="font-weight: bold; margin-bottom: 8px;">${event.title}</div>
    <div style="margin-bottom: 4px;"><strong>Date:</strong> ${moment(event.start).format("MMM D, YYYY")}</div>
    <div style="margin-bottom: 4px;"><strong>Start Time:</strong> ${moment(event.start).format("h:mm A")}</div>
    <div style="margin-bottom: 4px;"><strong>End Time:</strong> ${moment(event.end).format("h:mm A")}</div>
    ${event.Event && event.Event.event_description ? `<div style="margin-bottom: 6px;"><strong>Description:</strong> ${event.Event.event_description}</div>` : ""}
    ${event.Event && event.Event.location ? `<div style="margin-bottom: 4px;"><strong>Location:</strong> ${event.Event.location}</div>` : ""}
    ${event.Event && event.Event.host_username ? `<div style="margin-bottom: 4px;"><strong>Host:</strong> ${event.Event.host_username}</div>` : ""}
    <div><strong>Additional Information:</strong> ${event.rrule ? `Repeats ${event.rrule.freq === 1 ? "daily" : event.rrule.freq === 2 ? "weekly" : event.rrule.freq === 3 ? "monthly" : "custom"} (${event.rrule.count} times)` : "One-time event"}</div>
  `;
  return (
    <div data-tooltip-id="event-tooltip" data-tooltip-html={tooltipContent}>
      {event.title}
    </div>
  );
};

interface GroupCalendarProps {
  groupId: string;
}

export default function GroupCalendar({ groupId }: GroupCalendarProps) {
  const [eventsData, setEventsData] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<View>("week");
  const [date, setDate] = useState(new Date());

  const fetchCalendar = async () => {
    try {
      const events = await getGroupEvents(groupId);
      console.log("Fetched events for calendar:", events);

      const parsedEvents: CalendarEvent[] = [];

      events.forEach((event) => {
        // Try multiple date fields - start_time, end_time, or event_datetime
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        // Try start_time first
        if (event.start_time) {
          startDate =
            event.start_time instanceof Date
              ? event.start_time
              : new Date(event.start_time);
        }
        // Fallback to event_datetime if start_time is not available
        else if (event.event_datetime) {
          startDate = new Date(event.event_datetime);
        }

        // Try end_time first
        if (event.end_time) {
          endDate =
            event.end_time instanceof Date
              ? event.end_time
              : new Date(event.end_time);
        }
        // Fallback: if we have startDate but no endDate, use startDate + 1 hour
        else if (startDate) {
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
        }

        // Check if dates are valid
        if (
          startDate &&
          endDate &&
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime())
        ) {
          parsedEvents.push({
            start: startDate,
            end: endDate,
            title: event.event_title,
            rrule: event.rrule || undefined,
            Event: event,
          });
        } else {
          console.warn("Invalid date for event:", event, {
            start_time: event.start_time,
            end_time: event.end_time,
            event_datetime: event.event_datetime,
          });
        }
      });

      console.log("Parsed events for calendar:", parsedEvents);
      setEventsData(parsedEvents);
    } catch (err) {
      console.error("Failed to load group calendar:", err);
    }
  };

  // Fetch calendar data on component mount
  useEffect(() => {
    if (groupId) {
      fetchCalendar();
    }
  }, [groupId]);

  function expandRecurringEvents(events: CalendarEvent[]) {
    const expanded: CalendarEvent[] = [];

    events.forEach((event) => {
      if (event.rrule && event.Event.rrule) {
        const rule = new RRule({
          freq: event.rrule.freq,
          count: event.rrule.count,
          dtstart: event.start,
        });

        const occurrences = rule.all();
        occurrences.forEach((date) => {
          const duration = event.end.getTime() - event.start.getTime();
          expanded.push({
            ...event,
            start: new Date(date),
            end: new Date(date.getTime() + duration),
            originalStart: event.start,
            originalEnd: event.end,
          });
        });
      } else {
        expanded.push(event);
      }
    });

    return expanded;
  }

  return (
    <div className="calendar group-calendar-container">
      <Calendar<CalendarEvent>
        views={["day", "agenda", "week", "month"]}
        view={currentView}
        scrollToTime={new Date(1970, 1, 1, 7, 0, 0)}
        onView={(view) => setCurrentView(view)}
        startAccessor="start"
        endAccessor="end"
        localizer={localizer}
        date={date}
        onNavigate={setDate}
        events={expandRecurringEvents(eventsData)}
        tooltipAccessor={null}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
      />
      <Tooltip className="custom-tooltip" id="event-tooltip" offset={25} />
    </div>
  );
}
