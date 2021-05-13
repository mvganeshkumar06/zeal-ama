import { useState, useRef } from "react";
import { Container, Text, Button, Alert } from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import { io } from "socket.io-client";
import { useEffect } from "react";
import Peer from "peerjs";
import { useParams } from "react-router-dom";
import axios from "axios";

const Session = () => {
    const styles = `
    
        margin:5rem 0rem;

        .stream{
            border:1px solid white;
        }

    `;

    const sessionContext = useSessionContext();
    const state = sessionContext?.state;
    const dispatch = sessionContext?.dispatch;

    type SessionRouteParam = {
        sessionId: string;
    };

    const { sessionId } = useParams<SessionRouteParam>();

    useEffect(() => {
        const fetchSessionDetails = async () => {
            try {
                const response = await axios({
                    method: "get",
                    url: `https://zeal-ama.herokuapp.com/session/${sessionId}`,
                });
                if (dispatch) {
                    dispatch({
                        type: "SET_SESSION",
                        payload: response.data,
                    });
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchSessionDetails();
    }, [dispatch, sessionId]);

    useEffect(() => {
        startStream();
    }, []);

    const [stream, setStream] = useState<MediaStream | undefined>();
    const [isError, setIsError] = useState(false);
    const streamRef = useRef<HTMLVideoElement | null>(null);

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            if (streamRef && streamRef.current) {
                streamRef.current.srcObject = stream;
            }
            setStream(stream);
        } catch (error) {
            setIsError(error.message);
        }
    };

    const stopStream = () => {
        stream?.getTracks().forEach((track) => {
            track.stop();
        });
    };

    // Create a peer connection
    const peer = new Peer();

    type ConnectedPeers = {
        [userId: string]: Peer.MediaConnection;
    };

    // Store all the connected peers
    const connectedPeers: ConnectedPeers = {};

    // Connect the socket to the server
    const socket = io("https://zeal-ama.herokuapp.com");

    // When a user visits this page, make them join the session.
    peer.on("open", (userId: string) => {
        socket.emit("joinSession", state?.sessionId, userId);
    });

    // When a user joined the session stream the host media to them
    socket.on("userJoinedSession", (userId: string) => {
        // Stream host media to the connected peer
        connectToUser(userId);
    });

    // Stream to the user who joined the session
    const connectToUser = (userId: string) => {
        if (stream) {
            // Call the user and pass the stream
            const call = peer.call(userId, stream);

            // Store the user in connected peers
            connectedPeers[userId] = call;

            // When the user ends the call
            call.on("close", () => {
                console.log("User left session - ", userId);
            });
        }
    };

    socket.on("userLeftSession", (userId) => {
        // Close the user's connection
        if (connectedPeers[userId]) {
            connectedPeers[userId].close();
        }
    });

    return (
        <Container type="col" rowCenter customStyles={styles}>
            <Text type="mainHeading">{state?.sessionName}</Text>
            <Text>By {state?.hostName}</Text>
            {isError && (
                <Alert>Error while tyring to stream media - {isError} </Alert>
            )}
            <Button onClick={startStream}>Start Stream</Button>
            <Button onClick={stopStream}>Stop Stream</Button>
            <video ref={streamRef} playsInline autoPlay className="stream" />
        </Container>
    );
};

export default Session;
