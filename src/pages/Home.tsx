import {
    Container,
    Text,
    useStyleContext,
    useThemeContext,
    Input,
    Button,
} from "@zeal-ui/core";
import { useHistory } from "react-router-dom";
import VideoCallIcon from "@material-ui/icons/VideoCall";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const Home = () => {
    const style = useStyleContext();
    const { theme } = useThemeContext();

    const styles = `
    
        margin:5rem 0rem;
        
        .sessionContainer{
            width:70vw;
            border-radius:${style.common.borderRadius};
        }

        .createSessionItem{
            margin:1rem;
            padding:0.25rem ${style.common.padding};
            border-radius:${style.common.borderRadius};
            background-color:${
                theme === "light"
                    ? style.colors.orange[2]
                    : style.colors.orange[3]
            };
            color:black;
        }

        .createSessionIcon{
            width:1.5rem;
            height:1.5rem;
            margin-right:0.5rem;   
        }

        .joinSessionItem{
            margin:1rem;
        }

        .input{
            height:2.25rem;
        }

        .joinBtn{
            height:3rem;
            margin-left:1rem;
            color:black;
        }


        @media(min-width:1024px){
            .sessionContainer{
                width:50vw;
            }
        }

    `;

    // Get info from user
    const hostName = "Krishna";
    const sessionName = "AMA with me";

    const history = useHistory();

    const saveSessionDetailsOnDb = async (
        sessionId: string,
        sessionName: string,
        hostName: string
    ) => {
        try {
            const response = await axios({
                method: "post",
                url: "https://zeal-ama.herokuapp.com/session",
                data: {
                    sessionId: sessionId,
                    sessionName: sessionName,
                    hostName: hostName,
                },
            });
            history.push(`/join/${response.data}`);
        } catch (error) {
            console.log(error);
        }
    };

    const createSession = () => {
        const sessionId = uuidv4();
        saveSessionDetailsOnDb(sessionId, sessionName, hostName);
    };

    return (
        <Container type="col" rowCenter customStyles={styles}>
            <Text type="mainHeading">Home</Text>
            <Container
                type="row"
                rowCenter
                colCenter
                withBorder
                className="sessionContainer"
            >
                <Container
                    type="row"
                    colCenter
                    onClick={createSession}
                    className="createSessionItem"
                >
                    <VideoCallIcon className="createSessionIcon" />
                    <Text className="createSessionText">
                        Create AMA Session
                    </Text>
                </Container>
                <Container type="row" colCenter className="joinSessionItem">
                    <Input
                        type="text"
                        placeholder="Enter AMA Session Link"
                        className="input"
                    />
                    <Button className="joinBtn" color="blue">
                        Join AMA Session
                    </Button>
                </Container>
            </Container>
        </Container>
    );
};

export default Home;
