import { useState } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import { RRule, type Options as RRuleOptions } from "rrule";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './Calendar.css';

moment.locale("en-GB");
const localizer = momentLocalizer(moment);

// Define your event type (can extend react-big-calendar's Event if needed)
interface MyEvent {
  start: Date;
  end: Date;
  title: string;
  rrule?: Partial<RRuleOptions>; // { freq: RRule.WEEKLY, count: 5, }
}

export default function ReactBigCalendar() {
  const [eventsData, setEventsData] = useState<MyEvent[]>([
    { // Sample event with recurrence 
      title: "Weekly Meeting",
      start: new Date(2025, 10, 3, 10, 0),
      end: new Date(2025, 10, 3, 11, 0),
      rrule: {
        freq: RRule.DAILY,
        count: 3,
      },
    }
  ]);
  const [currentView, setCurrentView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt("New event name:");
    if (!title) return;
    setEventsData((prev) => [...prev, { start, end, title }]);
  };

  function expandRecurringEvents(events: MyEvent[]) {
    const expanded: MyEvent[] = [];

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
      <style>
      </style>
      <Calendar<MyEvent>
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
        onSelectEvent={(event: MyEvent) => alert(JSON.stringify(event))}
        onSelectSlot={handleSelect}
      />
    </div>
  );
}
