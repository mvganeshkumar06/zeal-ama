import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Home, Session } from "../pages/index";
import { Header, Navigation } from "../components/index";

const Routes = () => {
    return (
        <BrowserRouter>
            <Header />
            <Navigation />
            <Switch>
                <Route path="/join/:sessionId">
                    <Session />
                </Route>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </BrowserRouter>
    );
};

export default Routes;
