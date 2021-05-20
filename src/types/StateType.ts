import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
import { ChatType, UserType, HostType, QuestionType } from "./index";

type StateType = {
    session: {
        id: string;
        name: string;
        host: HostType;
        users: UserType[];
        chats: ChatType[];
        questions: QuestionType[];
    };
    hostStream: MediaStream | undefined;
    userName: string;
    userSocketId: string;
    socket: Socket<DefaultEventsMap, DefaultEventsMap>;
    isLoading: {
        login: boolean;
        session: boolean;
        sessionChat: boolean;
        sessionQuestion: boolean;
    };
    isError: {
        session: boolean;
        hostMedia: boolean;
        sessionChat: boolean;
        sessionQuestion: boolean;
    };
};

export default StateType;
