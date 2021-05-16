import { useState, useRef } from "react";
import {
    Container,
    Text,
    Button,
    Alert,
    Spinner,
    useThemeContext,
    useStyleContext,
} from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const Session = () => {
    const { theme } = useThemeContext();
    const style = useStyleContext();
    const styles = `
    
        margin:5rem 0rem;

        .stream{
            border:2px solid ${theme === "light" ? "black" : "white"};
            border-radius:${style.common.borderRadius};
            width:20rem;
            height:15rem;
            margin:2rem 0rem 2rem 0rem;
        }

    `;

    const {
        state: { session, isLoading, hostStream, userName },
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
                console.log(error);
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
                console.log("Welcome participant");
            }
            setHostIdentified(true);
        }
    }, [isLoading.session, session]);

    // Save participants on local storage and establish connection after the host is identified
    useEffect(() => {
        if (hostIdentified) {
            if (isHost) {
                localStorage.setItem(
                    "participants_active_in_session",
                    JSON.stringify([])
                );
                startHostStream();
                createSessionConnection();
            } else {
                localStorage.setItem(
                    "participants_active_in_session",
                    JSON.stringify([userName])
                );
                joinSession();
            }
        }
        // eslint-disable-next-line
    }, [hostIdentified]);

    const createSessionConnection = async () => {
        // Connect the socket to the server
        // const socket = io("https://zeal-ama.herokuapp.com");
        const socket = io("http://localhost:5000");

        socket.emit("host-join-session", sessionId, socket.id, userName);

        console.log("Host joined session");

        // Peer connection config
        const config = {
            iceServers: [
                {
                    urls: [
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                    ],
                },
            ],
        };

        // Create a peer connection for host
        const peer = new RTCPeerConnection(config);

        // Add the host track to the peer connection
        hostStream.getTracks().forEach((track) => {
            peer.addTrack(track, hostStream);
        });

        // Listen to host ICE candidate send it to the server
        peer.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                console.log("Sent host ICE candidate");
                socket.emit(
                    "host-ice-candidate",
                    JSON.stringify(event.candidate),
                    sessionId
                );
            }
        });

        // Create an offer
        const offer = await peer.createOffer();

        // Set the offer as local description
        await peer.setLocalDescription(offer);

        // Send the offer to the server
        socket.emit("offer", offer, sessionId);

        console.log("Sent host offer");

        // Listen for answer
        socket.on("answer-from-user", async (answer) => {
            // Set the incoming answer as remote description
            if (answer) {
                console.log("Received user answer");
                await peer.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );
            }
        });

        // Listen for ICE candidate from user (through server) and add it to the host's peer
        socket.on("ice-candidate-from-user", async (iceCandidate) => {
            if (iceCandidate) {
                try {
                    console.log("Received user ICE candidate");
                    await peer.addIceCandidate(JSON.parse(iceCandidate));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            }
        });

        // When a new user joined the session
        socket.on("user-joined-session", (users) => {
            // Update the participants list in the local storage
            localStorage.setItem(
                "participants_active_in_session",
                JSON.stringify(users)
            );
        });
    };

    // Participants
    const joinSession = async () => {
        // Connect the socket to the server
        // const socket = io("https://zeal-ama.herokuapp.com");
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
            // Emit join session event to server
            socket.emit("join-session", sessionId, socket.id, userName);
            console.log("Participant joined the session");
        });

        // When a new user joined the session
        socket.on("user-joined-session", (users) => {
            // Update the participants list in the local storage
            localStorage.setItem(
                "participants_active_in_session",
                JSON.stringify(users)
            );
        });

        // Peer connection config
        const config = {
            iceServers: [
                {
                    urls: [
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                    ],
                },
            ],
        };

        // Create a peer connection
        const peer = new RTCPeerConnection(config);

        // Listen for user ICE candidate and send it to the host (through server)
        peer.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                console.log("Sent user ICE candidate");
                socket.emit(
                    "user-ice-candidate",
                    JSON.stringify(event.candidate),
                    sessionId
                );
            }
        });

        // Listen for offer from host (through server)
        socket.on("offer-from-host", async (offer) => {
            if (offer) {
                console.log("Received host offer");

                // Set the incoming offer as remote description
                await peer.setRemoteDescription(
                    new RTCSessionDescription(offer)
                );

                // Create an answer
                const answer = await peer.createAnswer();

                // Set the answer as local description
                await peer.setLocalDescription(answer);

                // Send the answer to the host (through server)
                socket.emit("answer", answer, sessionId);

                console.log("Sent user answer");
            }
        });

        // Listen for ICE candidate from host (through server) and add it the user's peer
        socket.on("ice-candidate-from-host", async (iceCandidate) => {
            if (iceCandidate) {
                try {
                    console.log("Received host ICE candidate");
                    await peer.addIceCandidate(JSON.parse(iceCandidate));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            }
        });

        // Listen for connectionstatechange on the peer
        peer.addEventListener("connectionstatechange", (event) => {
            if (peer.connectionState === "connected") {
                console.log(
                    "Participant you are now directly connected with the host"
                );
            }
        });

        // Create a emopty remote media stream
        const remoteStream = new MediaStream();

        // Listen to host's stream
        peer.addEventListener("track", async (event) => {
            remoteStream.addTrack(event.track);
        });

        // Put the stream on the view
        if (streamRef && streamRef.current) {
            streamRef.current.srcObject = remoteStream;
        }
    };

    const [isError, setIsError] = useState("");
    const streamRef = useRef<HTMLVideoElement | null>(null);

    const startHostStream = async () => {
        try {
            const hostStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            if (streamRef && streamRef.current) {
                streamRef.current.srcObject = hostStream;
            }
            dispatch({ type: "SET_HOST_STREAM", payload: hostStream });
        } catch (error) {
            setIsError(error.message);
            setTimeout(() => {
                setIsError("");
            }, 5000);
        }
    };

    const stopHostStream = () => {
        hostStream?.getTracks().forEach((track) => {
            track.stop();
        });
    };

    const toggleHostVideo = () => {
        hostStream?.getTracks().forEach((track) => {
            if (track.kind === "video") {
                track.enabled = !track.enabled;
            }
        });
    };

    const toggleHostAudio = () => {
        hostStream?.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = !track.enabled;
            }
        });
    };

    return (
        <Container type="col" rowCenter customStyles={styles}>
            <Container type="col" className="feedbackContainer">
                {isLoading.session && <Spinner color="blue" />}
                {isError && (
                    <Alert type="danger">
                        Error while tyring to stream media - {isError}
                    </Alert>
                )}
            </Container>
            {!isLoading.session && (
                <>
                    <Text type="mainHeading">{session.name}</Text>
                    <Text>By {session.host}</Text>
                    {isHost && (
                        <>
                            <Button onClick={startHostStream}>
                                Start Stream
                            </Button>
                            <Button onClick={stopHostStream}>
                                Stop Stream
                            </Button>
                            <Button onClick={toggleHostVideo}>
                                Toogle Video
                            </Button>
                            <Button onClick={toggleHostAudio}>
                                Toogle Audio
                            </Button>
                        </>
                    )}
                    <video
                        ref={streamRef}
                        autoPlay
                        playsInline
                        className="stream"
                        muted={isHost}
                    />
                </>
            )}
        </Container>
    );
};

export default Session;
