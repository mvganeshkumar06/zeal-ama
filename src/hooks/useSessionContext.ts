import { useContext } from "react";
import { SessionContext } from "../context/SessionContext";

const useSessionContext = () => {
    const sessionContext = useContext(SessionContext);
    if (sessionContext === undefined) {
        throw new Error("Context is undefined");
    }
    return sessionContext;
};

export default useSessionContext;
