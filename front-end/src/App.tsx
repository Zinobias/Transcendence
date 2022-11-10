import React, { useContext } from 'react';
import './App.css';
import { SocketContext } from './components/Socket';
import Routing from './components/Routing';


const App: React.FC = () => {

  const socket = useContext(SocketContext);

  return (
    <SocketContext.Provider value={socket}>
        <Routing />    
    </SocketContext.Provider>
  );

}

export default App;
