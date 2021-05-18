import { useRef, useEffect } from "react";
import {
    Container,
    Button,
    Alert,
    useThemeContext,
    useStyleContext,
} from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import { io } from "socket.io-client";

const Host = () => {
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
        state: { session, hostStream, userName, isError },
        dispatch,
    } = useSessionContext();

    const streamRef = useRef<HTMLVideoElement | null>(null);

    // Connect the socket to the server
    const socket = io("https://zeal-ama.herokuapp.com");

    useEffect(() => {
        const listenToSocketEvents = () => {
            // When host socket is connected
            socket.on("connect", () => {
                // Indicate the server that the host joined the session
                socket.emit(
                    "host-join-session",
                    session.id,
                    socket.id,
                    userName
                );
                console.log("Host joined session");
            });

            // When host ended the session
            socket.on("disconnect-user", () => {
                console.log("Host ended the session");
                socket.disconnect();
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

    const createHostPeerConnection = () => {
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

        // Handle host peer negotiation
        peer.onnegotiationneeded = async () => {
            // Create an offer
            const offer = await peer.createOffer();

            // Set the offer as local description
            await peer.setLocalDescription(offer);

            // Send the offer to the server and listen for the answer
            socket.emit(
                "host-offer",
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

        // Listen to host ICE candidate and send it to the server
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sent ICE candidate");
                socket.emit("host-ice-candidate", event.candidate.toJSON());
            }
        };

        // Listen for ICE candidate from server and add it to the host's peer
        socket.on(
            "server-ice-candidate",
            async (iceCandidate: RTCIceCandidateInit) => {
                if (iceCandidate) {
                    try {
                        console.log("Received ICE candidate from server");
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

    const startStream = async () => {
        try {
            // Disable start stream btn

            // Get host media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            if (streamRef && streamRef.current) {
                streamRef.current.srcObject = stream;
            }

            dispatch({
                type: "SET_HOST_STREAM",
                payload: stream,
            });

            const peer = createHostPeerConnection();

            // Add the host stream to the host peer
            stream.getTracks().forEach((track) => {
                peer.addTrack(track, stream);
            });
        } catch (error) {
            dispatch({
                type: "SET_IS_ERROR",
                payload: { hostMedia: true },
            });
            setTimeout(() => {
                dispatch({
                    type: "SET_IS_ERROR",
                    payload: { hostMedia: false },
                });
            }, 6000);
        }
    };

    const endStream = () => {
        // Stop the host stream
        hostStream?.getTracks().forEach((track) => {
            track.stop();
        });

        // // Close the host peer connection
        // if (peer) {
        //     peer.close();
        // }

        // Emit end session event to the server
        socket.emit("end-session", session.id);
    };

    const toggleVideo = () => {
        hostStream?.getTracks().forEach((track) => {
            if (track.kind === "video") {
                track.enabled = !track.enabled;
            }
        });
    };

    const toggleAudio = () => {
        hostStream?.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = !track.enabled;
            }
        });
    };

    return (
        <Container type="col" rowCenter customStyles={styles}>
            <Container type="col" className="feedbackContainer">
                {isError.hostMedia && (
                    <Alert type="danger">
                        Error while tyring to stream media. Please ensure that
                        you have allowed permission for accessing your mic,
                        webcam and check the connectivity of your devices.
                    </Alert>
                )}
            </Container>
            <Button onClick={startStream}>Start Stream</Button>
            <Button onClick={endStream}>End Stream</Button>
            <Button onClick={toggleVideo}>Toggle Video</Button>
            <Button onClick={toggleAudio}>Toggle Audio</Button>
            <video
                ref={streamRef}
                autoPlay
                playsInline
                className="stream"
                muted
            />
        </Container>
    );
};

export default Host;
