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

    // Connect the socket to the server
    const socket = io("https://zeal-ama.herokuapp.com");

    const [userSocketId, setUserSocketId] = useState("");

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
                console.log("Welcome user");
            }
            setHostIdentified(true);
        }
    }, [isLoading.session, session]);

    // Save participants on local storage and establish connection after the host is identified
    useEffect(() => {
        if (hostIdentified) {
            if (isHost) {
                // Set participants in local storage
                localStorage.setItem(
                    "participants_active_in_session",
                    JSON.stringify([])
                );
                // When host socket is connected
                socket.on("connect", () => {
                    // Indicate the server that the host joined the session
                    socket.emit(
                        "host-join-session",
                        sessionId,
                        socket.id,
                        userName
                    );
                    console.log("Host joined session");
                });
            } else {
                // Set participants in local storage
                localStorage.setItem(
                    "participants_active_in_session",
                    JSON.stringify([userName])
                );
                // When host socket is connected
                socket.on("connect", () => {
                    // Indicate the host (through server) that the user has joined the session
                    socket.emit("join-session", sessionId, socket.id, userName);
                    console.log("Participant joined the session");
                    setUserSocketId(socket.id);
                });

                joinSession();
            }
        }
        // eslint-disable-next-line
    }, [hostIdentified]);

    const createSessionConnection = () => {
        // When a new user joined the session
        socket.on("user-joined-session", async (users, userSocketId) => {
            // Create an offer
            const offer = await peer.createOffer();

            // Set the offer as local description
            await peer.setLocalDescription(offer);

            // Send the offer to the server
            socket.emit("offer", offer, sessionId, userSocketId);

            console.log("Sent host offer");

            // Listen for answer
            socket.on("answer-from-user", async (answer) => {
                // Set the incoming answer as remote description
                if (!peer.currentRemoteDescription && answer) {
                    console.log("Received answer from user");
                    await peer.setRemoteDescription(
                        new RTCSessionDescription(answer)
                    );
                }
            });

            // Listen to host ICE candidate send it to the server
            peer.addEventListener("icecandidate", (event) => {
                if (event.candidate) {
                    console.log("Sent host ICE candidate");
                    socket.emit(
                        "host-ice-candidate",
                        event.candidate.toJSON(),
                        sessionId,
                        userSocketId
                    );
                }
            });

            // Listen for ICE candidate from user (through server) and add it to the host's peer
            socket.on(
                "ice-candidate-from-user",
                async (iceCandidate: RTCIceCandidateInit) => {
                    if (iceCandidate) {
                        try {
                            console.log("Received ICE candidate from user");
                            await peer.addIceCandidate(iceCandidate);
                        } catch (e) {
                            console.error(
                                "Error adding received ice candidate",
                                e
                            );
                        }
                    }
                }
            );

            console.log("User joined session");
            // Update the participants list in the local storage
            localStorage.setItem(
                "participants_active_in_session",
                JSON.stringify(users)
            );
        });

        socket.on("user-left-session", (users) => {
            console.log("User left session");
            // Update the participants list in the local storage
            localStorage.setItem(
                "participants_active_in_session",
                JSON.stringify(users)
            );
        });
    };

    // Users
    const joinSession = async () => {
        // When a new user joined the session
        socket.on("user-joined-session", (users) => {
            // Update the participants list in the local storage
            localStorage.setItem(
                "participants_active_in_session",
                JSON.stringify(users)
            );
        });

        // Listen for offer from host (through server)
        socket.on("offer-from-host", async (offer) => {
            if (offer) {
                console.log("Received offer from host");

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

        // Listen for user ICE candidate and send it to the host (through server)
        peer.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                console.log("Sent user ICE candidate");
                socket.emit(
                    "user-ice-candidate",
                    event.candidate.toJSON(),
                    sessionId
                );
            }
        });

        // Listen for ICE candidate from host (through server) and add it the user's peer
        socket.on(
            "ice-candidate-from-host",
            async (iceCandidate: RTCIceCandidateInit) => {
                if (iceCandidate) {
                    try {
                        console.log("Received ICE candidate from host");
                        await peer.addIceCandidate(iceCandidate);
                    } catch (e) {
                        console.error("Error adding received ice candidate", e);
                    }
                }
            }
        );

        // Listen for connectionstatechange on the peer
        peer.addEventListener("connectionstatechange", (event) => {
            if (peer.connectionState === "connected") {
                console.log(
                    "User you are now directly connected with the host"
                );
            }
        });

        // Create an empty remote media stream
        const remoteStream = new MediaStream();

        // Listen to host's stream
        peer.addEventListener("track", async (event) => {
            remoteStream.addTrack(event.track);
        });

        // Put the stream on the view
        if (streamRef && streamRef.current) {
            streamRef.current.srcObject = remoteStream;
        }

        socket.on("disconnect", () => {
            socket.emit("leave-session", userSocketId);
        });

        socket.on("user-left-session", (users) => {
            console.log("User left session");
            // Update the participants list in the local storage
            localStorage.setItem(
                "participants_active_in_session",
                JSON.stringify(users)
            );
        });

        socket.on("disconnect-user", () => {
            console.log("Host ended the session");
            socket.disconnect();
        });
    };

    const [isError, setIsError] = useState("");
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

            // Add the host track to the peer connection
            stream.getTracks().forEach((track) => {
                peer.addTrack(track, stream);
            });

            dispatch({
                type: "SET_HOST_STREAM",
                payload: stream,
            });

            createSessionConnection();
        } catch (error) {
            setIsError(error.message);
            setTimeout(() => {
                setIsError("");
            }, 5000);
        }
    };

    const endStream = () => {
        // Stop the host stream
        hostStream?.getTracks().forEach((track) => {
            track.stop();
        });

        // Close the host peer connection
        if (peer) {
            peer.close();
        }

        // Emit end session event to the server
        socket.emit("end-session", sessionId);
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
                            <Button onClick={startStream}>Start Stream</Button>
                            <Button onClick={endStream}>End Stream</Button>
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
