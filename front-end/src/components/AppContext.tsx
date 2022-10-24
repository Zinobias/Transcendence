
import React, { createContext } from "react";
import socketIOClient from "socket.io-client";

export const AppContext = createContext({
    user: {init: false},
    socket: socketIOClient("http://localhost:8080"),
})