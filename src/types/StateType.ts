type StateType = {
    session: {
        id: string;
        name: string;
        host: string;
    };
    hostStream: MediaStream | undefined;
    userName: string;
    participants: string[];
    isLoading: {
        login: boolean;
        session: boolean;
    };
};

export default StateType;
