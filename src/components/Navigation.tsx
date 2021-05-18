import { useState } from "react";
import {
    Container,
    List,
    ListItem,
    useStyleContext,
    useThemeContext,
    Text,
} from "@zeal-ui/core";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import MenuIcon from "@material-ui/icons/Menu";
import { Link } from "react-router-dom";
import navigationItems from "../utils/NavigationItems";
import PersonIcon from "@material-ui/icons/Person";
import { useAuth0 } from "@auth0/auth0-react";

const Navigation = () => {
    const style = useStyleContext();
    const { theme } = useThemeContext();

    const styles = `
        .navigationListContainer {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            padding: 2rem 1rem;
            background-color:${
                theme === "light" ? style.colors.gray[1] : style.colors.gray[3]
            };
            z-index: ${style.zIndex[3]};
        }

        .navigationOpenBtn {
            width:1.5rem;
            height:1.5rem;
            position: fixed;
            top: 1.25rem;
            left: 0.5rem;
            z-index: ${style.zIndex[1]};
        }

        .navigationCloseBtn {
            width:1.5rem;
            height:1.5rem;
            position: absolute;
            top: 1.25rem;
            right: 0.5rem;
            z-index: ${style.zIndex[1]};
        }

        .navigationOpenBtn:hover,
        .navigationCloseBtn:hover {
            cursor: pointer;
        }

        .link{
            display:flex;
            align-items:column;
            margin-top:1rem;
            margin-right:1rem;    
        }

        .link svg{
            width:1.5rem;
            height:1.5rem;
            margin-right:0.5rem;
        }

        .authText{
            margin:0rem;
        }

        @media (min-width: 768px) {
            .navigationOpenBtn {
                display: none;
            }
        }
    `;

    const [isNavigationOpen, setIsNavigationOpen] = useState(false);

    const { loginWithRedirect, logout, user } = useAuth0();

    return (
        <Container type="col" customStyles={styles}>
            <MenuIcon
                className="navigationOpenBtn"
                onClick={() => setIsNavigationOpen(!isNavigationOpen)}
            />
            {isNavigationOpen && (
                <Container className="navigationListContainer">
                    <HighlightOffIcon
                        className="navigationCloseBtn"
                        onClick={() => setIsNavigationOpen(!isNavigationOpen)}
                    />
                    <List type="link">
                        {navigationItems.map(({ id, name, url, icon }) => {
                            return (
                                <ListItem key={id}>
                                    <Link
                                        to={url}
                                        onClick={() => {
                                            setIsNavigationOpen(
                                                !isNavigationOpen
                                            );
                                        }}
                                        className="link"
                                    >
                                        {icon}
                                        {name}
                                    </Link>
                                </ListItem>
                            );
                        })}
                        {user ? (
                            <ListItem key={2}>
                                <Link
                                    to="/login"
                                    onClick={() => {
                                        localStorage.removeItem("userName");
                                        logout({
                                            returnTo: window.location.origin,
                                        });
                                        setIsNavigationOpen(!isNavigationOpen);
                                    }}
                                    className="link"
                                >
                                    <PersonIcon />
                                    <Text className="authText">Logout</Text>
                                </Link>
                            </ListItem>
                        ) : (
                            <ListItem key={3}>
                                <Link
                                    to={`/login`}
                                    onClick={() => {
                                        loginWithRedirect();
                                        setIsNavigationOpen(!isNavigationOpen);
                                    }}
                                    className="link"
                                >
                                    <PersonIcon />
                                    <Text className="authText">Login</Text>
                                </Link>
                            </ListItem>
                        )}
                    </List>
                </Container>
            )}
        </Container>
    );
};

export default Navigation;
