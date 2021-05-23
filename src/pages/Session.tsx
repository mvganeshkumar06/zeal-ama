import { useEffect } from "react";
import { Grid, Container, Text, Spinner, Alert } from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Host, User } from "./index";
import { Chat, Question } from "../components/index";
import GroupIcon from "@material-ui/icons/Group";
import { SessionType, SessionURLParamType } from "../types/index";

const Session = () => {
    const styles = `
        margin:5rem 0rem;
        
        .sessionName, .hostName{
            width:100%;
            text-align:center;
        }

        .viewersContainer{
            margin-top:2rem;
        }

        .viewersIcon{
            width:1.5rem;
            height:1.5rem;
        }

        .iconText{
            margin:0rem;
        }

        .viewersIconItem{
            margin-right:0.5rem;
        }

        .viewersCount{
            margin:0rem;
        }

        .sessionGrid{
            width:100%;
            margin-top:3rem;
        }

        @media(min-width:1024px){
            .sessionGrid{
                grid-template-columns:1fr 1fr;
                margin-top:5rem;
            }
            .questionContainer{
                align-items:flex-start;
            }
        }
    `;

    const {
        state: { session, isHost, isLoading, isError },
        dispatch,
    } = useSessionContext();

    const { sessionId } = useParams<SessionURLParamType>();

    useEffect(() => {
        const fetchSessionDetails = async () => {
            try {
                const response = await axios.get<SessionType>(
                    `https://zeal-ama.herokuapp.com/session/${sessionId}`
                );
                dispatch({
                    type: "SET_SESSION",
                    payload: response.data,
                });
            } catch (error) {
                console.log(error.response?.data || error.message);
                dispatch({
                    type: "SET_IS_ERROR",
                    payload: { session: true },
                });
            } finally {
                dispatch({
                    type: "SET_IS_LOADING",
                    payload: { session: false },
                });
            }
        };

        fetchSessionDetails();
    }, [dispatch, sessionId]);

    useEffect(() => {
        if (!isLoading.session && session) {
            const savedUserName = localStorage.getItem("userName");
            if (savedUserName === session.host.name) {
                dispatch({ type: "SET_IS_HOST", payload: true });
            }
        }
    }, [isLoading.session, session, dispatch]);

    return (
        <Container type="col" customStyles={styles}>
            <Container type="col" rowCenter colCenter width="100%">
                {isLoading.session && <Spinner color="blue" />}
                {isError.session && (
                    <Alert type="danger">
                        Error while tyring to get session details
                    </Alert>
                )}
            </Container>
            {!isLoading.session && !isError.session && (
                <>
                    <Container type="col" rowCenter width="100%">
                        <Text type="mainHeading" className="sessionName">
                            {session.name}
                        </Text>
                        <Text className="hostName">By {session.host.name}</Text>
                        <Container
                            type="row"
                            rowCenter
                            className="viewersContainer"
                        >
                            <Container
                                type="col"
                                rowCenter
                                colCenter
                                className="viewersIconItem"
                            >
                                <GroupIcon className="viewersIcon" />
                                <Text className="iconText">Viewers</Text>
                            </Container>
                            <Text className="viewersCount">
                                ({session.users.length})
                            </Text>
                        </Container>
                    </Container>
                    <Grid col={1} className="sessionGrid">
                        <Container
                            type="col"
                            rowCenter
                            className="sessionContainer"
                        >
                            {isHost ? <Host /> : <User />}
                            <Chat />
                        </Container>
                        <Container
                            type="col"
                            rowCenter
                            className="questionContainer"
                        >
                            <Question isHost={isHost} />
                        </Container>
                    </Grid>
                </>
            )}
        </Container>
    );
};

export default Session;
