import { ReactNode, useReducer } from "react";
import reducer from "../reducer/reducer";
import { SessionContext } from "./SessionContext";
import { StateType } from "../types/index";

export const initialState: StateType = {
    session: {
        id: "",
        name: "",
        host: "",
    },
    userName: "",
    hostStream: new MediaStream(),
    participants: [],
    isLoading: {
        login: false,
        session: true,
    },
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <SessionContext.Provider value={{ state, dispatch }}>
            {children}
        </SessionContext.Provider>
    );
};
