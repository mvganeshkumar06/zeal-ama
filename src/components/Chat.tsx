import { useEffect, FormEvent, KeyboardEvent } from "react";
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
        box-sizing:border-box;
        width:18rem;
        height:20rem;
        border-radius:${style.common.borderRadius};
        border-bottom:0rem;

        .title{
            margin:0.5rem 0rem;
        }

        .chatContainer{
            position:relative;
            width:100%;
            height:100%;
        }

        .chatItem{
            position:relative;
            width:100%;
            height:75%;
            overflow-y:auto;
            margin:0rem;
            padding:0rem 0.5rem;
            box-sizing:border-box;
            word-wrap:break-word;
            border-top:${style.common.border};
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
            margin:0rem;
        }

        .chatInput{
            width:100%;
            margin:0rem;
            border-radius:0rem;
            border-bottom-left-radius:${style.common.borderRadius};
        }

        .iconBg{
            width:2.25rem;
            height:2.25rem;
            background-color:${
                theme === "light" ? style.colors.blue[2] : style.colors.blue[3]
            };
            display:flex;
            justify-content:center;
            align-items:center;
            border-bottom-right-radius:${style.common.borderRadius};
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
        state: { isLoading, isError, session, socket, userName, message },
        dispatch,
    } = useSessionContext();

    useEffect(() => {
        const fetchSessionChatMessages = async () => {
            try {
                const response = await axios.get<ChatType[]>(
                    `https://zeal-ama.herokuapp.com/session/${session.id}/chat`
                );
                dispatch({
                    type: "SET_SESSION_CHATS",
                    payload: response.data,
                });
            } catch (error) {
                console.log(error.response?.data.errorMessage || error.message);
                dispatch({
                    type: "SET_IS_ERROR",
                    payload: { sessionChat: true },
                });
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
        dispatch({
            type: "SET_MESSAGE",
            payload: "",
        });
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
                            dispatch({
                                type: "SET_MESSAGE",
                                payload: event.currentTarget.value,
                            })
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
