import { Container, Text, Button } from "@zeal-ui/core";
import { useHistory } from "react-router-dom";

const Rejoin = () => {
    const styles = `
        margin:5rem 0rem;

        .title{
            margin-bottom:3rem;
        }

        .btn{
            margin:0rem 1rem;
        }
    `;

    const history = useHistory();

    const rejoinSession = () => {
        history.goBack();
    };

    const backToHome = () => {
        history.push("/");
    };

    return (
        <Container type="col" rowCenter customStyles={styles}>
            <Text type="mainHeading" className="title">
                You left the session
            </Text>
            <Container type="row" rowCenter colCenter>
                <Button color="orange" onClick={rejoinSession} className="btn">
                    Rejoin
                </Button>
                <Button color="blue" onClick={backToHome} className="btn">
                    Back to home
                </Button>
            </Container>
        </Container>
    );
};

export default Rejoin;
