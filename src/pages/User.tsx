import { useRef, useEffect } from "react";
import {
    Container,
    Button,
    useThemeContext,
    useStyleContext,
} from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import { io } from "socket.io-client";

const User = () => {
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
        state: { session, userName, userSocketId },
        dispatch,
    } = useSessionContext();

    const streamRef = useRef<HTMLVideoElement | null>(null);

    // Connect the socket to the server
    const socket = io("https://zeal-ama.herokuapp.com");

    useEffect(() => {
        const listenToSocketEvents = () => {
            // When user socket is connected
            socket.on("connect", () => {
                // Indicate the server that the user joined the session
                socket.emit("join-session", session.id, socket.id, userName);
                dispatch({
                    type: "SET_USER_SOCKET_ID",
                    payload: socket.id,
                });
                console.log("User joined session");
            });

            // When a new user joined the session
            socket.on("user-joined-session", async (users) => {
                console.log("User joined session");
                // Update the participants in the local storage
                localStorage.setItem(
                    "participants_active_in_session",
                    JSON.stringify(users)
                );
            });

            // When a user left the session
            socket.on("user-left-session", (users) => {
                console.log("User left session");
                // Update the participants in the local storage
                localStorage.setItem(
                    "participants_active_in_session",
                    JSON.stringify(users)
                );
            });
        };
        listenToSocketEvents();
        // eslint-disable-next-line
    }, []);

    const createUserPeerConnection = () => {
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

        // Create a peer connection for user
        const peer = new RTCPeerConnection(config);

        // When track is added to the peer connection by the server
        peer.ontrack = (event) => {
            const hostStream = event.streams[0];
            // Put the host stream on the view
            if (streamRef && streamRef.current) {
                streamRef.current.srcObject = hostStream;
            }
        };

        // Handle user peer negotiation
        peer.onnegotiationneeded = async () => {
            // Create an offer
            const offer = await peer.createOffer();

            // Set the offer as local description
            await peer.setLocalDescription(offer);

            // Send the offer to the server and listen for the answer
            socket.emit(
                "user-offer",
                offer,
                socket.id,
                async (answer: RTCSessionDescriptionInit) => {
                    console.log("Sent offer");
                    // Set the incoming answer as remote description
                    if (answer) {
                        console.log("Received answer");
                        await peer.setRemoteDescription(
                            new RTCSessionDescription(answer)
                        );
                    }
                }
            );
        };

        // Listen to user ICE candidate and send it to the server
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sent ICE candidate");
                socket.emit("user-ice-candidate", event.candidate.toJSON());
            }
        };

        // Listen for ICE candidate from server and add it to the user's peer
        socket.on(
            "server-ice-candidate",
            async (iceCandidate: RTCIceCandidateInit) => {
                if (iceCandidate) {
                    try {
                        console.log("Received ICE candidate from");
                        await peer.addIceCandidate(iceCandidate);
                    } catch (error) {
                        console.error(
                            "Error adding received ice candidate",
                            error
                        );
                    }
                }
            }
        );

        return peer;
    };

    const watchStream = () => {
        // Disable watch stream btn here
        const peer = createUserPeerConnection();
        peer.addTransceiver("video");
        peer.addTransceiver("audio");
    };

    const leaveSession = () => {
        // When user leaves session
        socket.emit("leave-session", userSocketId);
        socket.disconnect();
    };

    return (
        <Container type="col" rowCenter customStyles={styles}>
            <Button onClick={watchStream}>Watch stream</Button>
            <Button onClick={leaveSession}>Leave Session</Button>
            <video ref={streamRef} autoPlay playsInline className="stream" />
        </Container>
    );
};

export default User;
