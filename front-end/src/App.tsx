import { useState, useEffect } from 'react'
import { testUser } from './services/userServices'
import './App.css'

function App() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    testUser("King Julian")
      .then((res) => setMessage(res.message))
      .catch((err) => setMessage(err.message))
  }, []) // runs once on mount

  return (
    <>
      <div>Bing Bong</div>
      <div>{message}</div>
    </>
  )
}

export default App
