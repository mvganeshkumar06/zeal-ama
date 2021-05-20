type QuestionType = {
    _id: string;
    title: string;
    creator: string;
    upvotes: {
        count: number;
        users: string[];
    };
    isAnswered: boolean;
};

export default QuestionType;
