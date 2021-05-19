import { ChatType, UserType } from "./index";

type SessionType = {
    id: string;
    name: string;
    host: {
        socketId: string;
        name: string;
    };
    chats: ChatType[];
    users: UserType[];
};

export default SessionType;
