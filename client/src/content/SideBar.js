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
import {deleteRequest, getRequest} from "../API_helper/APIs";
import {useNavigate} from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import {useTheme} from "@mui/material/styles";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import iamaiLogo from "../css/IAMAI-19-09-2024.png"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";
import {AppContext} from "../context/AppContext";
import {markedResponse} from "./markedResponse";
import axios from "axios";

const DrawerHeader = styled("div")(({theme}) => ({
    display: "flex",
    alignItems: "center",
    padding: theme?.spacing ? theme.spacing(0, 1) : '8px',
    // necessary for content to be below app bar
    ...theme?.mixins?.toolbar,
    justifyContent: "flex-end",
}));
const SideBar = ({
                     isSideBarOpen, updateIsSideBarOpen, setResponse, setLoading, setQuestion, setConversations,
                     historyList, setHistoryList, textareaRef, setQuestionImg, setSelectedHistory, selectedHistory

                 }) => {
    const {state} = useContext(UserContext);
    const navigate = useNavigate();
    const theme = useTheme();
    const {themeMode} = useContext(AppContext);

    useEffect(() => {
        const userId = state.user?._id;
         getUserDataByUserId(userId);
    }, [state]);

    const getUserDataByUserId = (userId) => {
        if (userId) {
            getRequest(`getUserDataById/${userId}`).then((res) => {
                setHistoryList(res.data);
            })
        }
    }

    const handleOnHistoryResponse = (his) => {
        setQuestionImg(null);
        setResponse(true);
        setLoading(false);
        // setQuestion(prompt);
        // setQuestionImg(image);
        // const selectedHistory =
        // markedResponse(response);
        setSelectedHistory({id : his._id});
        selectedHistory = {id : his._id}
        console.log(selectedHistory, "his,..", his.chatHistory);
        convertImageLinkToImageString(his.chatHistory, (chatHistory) => {
            setConversations(chatHistory)
        })
        if (isMobile)
            updateIsSideBarOpen(!isSideBarOpen);
    }

    const imageLinkToBase64 = async (imageUrl) => {
        try {
            const response = await axios.get(imageUrl, {responseType: 'arraybuffer'});
            const binary = new Uint8Array(response.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                '');
            const base64Image = btoa(binary);
            return `data:${response.headers['content-type']};base64,${base64Image}`;
        } catch (error) {
            console.error(`Error fetching image: ${error}`);
            return null;
        }
    }

    const convertImageLinkToImageString = async (chatHistory, callback) => {
        try {
            for (const chat of chatHistory) {
                if (chat.role === 'user' && chat.parts?.image) {
                    const imageData = await imageLinkToBase64(chat.parts.image); // Await here
                    chat.parts.image = imageData || null; // Update chat.parts.image directly
                }
            }
            callback(chatHistory);
        } catch (error) {
           console.log("Error while converting image link to base64: ", error);
        }
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
                                setConversations([]);
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
                                    <ListItem key={his} className={`${!isMobile ?'sidebar-list-item': ''} truncate`} disablePadding>
                                        <ListItemButton className={'truncate'}
                                                        style={{padding: '0 10px 0 10px'}}
                                                        onClick={() => handleOnHistoryResponse(his)}>
                                            <ListItemText primary={makeFirstLetterCaps(his.historyLabel)}/>

                                        </ListItemButton>
                                        <div className={'icon-container p-[2px] bg-gray-200 cursor-pointer'}>
                                            <FontAwesomeIcon icon={faXmark} className={'text-red-500'}
                                                             onClick={() => {
                                                                 setHistoryList(historyList.filter((val) => his._id !== val._id))
                                                                 deleteRequest(`deleteUserData/${his._id}`)
                                                                 .then(() => getUserDataByUserId(state.user?._id))}}/>
                                        </div>
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