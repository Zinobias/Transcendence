import React, { ReactNode, useState, useEffect, useContext } from 'react';
import socketIOClient from "socket.io-client";
import './App.css';
import Login from './components/Login';
import NavBar from './components/NavBar';
import { SocketContext } from './components/Socket';
import Routing from './components/Routing';

const ENDPOINT = "http://localhost:8080";

const App: React.FC = () => {

  const [myBool, setmyBool] = useState<boolean>(true);
  const socket = useContext(SocketContext);
  
  //strict mode makes useEffect fire twice in developer mode
  useEffect(() => {
	  socket.on("msgToClient", data => {
		  console.log(data + "client");
	  });
  }, [])

  return (
    <SocketContext.Provider value={socket}>
          <Routing />    
    </SocketContext.Provider>
  );

}

export default App;
