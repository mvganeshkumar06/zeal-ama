type SessionType = {
    id: string;
    name: string;
    host: string;
};

type ActionType =
    | {
          type:
              | "SET_USERNAME"
              | "SET_SESSION_ID"
              | "SET_SESSION_NAME"
              | "SET_SESSION_HOST";
          payload: string;
      }
    | { type: "SET_SESSION"; payload: SessionType }
    | { type: "SET_HOST_STREAM"; payload: MediaStream }
    | { type: "ADD_PARTICIPANT" | "REMOVE_PARTICIPANT"; payload: string }
    | { type: "SET_IS_LOADING"; payload: { [key: string]: boolean } };

export default ActionType;
