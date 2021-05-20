import { useRef, useEffect, useState } from "react";
import {
    Container,
    Text,
    useThemeContext,
    useStyleContext,
} from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import CallEndIcon from "@material-ui/icons/CallEnd";
import { useHistory } from "react-router-dom";

const User = () => {
    const { theme } = useThemeContext();
    const style = useStyleContext();
    const styles = `
        width:100%;
        margin:0rem 1rem;

        .stream{
            border:1px solid ${theme === "light" ? "black" : "white"};
            border-radius:${style.common.borderRadius};
            width:15rem;
            height:fit-content;
            margin-bottom:2rem;
        }

        .iconBg{
            width:2.5rem;
            height:2.5rem;
            background-color:${
                theme === "light"
                    ? style.colors.orange[2]
                    : style.colors.orange[3]
            };
            border-radius:50%;
            display:flex;
            justify-content:center;
            align-items:center;
            margin:0rem 0.5rem;
        }

        .iconBg:hover{
            cursor:pointer;
            box-shadow:${style.common.boxShadow};
        }
        
        .iconBgDisabled{
            background-color:${
                theme === "light" ? style.colors.gray[2] : style.colors.gray[3]
            };
        }
        
        .icon{
            width:1.5rem;
            height:1.5rem;
            color:black;
        }

        .iconText{
            margin:0rem;
        }

        .iconItem{
            margin:0rem 1rem;
        }

        @media(min-width:425px){
            .stream{
                width:20rem;
            }
        }

        @media(min-width:768px){
            .stream{
                width:25rem;
            }
        }

    `;

    const {
        state: { session, socket, userName, userSocketId },
        dispatch,
    } = useSessionContext();

    const streamRef = useRef<HTMLVideoElement | null>(null);
    const [isHostStreaming, setIsHostStreaming] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const listenToSocketEvents = () => {
            socket.on("connect", () => {
                socket.emit("join-session", session.id, socket.id, userName);
                dispatch({
                    type: "SET_USER_SOCKET_ID",
                    payload: socket.id,
                });
            });

            socket.on("user-joined-session", (users) => {
                dispatch({
                    type: "SET_SESSION_USERS",
                    payload: users,
                });
            });

            socket.on("user-left-session", (users) => {
                dispatch({
                    type: "SET_SESSION_USERS",
                    payload: users,
                });
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
            setIsHostStreaming(true);
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
                    // Set the incoming answer as remote description
                    if (answer) {
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
                socket.emit("user-ice-candidate", event.candidate.toJSON());
            }
        };

        // Listen for ICE candidate from server and add it to the user's peer
        socket.on(
            "server-ice-candidate",
            async (iceCandidate: RTCIceCandidateInit) => {
                if (iceCandidate) {
                    try {
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
        const peer = createUserPeerConnection();
        peer.addTransceiver("video");
        peer.addTransceiver("audio");
    };

    const leaveSession = () => {
        socket.emit("leave-session", userSocketId);
        socket.disconnect();
        history.push("/rejoin");
    };

    return (
        <Container type="col" rowCenter customStyles={styles}>
            <video ref={streamRef} autoPlay playsInline className="stream" />
            {isHostStreaming ? (
                <Container type="col" rowCenter colCenter className="iconItem">
                    <span className="iconBg" onClick={leaveSession}>
                        <CallEndIcon className="icon" />
                    </span>
                    <Text className="iconText">Leave session</Text>
                </Container>
            ) : (
                <Container type="row" rowCenter colCenter>
                    <Container
                        type="col"
                        rowCenter
                        colCenter
                        className="iconItem"
                    >
                        <span className="iconBg" onClick={watchStream}>
                            <PlayArrowIcon className="icon" />
                        </span>
                        <Text className="iconText">Watch stream</Text>
                    </Container>
                    <Container
                        type="col"
                        rowCenter
                        colCenter
                        className="iconItem"
                    >
                        <span className="iconBg" onClick={leaveSession}>
                            <CallEndIcon className="icon" />
                        </span>
                        <Text className="iconText">Leave session</Text>
                    </Container>
                </Container>
            )}
        </Container>
    );
};

export default User;
