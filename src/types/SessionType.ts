import { ChatType, UserType } from "./index";

type SessionType = {
    id: string;
    name: string;
    host: string;
    chats: ChatType[];
    users: UserType[];
};

export default SessionType;
