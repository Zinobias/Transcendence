import React, { createContext } from "react";
import socketIOClient from "socket.io-client";

export const socket = socketIOClient("http://f1r3s14.codam.nl:8084");
export const SocketContext = createContext(socket);