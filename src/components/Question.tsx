import { useEffect, useState, FormEvent, KeyboardEvent } from "react";
import {
    Container,
    Text,
    useStyleContext,
    useThemeContext,
    Button,
} from "@zeal-ui/core";
import axios from "axios";
import useSessionContext from "../hooks/useSessionContext";
import SendIcon from "@material-ui/icons/Send";
import { QuestionType } from "../types/index";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import PriorityHighOutlinedIcon from "@material-ui/icons/PriorityHighOutlined";
import ClearIcon from "@material-ui/icons/Clear";

type QuestionPropType = {
    isHost: boolean;
};

const Question = ({ isHost }: QuestionPropType) => {
    const style = useStyleContext();
    const { theme } = useThemeContext();

    const styles = `
        width:15rem;
        height:30rem;
        margin:2rem 1rem;
        padding:1rem 0.5rem;
        box-sizing:border-box;
        border-radius:${style.common.borderRadius};
        
        .questionTypeContainer{
            margin-bottom:1rem;
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

        .questionContainer{
            position:relative;
            width:100%;
            height:100%;
        }

        .questionItem{
            position:relative;
            width:100%;
            height:65%;
            overflow-y:auto;
            margin:0rem;
            word-wrap:break-word;
            padding:0.25rem;
            box-sizing:border-box;
        }

        .questionItemContainer{
            padding-left:0.5rem;
            box-sizing:border-box;
            border-radius:${style.common.borderRadius};
            margin:0.5rem 0rem;
            box-shadow:1px 1px 1px ${
                theme === "light" ? style.colors.gray[3] : style.colors.gray[3]
            };
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
            font-size:0.85rem;
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
            width:88%;
            height:8rem;
            background-color:${
                theme === "light" ? "white" : style.colors.gray[4]
            };
            color:${theme === "light" ? "black" : "white"};
            border:${style.common.border};
            border-radius:${style.common.borderRadius};
            padding:${style.common.padding};
            box-sizing:border-box;
            resize:none;
        }

        .questionInput::placeholder{
            color:${style.colors.gray[3]};
        }

        .iconBg{
            width:2.5rem;
            height:2.5rem;
            background-color:${
                theme === "light" ? style.colors.blue[2] : style.colors.blue[3]
            };
            border-radius:50%;
            display:flex;
            justify-content:center;
            align-items:center;
            margin-left:1rem;
        }

        .iconBg:hover, .voteBg:hover, .markIcon:hover, .questionTypeBtn:hover{
            cursor:pointer;
            box-shadow:${style.common.boxShadow};
        }

        .markIcon:hover{
            cursor:pointer;
        }

        .voteBg{
            width:1.65rem;
            height:2rem;
            background-color:${
                theme === "light" ? style.colors.blue[2] : style.colors.blue[3]
            };
            border-radius:${style.common.borderRadius};
            margin-left:1rem;
            position:relative;
            border-top-left-radius:0rem;
            border-top-right-radius:0rem;
        }

        .voteIcon{
            width:2rem;
            height:2rem;
            color:black;
            position:absolute;
            bottom:0.5rem;
        }

        .votesCount{
            margin:0rem;
            font-size:0.75rem;
            color:black;
            position:absolute;
            top:0.55rem;
        }

        .sendQuestionIcon{
            width:1.5rem;
            height:1.5rem;
            margin-left:0.25rem;
            color:black;
        }

        .markIcon{
            width:1.5rem;
            height:2rem;
            margin-left:1rem;
            background-color:${
                theme === "light" ? style.colors.blue[2] : style.colors.blue[3]
            };
            color:black;
            border-radius:${style.common.borderRadius};
            border-top-left-radius:0rem;
            border-top-right-radius:0rem;
        }

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

    const {
        state: { isLoading, isError, session, socket, userName },
        dispatch,
    } = useSessionContext();

    const [question, setQuestion] = useState("");
    const [showUnansweredQuestions, setShowUnansweredQuestions] =
        useState(true);

    useEffect(() => {
        let SESSION_QUESTION_URL = `https://zeal-ama.herokuapp.com/session/${session.id}/question`;

        if (process.env.NODE_ENV === "development") {
            SESSION_QUESTION_URL = `http://localhost:5000/session/${session.id}/question`;
        }

        const fetchSessionQuestions = async () => {
            try {
                const response = await axios({
                    method: "get",
                    url: SESSION_QUESTION_URL,
                });
                dispatch({
                    type: "SET_SESSION_QUESTIONS",
                    payload: response.data,
                });
            } catch (error) {
                dispatch({
                    type: "SET_IS_ERROR",
                    payload: { sessionQuestion: true },
                });
                setTimeout(() => {
                    dispatch({
                        type: "SET_IS_ERROR",
                        payload: { sessionQuestion: false },
                    });
                }, 6000);
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
        setQuestion("");
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
                        onClick={() => setShowUnansweredQuestions(true)}
                    >
                        Unanswered Questions
                    </Button>
                    <Button
                        className={`questionTypeBtn ${
                            !showUnansweredQuestions && "questionTypeBtnActive"
                        }`}
                        onClick={() => setShowUnansweredQuestions(false)}
                    >
                        Answered Questions
                    </Button>
                </Container>
                {!isLoading.sessionQuestion && !isError.sessionQuestion && (
                    <Container type="col" rowCenter className="questionItem">
                        {questionsToDisplay.map((question: QuestionType) => (
                            <Container
                                type="row"
                                rowBetween
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
                                <abbr title="Upvote question">
                                    <Container
                                        type="col"
                                        rowCenter
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
                                </abbr>
                                {isHost && (
                                    <>
                                        <abbr title="Mark as answered">
                                            <CheckOutlinedIcon
                                                className="markIcon"
                                                onClick={() =>
                                                    markAnswered(question)
                                                }
                                            />
                                        </abbr>
                                        <abbr title="Mark as unanswered">
                                            <PriorityHighOutlinedIcon
                                                className="markIcon"
                                                onClick={() =>
                                                    markUnanswered(question)
                                                }
                                            />
                                        </abbr>
                                        <abbr title="Mark as spam">
                                            <ClearIcon
                                                className="markIcon"
                                                onClick={() =>
                                                    markSpam(question)
                                                }
                                            />
                                        </abbr>
                                    </>
                                )}
                            </Container>
                        ))}
                    </Container>
                )}
                <Container
                    type="row"
                    rowCenter
                    colCenter
                    width="100%"
                    className="questionInputContainer"
                >
                    <textarea
                        className="questionInput"
                        placeholder="Enter your questions"
                        value={question}
                        onChange={(event: FormEvent<HTMLTextAreaElement>) =>
                            setQuestion(event.currentTarget.value)
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
