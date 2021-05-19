import { Container, Text, useStyleContext } from "@zeal-ui/core";

const Question = () => {
    const style = useStyleContext();
    const styles = `
        width:15rem;
        height:30rem;
        margin:2rem 1rem;
        padding:1rem;
        box-sizing:border-box;
        border-radius:${style.common.borderRadius};
        
        @media(min-width:425px){
            width:20rem;
            height:35rem;
        }

        @media(min-width:768px){
            margin:0rem; 
            width:95%;
            height:50rem;
        }

        @media(min-width:1024px){
            width:75%;
        }

    `;

    return (
        <Container type="col" withBorder customStyles={styles}>
            <Text>Question component</Text>
        </Container>
    );
};

export default Question;
