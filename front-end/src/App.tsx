import React, { ReactNode, useState, useEffect, useContext } from 'react';
import './App.css';
import { SocketContext } from './components/Socket';
import Routing from './components/Routing';

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
