import { useState, useEffect } from "react";
import { Grid, Container, Text, Spinner, Alert } from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Host, User } from "./index";
import { Chat, Question } from "../components/index";

const Session = () => {
    const styles = `
        margin:5rem 1rem;
        .sessionName, .hostName{
            width:100%;
            text-align:center;
        }
        .sessionGrid{
            width:100%;
            margin-top:3rem;
        }

        @media(min-width:768px){
            margin:5rem 0rem;
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
        state: { session, isLoading, isError, userName },
        dispatch,
    } = useSessionContext();

    type SessionRouteParam = {
        sessionId: string;
    };

    const { sessionId } = useParams<SessionRouteParam>();

    const [isHost, setIsHost] = useState(false);
    const [hostIdentified, setHostIdentified] = useState(false);

    // Fetch session details after getting the sessionId
    useEffect(() => {
        let CURRENT_SESSION_URL: string;

        if (process.env.NODE_ENV === "development") {
            CURRENT_SESSION_URL = `http://localhost:5000/session/${sessionId}`;
        } else {
            CURRENT_SESSION_URL = `https://zeal-ama.herokuapp.com/session/${sessionId}`;
        }
        const fetchSessionDetails = async () => {
            try {
                const response = await axios({
                    method: "get",
                    url: CURRENT_SESSION_URL,
                });
                dispatch({
                    type: "SET_SESSION",
                    payload: response.data,
                });
            } catch (error) {
                dispatch({
                    type: "SET_IS_ERROR",
                    payload: { session: true },
                });
                setTimeout(() => {
                    dispatch({
                        type: "SET_IS_ERROR",
                        payload: { session: false },
                    });
                }, 6000);
            } finally {
                dispatch({
                    type: "SET_IS_LOADING",
                    payload: { session: false },
                });
            }
        };

        fetchSessionDetails();
    }, [dispatch, sessionId]);

    // Identify whether current user is the host after session details are fetched
    useEffect(() => {
        if (!isLoading.session && session) {
            const savedUserName = localStorage.getItem("userName");
            if (savedUserName === session.host.name) {
                console.log("Welcome host");
                setIsHost(true);
            } else {
                console.log("Welcome user");
            }
            setHostIdentified(true);
        }
    }, [isLoading.session, session]);

    // Save participants on local storage after the host is identified
    useEffect(() => {
        if (hostIdentified) {
            if (isHost) {
                localStorage.setItem(
                    "participants_active_in_session",
                    JSON.stringify([])
                );
            } else {
                localStorage.setItem(
                    "participants_active_in_session",
                    JSON.stringify([userName])
                );
            }
        }
        // eslint-disable-next-line
    }, [hostIdentified]);

    return (
        <Container type="col" customStyles={styles}>
            {isLoading.session && <Spinner color="blue" />}
            {isError.session && (
                <Alert type="danger">
                    Error while tyring to get session details
                </Alert>
            )}
            <Text type="mainHeading" className="sessionName">
                {session.name}
            </Text>
            <Text className="hostName">By {session.host.name}</Text>
            {!isLoading.session && !isError.session && hostIdentified && (
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
                        <Question />
                    </Container>
                </Grid>
            )}
        </Container>
    );
};

export default Session;
