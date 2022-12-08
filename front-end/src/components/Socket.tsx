import React, { createContext } from "react";
import socketIOClient from "socket.io-client";

export const socket = socketIOClient("http://[2a02:a45b:7f00:1:c512:f40c:edd9:1678]:8084");
export const SocketContext = createContext(socket);