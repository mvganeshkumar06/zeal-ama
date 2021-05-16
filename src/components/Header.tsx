import {
    Container,
    useThemeContext,
    Text,
    useStyleContext,
} from "@zeal-ui/core";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import HomeIcon from "@material-ui/icons/Home";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import PersonIcon from "@material-ui/icons/Person";
import { useEffect } from "react";
import useSessionContext from "../hooks/useSessionContext";

const Header = () => {
    const style = useStyleContext();
    const { theme, toggleTheme } = useThemeContext();

    const styles = `
        width:100%;
        height: 4rem;
        position: fixed;
        top: 0;
        border-bottom: ${style.common.border};
        z-index:${style.zIndex[1]};
        background-color:${theme === "light" ? "white" : style.colors.gray[4]};

        .zealAmaLink{
            display:none;
        }

        .title {
            font-size:1.25rem;
            margin:0rem 0rem 0rem 3rem;
        }

        .iconsContainer {
            margin: 0rem 1.5rem 0rem 0.5rem;
        }

        .iconItem{
            display:none;
        }

        .themeIconItem{
            display:flex;
        }

        .icon {
            width:1.25rem;
            height:1.25rem;
            margin: 0rem 0.5rem;
        }

        .iconItem:hover, .iconText:hover {
            cursor: pointer;
        }

        .iconText{
            display:none;
        }

        @media(min-width:768px){
            .title{
                font-size:1.25rem;
            }
            .iconItem{
                display:flex;
            }
            .icon {
                margin: 0rem 2rem;
            }
            .iconText{
                display:initial;
                margin:0rem;
                font-size:0.85rem;
            }
        }

        @media (min-width: 1024px) {
            .zealAmaLink{
                display:inline;
            }
            .title {
                font-size: 1.5rem;
                margin-left: 1rem;
            }
            .iconsContainer {
                margin-left: auto;
                margin-right: 5rem;
            }
        }
    `;

    const { loginWithRedirect, logout, user } = useAuth0();

    const { dispatch } = useSessionContext();

    useEffect(() => {
        const savedUserName = localStorage.getItem("userName");
        if (savedUserName) {
            dispatch({
                type: "SET_USERNAME",
                payload: savedUserName,
            });
        } else {
            if (user && user.name) {
                dispatch({
                    type: "SET_USERNAME",
                    payload: user.name as string,
                });
                localStorage.setItem("userName", user.name as string);
            }
        }
    }, [user, dispatch]);

    return (
        <Container
            type="row"
            rowBetween
            colCenter
            width="100%"
            customStyles={styles}
        >
            <Container type="row" rowCenter colCenter>
                <a href="https://zeal-ama.netlify.app/">
                    <Text>Icon here</Text>
                </a>
                <Text className="title">Zeal AMA</Text>
            </Container>
            <Container type="row" colCenter className="iconsContainer">
                <Container
                    type="col"
                    rowCenter
                    className="iconItem themeIconItem"
                    onClick={toggleTheme}
                >
                    <Brightness4Icon className="icon" />
                    <Text className="iconText">Theme</Text>
                </Container>
                <Link to="/">
                    <Container type="col" rowCenter className="iconItem">
                        <HomeIcon className="icon" />
                        <Text className="iconText">Home</Text>
                    </Container>
                </Link>
                {user ? (
                    <Container
                        type="col"
                        rowCenter
                        className="iconItem"
                        onClick={() => {
                            localStorage.removeItem("userName");
                            logout({ returnTo: window.location.origin });
                        }}
                    >
                        <PersonIcon className="icon" />
                        <Text className="iconText">Logout</Text>
                    </Container>
                ) : (
                    <Container
                        type="col"
                        rowCenter
                        className="iconItem"
                        onClick={loginWithRedirect}
                    >
                        <PersonIcon className="icon" />
                        <Text className="iconText">Login</Text>
                    </Container>
                )}
            </Container>
        </Container>
    );
};

export default Header;
