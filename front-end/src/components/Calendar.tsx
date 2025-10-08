import { useState } from "react";
import { Calendar, momentLocalizer, type SlotInfo, type View } from "react-big-calendar";
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
}

export default function ReactBigCalendar() {
  const [eventsData, setEventsData] = useState<MyEvent[]>([]);
  const [currentView, setCurrentView] = useState<View>("month");
  const [date, setDate] = useState(new Date());

  const handleSelect = ({ start, end }: SlotInfo) => {
    console.log(start);
    console.log(end);
    const title = window.prompt("New Event name");
    if (title) {
      setEventsData((prev) => [
        ...prev,
        {
          start,
          end,
          title
        }
      ]);
    }
  };

  return (
    <div className="calendar">
      <style>
      </style>
      <Calendar<MyEvent>
        views={["day", "agenda", "work_week", "month"]}
        view={currentView}
        onView={(view) => setCurrentView(view)}
        selectable
        localizer={localizer}
        date={date}
        onNavigate={setDate}
        events={eventsData}
        style={{ 
            height: "80vh",
            padding: "20px 0"
        }}
        onSelectEvent={(event: MyEvent) => alert(event.title)}
        onSelectSlot={handleSelect}
      />
    </div>
  );
}
