import { StateType, ActionType } from "../types/index";

const reducer = (state: StateType, action: ActionType): StateType => {
    switch (action.type) {
        case "SET_USERNAME":
            return {
                ...state,
                userName: action.payload,
            };
        case "SET_USER_SOCKET_ID":
            return {
                ...state,
                userSocketId: action.payload,
            };
        case "SET_SESSION_ID":
            return {
                ...state,
                session: { ...state.session, id: action.payload },
            };
        case "SET_SESSION_NAME":
            return {
                ...state,
                session: { ...state.session, name: action.payload },
            };
        case "SET_SESSION":
            return {
                ...state,
                session: action.payload,
            };
        case "SET_HOST_STREAM":
            return {
                ...state,
                hostStream: action.payload,
            };
        case "SET_SESSION_CHAT":
            return {
                ...state,
                session: { ...state.session, chats: action.payload },
            };
        case "SET_IS_LOADING":
            return {
                ...state,
                isLoading: { ...state.isLoading, ...action.payload },
            };
        case "SET_IS_ERROR":
            return {
                ...state,
                isError: { ...state.isError, ...action.payload },
            };
        default:
            return state;
    }
};

export default reducer;
