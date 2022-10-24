import React, { createContext }from "react";
import { User } from "../interfaces";

export const userContext = createContext<User | null>(null);