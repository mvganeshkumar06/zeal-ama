import HomeIcon from "@material-ui/icons/Home";
import MicIcon from "@material-ui/icons/Mic";
import VideocamIcon from "@material-ui/icons/Videocam";

const navigationItems = [
    {
        id: 1,
        name: "Home",
        url: "/",
        icon: <HomeIcon />,
    },
    {
        id: 2,
        name: "Podcasts",
        url: "/podcasts",
        icon: <MicIcon />,
    },
    {
        id: 3,
        name: "Videos",
        url: "/videos",
        icon: <VideocamIcon />,
    },
];

export default navigationItems;
