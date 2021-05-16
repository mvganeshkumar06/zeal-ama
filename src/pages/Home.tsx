import { FormEvent } from "react";
import {
    Container,
    Text,
    useStyleContext,
    useThemeContext,
    Input,
    Divider,
} from "@zeal-ui/core";
import { useHistory } from "react-router-dom";
import VideoCallIcon from "@material-ui/icons/VideoCall";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import useSessionContext from "../hooks/useSessionContext";
import { useEffect } from "react";
import LiveTvIcon from "@material-ui/icons/LiveTv";

const Home = () => {
    const style = useStyleContext();
    const { theme } = useThemeContext();

    const styles = `
    
        margin:5rem 1rem;
        
        .title{
            text-align:center;
            margin-bottom:3rem;
            line-height:1;
        }

        .sessionContainer{
            border-radius:${style.common.borderRadius};
            padding:1rem 0rem;
        }

        .createSessionItem:hover, .joinSessionItem:hover{
            cursor:pointer;
        }

        .createSessionItem, .joinSessionItem{
            margin:1rem;
            padding:0.25rem ${style.common.padding};
            border-radius:${style.common.borderRadius};
            color:black;
            width:12rem;
        }

        .createSessionItem{
            background-color:${
                theme === "light"
                    ? style.colors.orange[2]
                    : style.colors.orange[3]
            };
        }

        .joinSessionItem{
            background-color:${
                theme === "light" ? style.colors.blue[2] : style.colors.blue[3]
            };
        }

        .icon{
            width:1.5rem;
            height:1.5rem;
            margin-right:0.5rem;   
        }

        .input{
            width:12rem;
            height:2.25rem;
            margin:0rem 1rem;
        }

        .joinBtn{
            height:3rem;
            margin-left:1rem;
            color:black;
        }

        .userNameText{
            text-align:center;
            margin-bottom:3rem;
        }

        .userName{
            color:${
                theme === "light"
                    ? style.colors.orange[2]
                    : style.colors.orange[3]
            };
            font-weight:bold;
        }

        .divider{
            margin:1rem 0rem 2rem 0rem;
        }

        @media(min-width:768px){
            .input{
                width:10rem;
            }
            .createSessionContainer, .joinSessionContainer{
                flex-direction:row;
            }
        }

    `;

    const {
        state: { session, userName },
        dispatch,
    } = useSessionContext();

    useEffect(() => {
        const userName = localStorage.getItem("userName");
        if (userName) {
            dispatch({
                type: "SET_USERNAME",
                payload: userName,
            });
        }
    }, [dispatch]);

    const history = useHistory();

    const saveSessionDetailsOnDbAndRedirect = async (
        sessionId: string,
        sessionName: string,
        hostName: string
    ) => {
        try {
            const response = await axios({
                method: "post",
                url: "https://zeal-ama.herokuapp.com/session",
                data: {
                    id: sessionId,
                    name: sessionName,
                    host: {
                        name: hostName,
                    },
                },
            });
            history.push(`/join/${response.data}`);
        } catch (error) {
            console.log(error);
        }
    };

    const createSession = () => {
        const id = uuidv4();
        saveSessionDetailsOnDbAndRedirect(id, session.name, userName);
    };

    const joinSession = () => {
        history.push(`/join/${session.id}`);
    };

    return (
        <Container type="col" rowCenter customStyles={styles}>
            <Text type="mainHeading" className="title">
                Welcome to Zeal AMA Sessions
            </Text>
            {userName ? (
                <>
                    <Text className="userNameText">
                        Hey <span className="userName">{userName}</span>, create
                        your own session or join a live session !
                    </Text>
                    <Container
                        type="col"
                        rowCenter
                        colCenter
                        withBorder
                        className="sessionContainer"
                    >
                        <Container
                            type="col"
                            rowCenter
                            colCenter
                            className="createSessionContainer"
                        >
                            <Input
                                type="text"
                                placeholder="Enter a Session Name"
                                className="input"
                                value={session.name}
                                onChange={(
                                    event: FormEvent<HTMLInputElement>
                                ) =>
                                    dispatch({
                                        type: "SET_SESSION_NAME",
                                        payload: event.currentTarget.value,
                                    })
                                }
                            />
                            <Container
                                type="row"
                                colCenter
                                onClick={createSession}
                                className="createSessionItem"
                            >
                                <VideoCallIcon className="icon" />
                                <Text>Create a new Session</Text>
                            </Container>
                        </Container>
                        <Divider className="divider" />
                        <Container
                            type="col"
                            rowCenter
                            colCenter
                            className="joinSessionContainer"
                        >
                            <Input
                                type="text"
                                placeholder="Enter a Session Code"
                                className="input"
                                value={session.id}
                                onChange={(
                                    event: FormEvent<HTMLInputElement>
                                ) =>
                                    dispatch({
                                        type: "SET_SESSION_ID",
                                        payload: event.currentTarget.value,
                                    })
                                }
                            />
                            <Container
                                type="row"
                                colCenter
                                className="joinSessionItem"
                                onClick={joinSession}
                            >
                                <LiveTvIcon className="icon" />
                                <Text>Join a live Session</Text>
                            </Container>
                        </Container>
                    </Container>
                </>
            ) : (
                <Text type="subHeading" color="orange">
                    Login to create your own session or to join a live session !
                </Text>
            )}
        </Container>
    );
};

export default Home;
