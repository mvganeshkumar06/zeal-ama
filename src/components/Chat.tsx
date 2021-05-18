import { useEffect } from "react";
import { Container } from "@zeal-ui/core";
import axios from "axios";
import useSessionContext from "../hooks/useSessionContext";
import { useParams } from "react-router-dom";

const Chat = () => {
    const styles = `
        margin:5rem;
        padding:1rem;    
    `;

    const {
        state: { session, userName },
        dispatch,
    } = useSessionContext();

    type SessionRouteParam = {
        sessionId: string;
    };

    const { sessionId } = useParams<SessionRouteParam>();

    useEffect(() => {
        const fetchSessionChatMessages = async () => {
            try {
                const response = await axios({
                    method: "get",
                    // url: `https://zeal-ama.herokuapp.com/session/${sessionId}/chat`,
                    url: `http://localhost:5000/session/${sessionId}/chat`,
                });
                dispatch({
                    type: "SET_SESSION_CHAT",
                    payload: response.data,
                });
            } catch (error) {
                dispatch({
                    type: "SET_IS_ERROR",
                    payload: { sessionChat: true },
                });
                setTimeout(() => {
                    dispatch({
                        type: "SET_IS_ERROR",
                        payload: { sessionChat: false },
                    });
                }, 6000);
            } finally {
                dispatch({
                    type: "SET_IS_LOADING",
                    payload: { sessionChat: false },
                });
            }
        };

        fetchSessionChatMessages();
    }, [dispatch]);

    return <Container type="col" colCenter customStyles={styles}></Container>;
};

export default Chat;
