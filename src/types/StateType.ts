import { ChatType, UserType } from "./index";

type StateType = {
    session: {
        id: string;
        name: string;
        host: string;
        users: UserType[];
        chats: ChatType[];
    };
    hostStream: MediaStream | undefined;
    userName: string;
    userSocketId: string;
    isLoading: {
        login: boolean;
        session: boolean;
        sessionChat: boolean;
    };
    isError: {
        session: boolean;
        hostMedia: boolean;
        sessionChat: boolean;
    };
};

export default StateType;
