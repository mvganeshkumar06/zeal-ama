import { ReactNode, useReducer } from "react";
import reducer from "../reducer/reducer";
import { SessionContext, SessionStateType } from "./SessionContext";

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const initialState: SessionStateType = {
        sessionId: "",
        sessionName: "",
        hostName: "",
    };

    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <SessionContext.Provider value={{ state, dispatch }}>
            {children}
        </SessionContext.Provider>
    );
};
