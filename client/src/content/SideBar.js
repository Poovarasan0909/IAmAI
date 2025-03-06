import React, {useContext, useEffect, useRef, useState} from 'react';
import styled from "styled-components";
import {
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText, Slide,
} from "@mui/material";
import useIsMobile from "../hooks/useIsMobile";
import {UserContext} from "../context/UserContext";
import {deleteRequest, getRequest} from "../API_helper/APIs";
import {useNavigate} from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import iamaiLogo from "../css/IAMAI-19-09-2024.png"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faEllipsis} from "@fortawesome/free-solid-svg-icons";
import {AppContext} from "../context/AppContext";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import {getAuthToken} from "../service/authToken";

const DrawerHeader = styled("div")(({theme}) => ({
    display: "flex",
    alignItems: "center",
    padding: theme?.spacing ? theme.spacing(0, 1) : '8px',
    ...theme?.mixins?.toolbar,
    justifyContent: "flex-end",
}));
const SideBar = ({
                     isSideBarOpen, updateIsSideBarOpen, setLoading, setConversations,
                     historyList, setHistoryList, textareaRef, selectedHistoryId, setSelectedHistoryId,
                     listItemPopupMenuId, setListItemPopupMenuId
                 }) => {
    const {state} = useContext(UserContext);
    const navigate = useNavigate();
    const {themeMode} = useContext(AppContext);
    const [iconPosition, setIconPosition] = useState({ top: 0, left: 0, bottom: 0 });
    const listRef = useRef(null);
    const [mouseHoveredListId, setMouseHoveredListId] = useState(null);

    const handleScroll = () => {
        if (!listRef.current) return;
        setTimeout(() => {
            const listItems = listRef.current.querySelectorAll('li');
            listItems.forEach((ellipseButton) => {
                if (ellipseButton) {
                    const name = ellipseButton.getAttribute("name")
                    if (name === listItemPopupMenuId) {
                        const ellipsisButtonPosition = ellipseButton.getBoundingClientRect();
                        setIconPosition({...iconPosition,top: ellipsisButtonPosition.top, bottom: ellipsisButtonPosition.bottom})
                    }
                }
            });
        }, 50)
    };

    const handleMenuOpen = (event, hisId) => {
        event.stopPropagation();
        const iconRect = event.currentTarget.getBoundingClientRect();
        setIconPosition({top: iconRect.top, left: iconRect.left, bottom: iconRect.bottom});
        setListItemPopupMenuId(listItemPopupMenuId === hisId ? null : hisId);
    }

    const {data: userData, refetch: refetchUserData, isSuccess: isSuccessUserData} = useQuery({
        queryKey: ['userData', state.user?._id],
        queryFn: async () => {
            return await getRequest(`api/getUserDataById/${state.user?._id}`);
        },
        retry: 3,
        retryDelay: 2000,
        staleTime: 2000,
        enabled: !!state.user?._id && getAuthToken() !== 'null'
    })
    useEffect(() => {
        setHistoryList(userData?.data);
    }, [userData, isSuccessUserData]);

    const handleOnHistoryResponse = (his) => {
        setLoading(true);
        setSelectedHistoryId(his._id);
        convertImageLinkToImageString(his.chatHistory, (chatHistory) => {
            setConversations(chatHistory)
            setLoading(false);
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
                    const imageData = await imageLinkToBase64(chat.parts.image);
                    chat.parts.image = imageData || null;
                }
            }
            callback(chatHistory);
        } catch (error) {
            console.log("Error while converting image link to base64: ", error);
        }
    }

    const makeFirstLetterCaps = (value) => {
        if (!value) return value;
        const firstChar = value.charAt(0).toUpperCase();
        return firstChar + value.substring(1);
    }
    const isMobile = useIsMobile();

    const drawerWidth = 270;

    const isMenuOpen = Boolean(listItemPopupMenuId);
    return (
        <Box sx={{display: "flex"}}>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => updateIsSideBarOpen(!isSideBarOpen)}
                edge="start"
                className={'p-0 dark:text-amber-50 z-[9999]'}
                sx={[
                    {
                        mr: 1, ml: 1, mb: 1
                    },
                    isMobile && {mr: 0, mb: 4},
                    isSideBarOpen && {display: "none"},
                ]}
            >
                <ArrowForwardIosIcon/>
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
                    <Slide direction="right" in={isSideBarOpen} mountOnEnter unmountOnExit timeout={500}>
                        <div>
                            <DrawerHeader style={{position: "sticky"}}>
                                <img src={iamaiLogo} alt="IAmAI"
                                     style={{width: '150px', height: '40px', marginRight: '40px'}}/>
                            </DrawerHeader>
                            <Divider/>
                            <button type="button"
                                    onClick={() => {
                                        setConversations([]);
                                        setSelectedHistoryId(null);
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
                                        <List ref={listRef} className={'dark:text-white '} sx={{overflowX: 'auto', maxHeight: '72vh'}}
                                              onScroll={handleScroll}>
                                            {historyList && historyList.map((his) => (
                                                <ListItem key={his._id} name={his._id}
                                                          onMouseEnter={() => setMouseHoveredListId(his._id)}
                                                          onMouseLeave={() => setMouseHoveredListId(null)}
                                                          className={`${!isMobile ? 'sidebar-list-item' : ''} truncate ${his._id === selectedHistoryId ? 'bg-slate-300 dark:bg-gray-500' : ''}`}
                                                          disablePadding>
                                                    <ListItemButton className={'truncate'}
                                                                    style={{padding: '0 0 0 10px'}}
                                                                    onClick={() => handleOnHistoryResponse(his)}>
                                                        <ListItemText primary={makeFirstLetterCaps(his.historyLabel)}/>
                                                    {(mouseHoveredListId === his._id || listItemPopupMenuId === his._id || selectedHistoryId === his._id) &&
                                                        <div className={'icon-container p-[2px] cursor-pointer dark:bg-[rgba(64,61,61,0.82)] bg-[rgba(204,202,202,0.82)] rounded-tl-[8px]'}
                                                             onClick={(event) => handleMenuOpen(event, his._id)} key={his._id} name={his._id}>
                                                                <FontAwesomeIcon icon={faEllipsis} className={'dark:text-white'}/>
                                                        </div>}
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}

                                            {isMenuOpen &&
                                                <div style={{
                                                         left: iconPosition.left - 98,
                                                         top: iconPosition.top + (iconPosition.bottom + 100 > window.innerHeight ? -90 : 30),
                                                         boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                                         zIndex: 2000,
                                                         borderRadius: "8px",
                                                         padding: "8px 7px",
                                                         minWidth: "150px",
                                                         border: "1px solid rgba(0, 0, 0, 0.1)",
                                                         backgroundColor: themeMode === 'light' ? 'white' : 'rgb(116,116,117)'
                                                }} className={"fixed"}>
                                                    <div className={"cursor-pointer rounded hover:bg-blue-50 p-1 dark:hover:bg-[#0000005c]"}>
                                                        <span className={"pr-2"}><DriveFileRenameOutlineIcon/></span>
                                                        Rename
                                                    </div>
                                                    <div className={"text-[#ff7777] cursor-pointer rounded p-1 hover:bg-red-100 dark:hover:bg-[#0000005c]"}
                                                    onClick={() => {
                                                        setHistoryList(historyList.filter((val) => listItemPopupMenuId !== val._id))
                                                        deleteRequest(`api/deleteUserData/${listItemPopupMenuId}`)
                                                            .then(() => refetchUserData())
                                                    }}>
                                                        <span className={"pr-2 "}><DeleteIcon/></span>
                                                        Delete
                                                    </div>
                                                </div>
                                            }
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
                        </div>
                    </Slide>
                </Drawer>}
            {isSideBarOpen &&
                <IconButton className={'dark:text-white z-[9999]'}
                            onClick={() => updateIsSideBarOpen(!isSideBarOpen)}>
                    <ArrowBackIosIcon/>
                </IconButton>}
            {isMobile && !isSideBarOpen && <img src={iamaiLogo} alt="IAmAI"
                                                style={{
                                                    maxWidth: '130px',
                                                    height: '40px',
                                                    marginRight: '40px',
                                                    marginBottom: '34px',
                                                    zIndex: 9999
                                                }}/>}
        </Box>
    );
}

export default SideBar;