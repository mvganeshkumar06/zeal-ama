import { Dispatch } from "react";
import { StateType, ActionType } from "./index";

type SessionContextType = {
    state: StateType;
    dispatch: Dispatch<ActionType>;
};

export default SessionContextType;
