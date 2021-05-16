import { ReactNode } from "react";
import { Redirect, Route } from "react-router-dom";

const PrivateRoute = ({
    children,
    ...rest
}: {
    children: ReactNode;
    path: string;
}) => {
    const userName = localStorage.getItem("userName");

    if (userName) {
        return <Route {...rest}>{children}</Route>;
    }

    return <Redirect to="/" />;
};

export default PrivateRoute;
