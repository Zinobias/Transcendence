import React, { createContext } from "react";
import socketIOClient from "socket.io-client";

export const socket = socketIOClient("http://localhost:8080");
export const SocketContext = React.createContext(socket);