import React, { createContext } from "react";

export type SessionStateType = {
    sessionId: string;
    sessionName: string;
    hostName: string;
};

export type SessionContextType ={
    state:SessionStateType,
    dispatch:React.Dispatch<any>,
}

export const SessionContext = createContext<SessionContextType | null>(null);