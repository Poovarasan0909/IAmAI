import React, {useContext, useEffect} from 'react';
import styled from "styled-components";
import {
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import useIsMobile from "../hooks/useIsMobile";
import {UserContext} from "../context/UserContext";
import {getRequest} from "../API_helper/APIs";
import {useNavigate} from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import {useTheme} from "@mui/material/styles";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import iamaiLogo from "../css/IAMAI-19-09-2024.png"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {AppContext} from "../context/AppContext";
import {markedResponse} from "./markedResponse";

const DrawerHeader = styled("div")(({theme}) => ({
    display: "flex",
    alignItems: "center",
    padding: theme?.spacing ? theme.spacing(0, 1) : '8px',
    // necessary for content to be below app bar
    ...theme?.mixins?.toolbar,
    justifyContent: "flex-end",
}));
const SideBar = ({
                     isSideBarOpen, updateIsSideBarOpen, setResponse, setLoading,
                     setQuestion, historyList, setHistoryList, textareaRef
                 }) => {
    const {state} = useContext(UserContext);
    const navigate = useNavigate();
    const theme = useTheme();
    const {themeMode} = useContext(AppContext);

    useEffect(() => {
        const userId = state.user?._id;
        if (userId) {
            getRequest(`getUserDataById/${userId}`).then((res) => {
                setHistoryList(res.data?.reverse());
            })
        }
    }, [state]);

    const handleOnHistoryResponse = (response, prompt) => {
        if (document.getElementById("response_element"))
            document.getElementById("response_element").innerHTML = '';
        setResponse(true);
        setLoading(false);
        setQuestion(prompt);
        markedResponse(response);
        if (isMobile)
            updateIsSideBarOpen(!isSideBarOpen);
    }

    const makeFirstLetterCaps = (value) => {
        const firstChar = value.charAt(0).toUpperCase();
        return firstChar + value.substring(1);
    }
    const isMobile = useIsMobile();

    const drawerWidth = 270;

    return (
        <Box sx={{display: "flex"}}>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => updateIsSideBarOpen(!isSideBarOpen)}
                edge="start"
                className={'p-0 dark:text-amber-50'}
                sx={[
                    {
                        mr: 2,
                        ml: 2
                    },
                    isSideBarOpen && {display: "none"},
                ]}
            >
                <MenuIcon/>
            </IconButton>
            {isSideBarOpen &&
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            backgroundColor: themeMode === 'light' ? 'white' : '#222020'
                        },
                    }}
                    variant="persistent"
                    anchor="left"
                    open={isSideBarOpen}
                >
                    <DrawerHeader style={{position: "sticky"}}>
                        <img src={iamaiLogo} alt="IAmAI" style={{width: '150px', height: '40px'}}/>
                        <IconButton className={'dark:text-white'} onClick={() => updateIsSideBarOpen(!isSideBarOpen)}>
                            {theme.direction === "ltr" ? (
                                <ChevronLeftIcon/>
                            ) : (
                                <ChevronRightIcon/>
                            )}
                        </IconButton>
                    </DrawerHeader>
                    <Divider/>
                    <button type="button"
                            onClick={() => {
                                setResponse(false);
                                if (isMobile)
                                    updateIsSideBarOpen(false);
                                textareaRef.current.value = "";
                                textareaRef.current.focus();
                            }}
                            className="mt-2 ml-8 text-white w-3/4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ">
                        <FontAwesomeIcon icon={faPlus} style={{fontWeight: 'bold'}}/>
                        {'        New Chat'}
                    </button>

                    {state.user ? <>
                            <div className={'px-2 pt-3 dark:text-white'}><b>History</b></div>
                            <List className={'dark:text-white '} sx={{overflowX: 'auto', maxHeight: '72vh'}}>
                                {historyList && historyList.map((his) => (
                                    <ListItem key={his} className={'truncate'} disablePadding>
                                        <ListItemButton style={{padding: '0 10px 0 10px'}}
                                                        onClick={() => handleOnHistoryResponse(his.response, his.prompt)}>
                                            <ListItemText primary={makeFirstLetterCaps(his.prompt)}/>
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>

                            {historyList && historyList.length === 0 &&
                                <h6 className={'text-center mt-6 dark:text-white'}>No History Found Yet</h6>}
                        </>
                        : <>
                            <div className={'text-center mt-12 dark:text-white'}>
                                <h6>Sign in to access additional benefits.</h6>
                                <button
                                    className={`cursor-pointer mr-3 inline-flex items-center rounded-full lg:px-4 py-1 text-1xl font-mono font-semibold text-blue-600
                            hover:text-white border-2 border-blue-600 hover:bg-blue-600 transition ease-in-out delay-150 hover:translate-y-1 hover:scale-75 duration-300 focus:bg-transparent max-md:px-1`}
                                    onClick={() => navigate("/IAmAI/signin")}>
                                    Sign in
                                </button>
                            </div>
                        </>}
                </Drawer>}
        </Box>
    );
}

export default SideBar;