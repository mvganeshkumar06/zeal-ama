import { useState, useEffect } from "react";
import { Container, Text, Spinner, Alert } from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import Host from "./Host";
import User from "./User";

const Session = () => {
    const styles = `
        margin:5rem 0rem;
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
        const fetchSessionDetails = async () => {
            try {
                const response = await axios({
                    method: "get",
                    url: `https://zeal-ama.herokuapp.com/session/${sessionId}`,
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
            if (savedUserName === session.host) {
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
        <Container type="col" rowCenter customStyles={styles}>
            <Container type="col">
                {isLoading.session && <Spinner color="blue" />}
                {isError.session && (
                    <Alert type="danger">
                        Error while tyring to get session details
                    </Alert>
                )}
            </Container>
            {!isLoading.session && !isError.session && hostIdentified && (
                <>
                    <Text type="mainHeading">{session.name}</Text>
                    <Text>By {session.host}</Text>
                    {isHost ? <Host /> : <User />}
                </>
            )}
        </Container>
    );
};

export default Session;
