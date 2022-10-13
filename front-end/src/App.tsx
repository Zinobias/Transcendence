import React, { ReactNode, useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import './App.css';
import Login from './components/Login';
import Landing from './components/Landing';

const ENDPOINT = "http://chat-app:8080";

const App: React.FC = () => {

  const [myBool, setmyBool] = useState<boolean>(true);
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("msgToClient", data => {
      socket.emit("msgToServer", "test");
      console.log(data);
      setResponse(data);
    });
  }, []);

  return (
    <div className="app"> 
      {myBool ? <Login setmyBool={setmyBool} /> : <Landing /> }
    </div>
  );
}

export default App;
