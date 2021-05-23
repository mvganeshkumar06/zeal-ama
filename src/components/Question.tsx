import { useEffect, FormEvent, KeyboardEvent } from "react";
import {
    Container,
    Text,
    useStyleContext,
    useThemeContext,
    Button,
    Divider,
} from "@zeal-ui/core";
import axios from "axios";
import useSessionContext from "../hooks/useSessionContext";
import SendIcon from "@material-ui/icons/Send";
import { QuestionType } from "../types/index";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import { QuestionPropType } from "../types/index";

const Question = ({ isHost }: QuestionPropType) => {
    const style = useStyleContext();
    const { theme } = useThemeContext();

    const styles = `
        width:18rem;
        height:35rem;
        margin:2rem 0rem;
        box-sizing:border-box;
        border-radius:${style.common.borderRadius};
        
        .questionTypeContainer{
            margin:0.5rem 0rem;
        }

        .questionTypeBtn{
            margin:0rem 0.5rem;
            background-color:${
                theme === "light"
                    ? style.colors.orange[2]
                    : style.colors.orange[3]
            };
            color:black;
            outline:none;
        }

        .questionTypeBtnActive{
            border:2px solid ${theme === "light" ? "black" : "white"};
        }

        .questionDivider{
            margin:0rem;
            box-shadow:${style.common.boxShadow};
        }

        .questionContainer{
            position:relative;
            width:100%;
            height:100%;
        }

        .questionItem{
            position:relative;
            width:100%;
            height:62%;
            overflow-y:auto;
            margin:0rem;
            word-wrap:break-word;
        }

        .questionItemContainer{
            padding-left:0.5rem;
            box-sizing:border-box;
            margin:0.75rem 0rem;
            box-shadow:1px 1px 1px ${
                theme === "light" ? style.colors.gray[3] : style.colors.gray[3]
            };
            position:relative;
        }

        .question{
            width:100%;
            margin:0.5rem 0rem;
            word-wrap:break-word;
        }

        .title{
            font-size:1rem;
        }

        .creator, .question{
            margin:0rem;
        }

        .creator{
            font-weight:bold;
        }

        .questionInputContainer{
            position:absolute;
            left:0rem;
            bottom:0rem;
        }

        .questionInput{
            width:100%;
            height:8rem;
            background-color:${
                theme === "light" ? "white" : style.colors.gray[4]
            };
            color:${theme === "light" ? "black" : "white"};
            border:${style.common.border};
            border-radius:${style.common.borderRadius};
            border-top-left-radius:0rem;
            border-top-right-radius:0rem;
            padding:${style.common.padding};
            box-sizing:border-box;
            resize:none;
        }

        .questionInput::placeholder{
            color:${style.colors.gray[3]};
        }

        .iconBg{
            width:auto;
            height:100%;
            background-color:${
                theme === "light" ? style.colors.blue[2] : style.colors.blue[3]
            };
            display:flex;
            justify-content:center;
            align-items:center;
            position:absolute;
            bottom:0rem;
            right:0rem;
            border-bottom-right-radius:${style.common.borderRadius};
        }

        .iconBg:hover, .voteBg:hover, .actionBtn:hover, .questionTypeBtn:hover{
            cursor:pointer;
            box-shadow:${style.common.boxShadow};
        }

        .voteBg{
            width:3.5rem;
            height:3rem;
            margin-right:0.5rem;
            background-color:${
                theme === "light"
                    ? style.colors.purple[2]
                    : style.colors.purple[3]
            };
            border-radius:${style.common.borderRadius};
            border-bottom-left-radius:0rem;
            border-bottom-right-radius:0rem;
            position:relative;
        }

        .voteIcon{
            position:absolute;
            bottom:1.25rem;
            width:2rem;
            height:2rem;
            color:black;
        }

        .votesCount{
            position:absolute;
            top:1.25rem;
            margin:0rem;
            color:black;
            font-size:0.75rem;
        }

        .sendQuestionIcon{
            width:1.5rem;
            height:1.5rem;
            margin-left:0.25rem;
            color:black;
        }

        .actionContainer{
            margin-top:1.5rem;
        }

        .actionBtn{
            padding:0rem 0.25rem;
            margin:0rem 0.5rem;
            font-size:0.65rem;
            border-bottom-left-radius:0rem;
            border-bottom-right-radius:0rem;
        }

        @media(min-width:375px){
            width:90%;
            
            .questionItem{
                height:67%;
            }
        }

        @media(min-width:405px){
            .voteBg{
                width:3rem;
                height:1.65rem;
            }
            
            .voteIcon{
                bottom:0.25rem;
            }
    
            .votesCount{
                top:0.45rem;
            }
        }

        @media(min-width:768px){
            height:40rem;
            margin:5rem 0rem;

            .questionItemContainer{
                flex-direction:row;
            }

            .actionContainer{
                position:absolute;
                bottom:60%;
                right:0rem;
            }

            .voteBg{
                width:3rem;
                height:1.5rem;
                border-radius:${style.common.borderRadius};
                border-top-left-radius:0rem;
                border-top-right-radius:0rem;
            }

            .votesCount{
                top:0.25rem;
            }

            .actionBtn{
                margin-left:0.5rem;
                border-radius:${style.common.borderRadius};
                border-top-left-radius:0rem;
                border-top-right-radius:0rem;
            }
        }

        @media(min-width:1024px){
            width:95%;
            height:45rem;
            margin:0rem;
        }

    `;

    const {
        state: {
            isLoading,
            isError,
            session,
            socket,
            userName,
            question,
            showUnansweredQuestions,
        },
        dispatch,
    } = useSessionContext();

    useEffect(() => {
        const fetchSessionQuestions = async () => {
            try {
                const response = await axios.get<QuestionType[]>(
                    `https://zeal-ama.herokuapp.com/session/${session.id}/question`
                );
                dispatch({
                    type: "SET_SESSION_QUESTIONS",
                    payload: response.data,
                });
            } catch (error) {
                console.log(error.response?.data || error.message);
                dispatch({
                    type: "SET_IS_ERROR",
                    payload: { sessionQuestion: true },
                });
            } finally {
                dispatch({
                    type: "SET_IS_LOADING",
                    payload: { sessionQuestion: false },
                });
            }
        };

        fetchSessionQuestions();
    }, [dispatch, session.id]);

    useEffect(() => {
        const listenToSocketEvents = () => {
            socket.on("question-update", (questions: QuestionType[]) => {
                dispatch({
                    type: "SET_SESSION_QUESTIONS",
                    payload: questions,
                });
            });
        };
        listenToSocketEvents();
        // eslint-disable-next-line
    }, []);

    const sendQuestion = () => {
        socket.emit("question", userName, question);
        dispatch({ type: "SET_QUESTION", payload: "" });
    };

    const upvoteQuestion = (question: QuestionType, userName: string) => {
        const upvoted = question.upvotes.users.find(
            (user) => user === userName
        );
        if (!upvoted) {
            socket.emit("question-upvote", userName, question._id);
        }
    };

    const markAnswered = (question: QuestionType) => {
        if (!question.isAnswered) {
            socket.emit("question-answered", question._id, true);
        }
    };

    const markUnanswered = (question: QuestionType) => {
        if (question.isAnswered) {
            socket.emit("question-answered", question._id, false);
        }
    };

    const markSpam = (question: QuestionType) => {
        socket.emit("question-spam", question._id);
    };

    const sortedQuestions = session.questions.sort(
        (question1: QuestionType, question2: QuestionType) => {
            if (question1.upvotes.count > question2.upvotes.count) {
                return -1;
            }
            return 1;
        }
    );

    const unansweredQuestions = sortedQuestions.filter(
        (question: QuestionType) => !question.isAnswered
    );

    const answeredQuestions = sortedQuestions.filter(
        (question: QuestionType) => question.isAnswered
    );

    const questionsToDisplay = showUnansweredQuestions
        ? unansweredQuestions
        : answeredQuestions;

    return (
        <Container type="col" withBorder customStyles={styles}>
            <Container
                type="col"
                rowCenter
                width="100%"
                className="questionContainer"
            >
                <Container
                    type="row"
                    rowCenter
                    colCenter
                    width="100%"
                    className="questionTypeContainer"
                >
                    <Button
                        className={`questionTypeBtn ${
                            showUnansweredQuestions && "questionTypeBtnActive"
                        }`}
                        onClick={() =>
                            dispatch({
                                type: "SET_UNANSWERED_QUESTIONS",
                                payload: true,
                            })
                        }
                    >
                        Unanswered Questions
                    </Button>
                    <Button
                        className={`questionTypeBtn ${
                            !showUnansweredQuestions && "questionTypeBtnActive"
                        }`}
                        onClick={() =>
                            dispatch({
                                type: "SET_UNANSWERED_QUESTIONS",
                                payload: false,
                            })
                        }
                    >
                        Answered Questions
                    </Button>
                </Container>
                <Divider className="questionDivider" />
                {!isLoading.sessionQuestion && !isError.sessionQuestion && (
                    <Container type="col" rowCenter className="questionItem">
                        {questionsToDisplay.map((question: QuestionType) => (
                            <Container
                                type="col"
                                withBorder
                                width="100%"
                                key={question._id}
                                className="questionItemContainer"
                            >
                                <Container
                                    type="col"
                                    colCenter
                                    className="question"
                                >
                                    <Text className="creator" color="blue">
                                        {question.creator}
                                    </Text>
                                    <Text className="title">
                                        {question.title}
                                    </Text>
                                </Container>
                                {isHost ? (
                                    <Container
                                        type="row"
                                        rowCenter
                                        colCenter
                                        className="actionContainer"
                                    >
                                        <Container
                                            type="col"
                                            rowCenter
                                            colCenter
                                            className="voteBg"
                                            onClick={() =>
                                                upvoteQuestion(
                                                    question,
                                                    userName
                                                )
                                            }
                                        >
                                            <ArrowDropUpIcon className="voteIcon" />
                                            <Text className="votesCount" bold>
                                                {question.upvotes.count}
                                            </Text>
                                        </Container>
                                        <Button
                                            color="green"
                                            className="actionBtn"
                                            onClick={() =>
                                                markAnswered(question)
                                            }
                                        >
                                            Mark answered
                                        </Button>
                                        <Button
                                            color="orange"
                                            className="actionBtn"
                                            onClick={() =>
                                                markUnanswered(question)
                                            }
                                        >
                                            Mark unanswered
                                        </Button>
                                        <Button
                                            color="red"
                                            className="actionBtn"
                                            onClick={() => markSpam(question)}
                                        >
                                            Mark spam
                                        </Button>
                                    </Container>
                                ) : (
                                    <Container
                                        type="row"
                                        colCenter
                                        className="voteBg"
                                        onClick={() =>
                                            upvoteQuestion(question, userName)
                                        }
                                    >
                                        <ArrowDropUpIcon className="voteIcon" />
                                        <Text className="votesCount" bold>
                                            {question.upvotes.count}
                                        </Text>
                                    </Container>
                                )}
                            </Container>
                        ))}
                    </Container>
                )}
                <Container
                    type="row"
                    width="100%"
                    className="questionInputContainer"
                >
                    <textarea
                        className="questionInput"
                        placeholder="Enter your questions"
                        value={question}
                        onChange={(event: FormEvent<HTMLTextAreaElement>) =>
                            dispatch({
                                type: "SET_QUESTION",
                                payload: event.currentTarget.value,
                            })
                        }
                        onKeyPress={(event: KeyboardEvent) => {
                            if (event.key === "Enter") {
                                sendQuestion();
                            }
                        }}
                        maxLength={250}
                    />
                    <span className="iconBg" onClick={sendQuestion}>
                        <SendIcon className="sendQuestionIcon">Send</SendIcon>
                    </span>
                </Container>
            </Container>
        </Container>
    );
};

export default Question;
