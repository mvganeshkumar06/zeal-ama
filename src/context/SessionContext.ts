import { createContext } from "react";
import { SessionContextType } from "../types/index";

export const SessionContext =
    createContext<SessionContextType | undefined>(undefined);
