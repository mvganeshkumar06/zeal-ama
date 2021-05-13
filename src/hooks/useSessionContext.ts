import { useContext } from "react"
import {SessionContext} from "../context/SessionContext"

const useSessionContext=()=>{
    return useContext(SessionContext);
}

export default useSessionContext;