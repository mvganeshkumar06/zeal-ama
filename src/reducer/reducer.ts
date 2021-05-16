import { StateType, ActionType } from "../types/index";

const reducer = (state: StateType, action: ActionType) => {
    switch (action.type) {
        case "SET_USERNAME":
            return {
                ...state,
                userName: action.payload,
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
        case "SET_SESSION_HOST":
            return {
                ...state,
                session: { ...state.session, host: action.payload },
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
        case "SET_IS_LOADING":
            return {
                ...state,
                isLoading: { ...state.isLoading, ...action.payload },
            };
        default:
            return state;
    }
};

export default reducer;
