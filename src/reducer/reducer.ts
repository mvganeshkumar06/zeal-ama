const reducer = (state:any, action:any) => {
    switch (action.type) {

        case "SET_SESSION":
            return {
                ...action.payload
            }
        default:
            return state;
    }
};

export default reducer;
