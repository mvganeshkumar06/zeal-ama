import { ReactNode, useReducer } from "react";
import reducer from "../reducer/reducer";
import { SessionContext } from "./SessionContext";
import { StateType } from "../types/index";

export const initialState: StateType = {
    session: {
        id: "",
        name: "",
        host: {
            socketId: "",
            name: "",
        },
        chats: [],
        users: [],
    },
    userName: "",
    userSocketId: "",
    hostStream: undefined,
    isLoading: {
        login: false,
        session: true,
        sessionChat: true,
    },
    isError: {
        session: false,
        hostMedia: false,
        sessionChat: false,
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
