import { useEffect } from "react";
import { Container, Text, useStyleContext } from "@zeal-ui/core";
import axios from "axios";
import useSessionContext from "../hooks/useSessionContext";
import { useParams } from "react-router-dom";

const Chat = () => {
    const style = useStyleContext();

    const styles = `
        margin:5rem 1rem 2rem 1rem;
        padding:1rem;
        box-sizing:border-box;
        width:15rem;
        height:20rem;
        border-radius:${style.common.borderRadius};

        @media(min-width:425px){
            width:20rem;
            height:20rem;
        }
        
        @media(min-width:768px){
            width:25rem;
            height:21.5rem;
        }

    `;

    const { dispatch } = useSessionContext();

    type SessionRouteParam = {
        sessionId: string;
    };

    const { sessionId } = useParams<SessionRouteParam>();

    useEffect(() => {
        let SESSION_CHAT_URL: string;

        if (process.env.NODE_ENV === "development") {
            SESSION_CHAT_URL = `http://localhost:5000/session/${sessionId}/chat`;
        } else {
            SESSION_CHAT_URL = `https://zeal-ama.herokuapp.com/session/${sessionId}/chat`;
        }

        const fetchSessionChatMessages = async () => {
            try {
                const response = await axios({
                    method: "get",
                    url: SESSION_CHAT_URL,
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
    }, [dispatch, sessionId]);

    return (
        <Container type="col" withBorder customStyles={styles}>
            <Text>Chat component</Text>
        </Container>
    );
};

export default Chat;
