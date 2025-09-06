import { useState, useEffect } from "react";
import { testUser } from "./services/userServices";
import Navbar from "./components/Navbar";
import LoginPage from "./MainPage";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    testUser("King Julian")
      .then((res) => setMessage(res.message))
      .catch((err) => setMessage(err.message));
  }, []); // runs once on mount

  return (
    <>
      {/* <Navbar />
      <LoginCard />
      <div>Bing Bong</div>
      <div>{message}</div> */}
      <LoginPage />
    </>
  );
}

export default App;
