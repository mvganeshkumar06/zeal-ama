import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home, Session, Rejoin } from "../pages/index";
import { Header, Navigation } from "../components/index";
import PrivateRoute from "./PrivateRoute";

const Routes = () => {
    return (
        <BrowserRouter>
            <Header />
            <Navigation />
            <Switch>
                <PrivateRoute path="/join/:sessionId">
                    <Session />
                </PrivateRoute>
                <Route path="/rejoin">
                    <Rejoin />
                </Route>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </BrowserRouter>
    );
};

export default Routes;
