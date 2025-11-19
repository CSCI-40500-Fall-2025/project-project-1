// import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Pages/Layout";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import FriendsPage from "./Pages/FriendsPage";
import ListOfGroupsPage from "./Pages/ListOfGroupsPage";
import GroupPage from "./Pages/GroupPage";
import GroupSettingsPage from "./Pages/GroupSettingsPage";
import GroupEventsPage from "./Pages/GroupEventsPage";
import GroupScheduleEventPage from "./Pages/GroupScheduleEventPage";
import SchedulePage from "./Pages/SchedulePage";
import EventPage from "./Pages/EventPage";
import ProtectedRoute from "./ProtectedRoute";
import LogViewer from "./logviewer";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/logs" element={<LogViewer/>}/>
          <Route path="/" element={<Layout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path ="home" element={<HomePage />} />
              <Route path="friends" element={<FriendsPage />} />
              <Route path="friends/:friendId" element={<FriendsPage />} />
              <Route path="groups" element={<ListOfGroupsPage />} />
              <Route path="events" element={<EventPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="group/:groupId">
                <Route index element={<GroupPage />} />
                <Route path="settings" element={<GroupSettingsPage />} />
                <Route path="events" element={<GroupEventsPage />} />
                <Route
                  path="schedule-event"
                  element={<GroupScheduleEventPage />}
                />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
