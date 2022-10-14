import React, { ReactNode, useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import './App.css';
import Login from './components/Login';
import Landing from './components/Landing';
import { socket, SocketContext } from './components/Socket';

const ENDPOINT = "http://localhost:8080";

const App: React.FC = () => {

  const [myBool, setmyBool] = useState<boolean>(true);
  const [response, setResponse] = useState("");

  //console.log("test");
  // const socket = socketIOClient(ENDPOINT);
  // socket.emit("msgToServer", "test");
  // socket.on("msgToClient",data => {
  //   console.log(data);
  //   setResponse(data);
  // });

  return (
    <SocketContext.Provider value={socket}>
      <div className="app"> 
        {myBool ? <Login setmyBool={setmyBool} /> : <Landing /> }
      </div>
    </SocketContext.Provider>
  );

}

export default App;
