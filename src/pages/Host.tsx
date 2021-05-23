import { useRef, useEffect, useState } from "react";
import {
    Container,
    Alert,
    useThemeContext,
    useStyleContext,
    Text,
} from "@zeal-ui/core";
import useSessionContext from "../hooks/useSessionContext";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import CallEndIcon from "@material-ui/icons/CallEnd";
import { UserType } from "../types";

const Host = () => {
    const { theme } = useThemeContext();
    const style = useStyleContext();
    const styles = `
        width:100%;
        margin:0rem 1rem;

        .stream{
            border:1px solid ${theme === "light" ? "black" : "white"};
            border-radius:${style.common.borderRadius};
            width:18rem;
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
            margin-top:0.25rem;
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
        state: { session, socket, hostStream, isError },
        dispatch,
    } = useSessionContext();

    const streamRef = useRef<HTMLVideoElement | null>(null);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(false);

    useEffect(() => {
        const listenToSocketEvents = () => {
            socket.on("connect", () => {
                socket.emit("host-join-session", session.id, socket.id);
            });

            socket.on("disconnect-user", () => {
                socket.disconnect();
            });

            socket.on("user-joined-session", (users: UserType[]) => {
                dispatch({
                    type: "SET_SESSION_USERS",
                    payload: users,
                });
            });

            socket.on("user-left-session", (users: UserType[]) => {
                dispatch({
                    type: "SET_SESSION_USERS",
                    payload: users,
                });
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
                    // Set the incoming answer as remote description
                    if (answer) {
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
                socket.emit("host-ice-candidate", event.candidate.toJSON());
            }
        };

        // Listen for ICE candidate from server and add it to the host's peer
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

    const startStream = async () => {
        try {
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

            setIsVideoOn(true);
            setIsMicOn(true);
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

        // Close the host peer connection

        // Emit end session event to the server
        socket.emit("end-session", session.id);
    };

    const toggleVideo = () => {
        setIsVideoOn(!isVideoOn);
        hostStream?.getTracks().forEach((track) => {
            if (track.kind === "video") {
                track.enabled = !track.enabled;
            }
        });
    };

    const toggleMic = () => {
        setIsMicOn(!isMicOn);
        hostStream?.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = !track.enabled;
            }
        });
    };

    return (
        <Container type="col" rowCenter customStyles={styles}>
            {isError.hostMedia && (
                <Alert type="danger">
                    Error while tyring to stream media. Please ensure that you
                    have allowed permission for accessing your mic, webcam and
                    check the connectivity of your devices.
                </Alert>
            )}
            <video
                ref={streamRef}
                autoPlay
                playsInline
                className="stream"
                muted
            />
            <Container type="row" rowCenter colCenter>
                {hostStream ? (
                    <>
                        <Container
                            type="col"
                            rowCenter
                            colCenter
                            className="iconItem"
                        >
                            <span className="iconBg" onClick={endStream}>
                                <CallEndIcon className="icon" />
                            </span>
                            <Text className="iconText"> Stop stream </Text>
                        </Container>
                    </>
                ) : (
                    <>
                        <Container
                            type="col"
                            rowCenter
                            colCenter
                            className="iconItem"
                        >
                            <span className="iconBg" onClick={startStream}>
                                <PlayArrowIcon className="icon" />
                            </span>
                            <Text className="iconText"> Start stream </Text>
                        </Container>
                    </>
                )}
                {hostStream && (
                    <>
                        {isVideoOn ? (
                            <Container
                                type="col"
                                rowCenter
                                colCenter
                                className="iconItem"
                            >
                                <span className="iconBg" onClick={toggleVideo}>
                                    <VideocamIcon className="icon" />
                                </span>
                                <Text className="iconText">Off Video</Text>
                            </Container>
                        ) : (
                            <Container
                                type="col"
                                rowCenter
                                colCenter
                                className="iconItem"
                            >
                                <span
                                    className="iconBg iconBgDisabled"
                                    onClick={toggleVideo}
                                >
                                    <VideocamOffIcon className="icon" />
                                </span>
                                <Text className="iconText">On Video</Text>
                            </Container>
                        )}
                        {isMicOn ? (
                            <Container
                                type="col"
                                rowCenter
                                colCenter
                                className="iconItem"
                            >
                                <span className="iconBg">
                                    <MicIcon
                                        onClick={toggleMic}
                                        className="icon"
                                    />
                                </span>
                                <Text className="iconText">Off Mic</Text>
                            </Container>
                        ) : (
                            <Container
                                type="col"
                                rowCenter
                                colCenter
                                className="iconItem"
                            >
                                <span className="iconBg iconBgDisabled">
                                    <MicOffIcon
                                        onClick={toggleMic}
                                        className="icon"
                                    />
                                </span>
                                <Text className="iconText">On Mic</Text>
                            </Container>
                        )}
                    </>
                )}
            </Container>
        </Container>
    );
};

export default Host;
