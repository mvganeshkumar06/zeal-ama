import { ZealProvider } from "@zeal-ui/core";
import Routes from "./Routes/Router";
import { SessionProvider } from "./context/SessionProvider";

const App = () => {
    return (
        <ZealProvider>
            <SessionProvider>
                <Routes />
            </SessionProvider>
        </ZealProvider>
    );
};

export default App;
