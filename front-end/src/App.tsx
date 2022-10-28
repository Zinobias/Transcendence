import React, { ReactNode, useState, useEffect, useContext } from 'react';
import './App.css';
import { SocketContext } from './components/Socket';
import Routing from './components/Routing';

// import { useCookies } from 'react-cookie';

const App: React.FC = () => {

  const socket = useContext(SocketContext);

  //strict mode makes useEffect fire twice in developer mode
//   useEffect(() => {
// 	  socket.on("msgToClient", data => {
// 		  console.log(data + "client");
// 	  });
//   }, []) //only re-run the effect if new message comes in

  return (
    <SocketContext.Provider value={socket}>
        <Routing />    
    </SocketContext.Provider>
  );

}

export default App;
