import { useEffect, useState, FormEvent, KeyboardEvent } from "react";
import {
    Container,
    Text,
    Input,
    useStyleContext,
    useThemeContext,
} from "@zeal-ui/core";
import axios from "axios";
import useSessionContext from "../hooks/useSessionContext";
import { ChatType } from "../types/index";
import SendIcon from "@material-ui/icons/Send";

const Chat = () => {
    const style = useStyleContext();
    const { theme } = useThemeContext();

    const styles = `
        margin:5rem 1rem 2rem 1rem;
        padding:1rem 0.5rem;
        box-sizing:border-box;
        width:15rem;
        height:20rem;
        border-radius:${style.common.borderRadius};
     
        .title{
            margin:0rem;
            margin-bottom:1rem;
        }

        .chatContainer{
            position:relative;
            width:100%;
            height:100%;
        }

        .chatItem{
            position:relative;
            width:100%;
            height:65%;
            overflow-y:auto;
            margin:0rem;
            word-wrap:break-word;
        }

        .chat{
            width:100%;
            margin:0.5rem 0rem;
        }

        .userName, .message{
            margin:0rem;
            font-size:0.85rem;
        }

        .userName{
            font-weight:bold;
        }

        .chatInputContainer{
            position:absolute;
            left:0rem;
            bottom:0rem;
            width:100%;
        }

        .chatInput{
            width:80%;
        }

        .iconBg{
            width:2.5rem;
            height:2.5rem;
            background-color:${
                theme === "light" ? style.colors.blue[2] : style.colors.blue[3]
            };
            border-radius:50%;
            display:flex;
            justify-content:center;
            align-items:center;
            margin-left:1rem;
        }

        .iconBg:hover{
            cursor:pointer;
            box-shadow:${style.common.boxShadow};
        }

        .sendMessageIcon{
            width:1.5rem;
            height:1.5rem;
            margin-left:0.35rem;
            color:black;
        }

        @media(min-width:425px){
            width:20rem;
            height:20rem;
        }
        
        @media(min-width:768px){
            width:25rem;
            height:21.5rem;
        }

    `;

    const {
        state: { isLoading, isError, session, socket, userName },
        dispatch,
    } = useSessionContext();

    const [message, setMessage] = useState("");

    useEffect(() => {
        let SESSION_CHAT_URL: string;

        if (process.env.NODE_ENV === "development") {
            SESSION_CHAT_URL = `http://localhost:5000/session/${session.id}/chat`;
        } else {
            SESSION_CHAT_URL = `https://zeal-ama.herokuapp.com/session/${session.id}/chat`;
        }

        const fetchSessionChatMessages = async () => {
            try {
                const response = await axios({
                    method: "get",
                    url: SESSION_CHAT_URL,
                });
                dispatch({
                    type: "SET_SESSION_CHATS",
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
    }, [dispatch, session.id]);

    useEffect(() => {
        const listenToSocketEvents = () => {
            socket.on("chat-update", (chats: ChatType[]) => {
                dispatch({
                    type: "SET_SESSION_CHATS",
                    payload: chats,
                });
            });
        };
        listenToSocketEvents();
        // eslint-disable-next-line
    }, []);

    const sendMessage = () => {
        socket.emit("chat-message", userName, message);
        setMessage("");
    };

    return (
        <Container type="col" withBorder customStyles={styles}>
            <Container type="col" rowCenter className="chatContainer">
                <Text type="subHeading" className="title">
                    Chats
                </Text>
                {!isLoading.sessionChat && !isError.sessionChat && (
                    <Container type="col" rowCenter className="chatItem">
                        {session.chats.map((chat: ChatType) => (
                            <Container
                                type="col"
                                colCenter
                                className="chat"
                                key={chat._id}
                            >
                                <Text className="userName" color="blue">
                                    {chat.userName}
                                </Text>
                                <Text className="message">{chat.message}</Text>
                            </Container>
                        ))}
                    </Container>
                )}
                <Container
                    type="row"
                    rowCenter
                    colCenter
                    className="chatInputContainer"
                >
                    <Input
                        className="chatInput"
                        placeholder="Enter your message"
                        value={message}
                        onChange={(event: FormEvent<HTMLInputElement>) =>
                            setMessage(event.currentTarget.value)
                        }
                        onKeyPress={(event: KeyboardEvent) => {
                            if (event.key === "Enter") {
                                sendMessage();
                            }
                        }}
                    />
                    <span className="iconBg" onClick={sendMessage}>
                        <SendIcon className="sendMessageIcon">Send</SendIcon>
                    </span>
                </Container>
            </Container>
        </Container>
    );
};

export default Chat;
