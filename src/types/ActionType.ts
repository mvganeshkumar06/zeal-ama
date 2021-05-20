import { SessionType, ChatType, UserType, QuestionType } from "./index";

type ActionType =
    | {
          type:
              | "SET_USERNAME"
              | "SET_SESSION_ID"
              | "SET_SESSION_NAME"
              | "SET_USER_SOCKET_ID"
              | "ADD_PARTICIPANT"
              | "REMOVE_PARTICIPANT";
          payload: string;
      }
    | { type: "SET_SESSION"; payload: SessionType }
    | { type: "SET_SESSION_USERS"; payload: UserType[] }
    | { type: "SET_SESSION_CHATS"; payload: ChatType[] }
    | { type: "SET_SESSION_QUESTIONS"; payload: QuestionType[] }
    | { type: "SET_HOST_STREAM"; payload: MediaStream }
    | {
          type: "SET_IS_LOADING" | "SET_IS_ERROR";
          payload: { [key: string]: boolean };
      };

export default ActionType;
