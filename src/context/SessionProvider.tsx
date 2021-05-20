import { ReactNode, useReducer } from "react";
import reducer from "../reducer/reducer";
import { SessionContext } from "./SessionContext";
import { StateType } from "../types/index";
import { io } from "socket.io-client";

const socket = io("https://zeal-ama.herokuapp.com");

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
        questions: [],
    },
    userName: "",
    userSocketId: "",
    hostStream: undefined,
    socket: socket,
    isLoading: {
        login: false,
        session: true,
        sessionChat: true,
        sessionQuestion: true,
    },
    isError: {
        session: false,
        hostMedia: false,
        sessionChat: false,
        sessionQuestion: false,
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
