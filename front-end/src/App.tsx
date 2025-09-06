import React from "react";
// import { testUser } from "./services/userServices";
import LoginPage from "./Pages/LoginPage";
import HomePage from "./Pages/HomePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";


function App() {
  // const [message, setMessage] = useState("");

  // useEffect(() => {
  //   testUser("King Julian")
  //     .then((res) => setMessage(res.message))
  //     .catch((err) => setMessage(err.message));
  // }, []); // runs once on mount

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route path="/login" element={<LoginPage />} />
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
