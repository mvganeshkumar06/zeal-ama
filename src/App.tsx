import { ZealProvider } from "@zeal-ui/core";
import Routes from "./Routes/Router";
import { SessionProvider } from "./context/SessionProvider";
import { Auth0Provider } from "@auth0/auth0-react";

const App = () => {
    const domain = process.env.REACT_APP_DOMAIN as string;
    const clientId = process.env.REACT_APP_CLIENT_ID as string;

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            redirectUri={window.location.origin}
        >
            <ZealProvider>
                <SessionProvider>
                    <Routes />
                </SessionProvider>
            </ZealProvider>
        </Auth0Provider>
    );
};

export default App;
