import React, {useContext, useEffect, useRef, useState} from 'react'
import SendIcon from "@mui/icons-material/Send";
import {AppContext} from "../context/AppContext";
import {UserContext} from "../context/UserContext";
import UserProfile from "./UserProfile";
import {io} from "socket.io-client";
import {isMobile} from "react-device-detect";
import {deleteRequest, getRequest, postRequest} from "../API_helper/APIs";
import packageJson from "../../package.json";
import {useNavigate} from "react-router-dom";
import {adjustTextareaHeight, calculateLines} from "../service/commonFun";
import RefreshIcon from '@mui/icons-material/Refresh';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CustomMenu from "../common/CustomMenu";
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ListLoader from "../loader/ListLoader";
import {useQuery} from "@tanstack/react-query";

const baseURL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://192.168.29.57:4000' : packageJson.baseURL;

const token = localStorage.getItem("token");
const socket = io(baseURL, {
    auth: {token},
    transports: ["websocket"],
});

const Chat = () => {
    const {isServerActive, isServerMsgVisible, themeMode} = useContext(AppContext);
    let {state, setState} = useContext(UserContext);
    const navigate = useNavigate();

    const [textareaHeight, setTextareaHeight] = useState('4.5rem');
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);
    const chatRef = useRef(null);
    const privateChatRef = useRef(null);
    const privateChatMobileRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [chatTabValue, setChatTabValue] = useState('list_view');
    const [selectedPrivateUser, setSelectedPrivateUser] = useState(null);
    let [privateMessages, setPrivateMessages] = useState([]);
    const [chatHeight, setChatHeight] = useState(window.innerHeight - 160);
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
    const [isChatMessageSelectable, setIsChatMessageSelectable] = useState(false);
    const [selectedGroupChat, setSelectedGroupChat] = useState([])
    const [selectedPrivateChat, setSelectedPrivateChat] = useState([]);
    const [isGroupChatView, setIsGroupChatView] = useState(false);

    window.onload = () => {
        socket.emit('getListOfOnlineUsers');
        socket.on("online_users", (users) => {
            const onlineUser = users.map(user =>
                user.userId === state.user._id ? {...user, userName: "You"} : user);
            setTimeout(() => {
                setOnlineUsers(onlineUser);
            }, 100)
        });
    }

    useEffect(() => {
        const updateHeight = () => setChatHeight(window.innerHeight - 160);
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    useEffect(() => {
        function handleKeydown(event) {
            if(event.key === 'Escape') {
              uncheckAllInputField(chatRef)
              uncheckAllInputField(privateChatRef);
              clearSelections();
            }
        }
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("keydown", handleKeydown);
        }
    }, [])

    useEffect(() => {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        if (userData) {
            const data = {...state, user: userData}
            setState(data);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            state = data;
        } else {
            navigate('/IAmAI/signin');
            return;
        }
        if(state.user) {
            socket.emit("private_room", {
                userId: state.user._id,
                userName: state.user.username,
                socketId: socket.id
            })
        }
        socket.on("online_users", (users) => {
            const onlineUser = users.map(user =>
                user.userId === state.user._id ? { ...user, userName: "You" } : user);
            setOnlineUsers(onlineUser);
        });
        socket.on("receive_private_message", (data) => {
            const prtMsg = [...data];
            setPrivateMessages(prtMsg);
            setTimeout(() => {
                setScrollDownToLatestMessage(privateChatRef)
                setScrollDownToLatestMessage(privateChatMobileRef)
            }, 300);
        });
    }, [])

    useEffect(() => {
        socket.on("chat_history", (history) => {
            setMessages(history.map((msg) => ({
                id: msg._id,
                status: msg.userId === state.user?._id ? "sent" : "received",
                message: msg.message,
                userName: msg.userName,
                color: msg.color,
                timeStamp: msg.timeStamp,
                type:msg.type
            })));
        });
        socket.on("receive_message", (data) => {
            console.log("Message received:", data);
            const senderType = data.userId === state.user._id ? "sent" : "received";
            setMessages((prevMessages) => [...prevMessages, {
                id: data._id,
                status: senderType,
                message: data.message,
                userName: data.userName,
                color: data.color,
                timeStamp: data.timeStamp,
                type:data.type
            }]);
            setTimeout(() => {
                setScrollDownToLatestMessage(chatRef);
            }, 50);
        });

        return () => {
            socket.off("receive_message");
            socket.off("chat_history");
            socket.off("online_users");
        };
    }, [state.user?._id]);



    const fetchPrivateMessages = async (senderId, receiverId) => {
        const response = await postRequest('api/fetchPrivateChatMessages', {senderId, receiverId});
        if (response.status !== 200) throw new Error('Failed to fetch private messages');
        return response.data;
    }
    const fetchPublicMessage = async () => {
        const response = await getRequest('api/fetchAllPublicChatMessage');
        if (response.status !== 200) throw new Error('Failed to fetch public messages');
        return response.data;
    }

    const { data: fetchedPrivateMessageData,refetch, isLoading: isPrivateMessageLoading} = useQuery({
       queryKey: ['private_messages', state.user?._id, selectedPrivateUser?.userId],
       queryFn: async () => {
           if (!state.user?._id || !selectedPrivateUser?.userId) return Promise.reject("Invalid query parameters");
           return fetchPrivateMessages(state.user?._id, selectedPrivateUser?.userId)
       },
       enabled: !!(selectedPrivateUser?.userId && state.user),
    })

    const { data: fetchedPublicMessageData, isLoading: isPublicMessageLoading } = useQuery({
        queryKey: ['public_messages'],
        queryFn: fetchPublicMessage,
    })

    useEffect(() => {
        if(fetchedPublicMessageData) {
            setMessages(fetchedPublicMessageData.map((msg) => ({
                id: msg._id,
                status: msg.userId === state.user?._id ? "sent" : "received",
                message: msg.message,
                userName: msg.userName,
                color: msg.color,
                timeStamp: msg.timeStamp,
                type: msg.type
            })));
            setTimeout(() => {
                setScrollDownToLatestMessage(chatRef)
            }, 50);
        }
    },[fetchedPublicMessageData])

    useEffect(() => {
        setPrivateMessages(fetchedPrivateMessageData);
        setTimeout(() => {
            setScrollDownToLatestMessage(privateChatRef)
            setScrollDownToLatestMessage(privateChatMobileRef)
        }, 50);
    }, [fetchedPrivateMessageData])

    const uncheckAllInputField = (ref) => {
        if(ref) {
            const inputs = ref.current.querySelectorAll('input[type="checkbox"]')
            inputs.forEach((input) => {
                input.checked = false;
            })
        }
    }

    const setScrollDownToLatestMessage = (ref) => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && message.trim() === '') {
            event.preventDefault();
        }
        if (event.key === "Enter" && !event.shiftKey) {
            sendMessage()
        }
    }
    const sendMessage = () => {
        if (message.trim() === "") return;
        if(selectedPrivateUser === null) {
            socket.emit("send_message",
                {
                    message: message,
                    userId: state.user._id,
                    userName: state.user.username,
                    color: getRandomColorsById(state.user._id)
                });
        } else {
            const sendingMsg = {
                message: message,
                senderId: state.user._id,
                senderName: state.user.username,
                receiverId: selectedPrivateUser.userId,
                receiverName: selectedPrivateUser.userName,
                color: getRandomColorsById(state.user._id),
                timeStamp: Date.now()
            }
            socket.emit("send_private_message", sendingMsg )
            setPrivateMessages([...privateMessages, sendingMsg])
            setTimeout(() => {
                setScrollDownToLatestMessage(privateChatRef)
                setScrollDownToLatestMessage(privateChatMobileRef)
            }, 100)
        }
        setMessage("")
        textareaRef.current.value = null;
    }

    const getRandomColorsById = (id) => {
        const numbers = id.match(/\d+/g);
        const result = numbers ? numbers.reverse().join('') : '';
        const decimal = result / Math.pow(10, String(result).length);
        const hue = Math.floor(decimal * 360); // Random hue (0-360)
        const saturation = 70 + Math.floor(decimal * 30); // Saturation between 70% and 100%
        const lightness = 50 + Math.floor(decimal * 10); // Lightness between 50% and 60%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    const convertToLocalTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            // year: '2-digit',
            // month: 'short',
            // day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleOnKeyUp = (event) => {
        const prompt_inputs = document.getElementById("prompt_inputs");
        if (event?.key === 'Enter' && !event.shiftKey) {
            event.target.value = '';
            event.preventDefault();
        }
        const lines = calculateLines(prompt_inputs);
        adjustTextareaHeight(lines * (lines === 1 ? 72 : 36), setTextareaHeight, "prompt_inputs");
    }

    const deleteAllChatMessages = () => {
        deleteRequest('api/deleteClearChatMessages').then(r => {
            if (r.status === 200) {
                setMessages([]);
            }
        })
    }

    const getFilteredPrivateMessages = () => {
        return privateMessages?.filter(msg => (msg.senderId === state.user._id && msg.receiverId === selectedPrivateUser?.userId) ||
            (msg.senderId === selectedPrivateUser?.userId && msg.receiverId === state.user._id))
            ?.map(msg => ({...msg, status: msg.senderId === state.user._id ? "sent" : "received"}));
    }

    const handleCheckboxChange = (event, chat) => {
        if(selectedPrivateUser === null) {
            setSelectedGroupChat((prevSelectedGroupChats) =>
                !event.target.checked ? prevSelectedGroupChats.filter(id => id !== chat.id) : [...prevSelectedGroupChats, chat.id]
            )
        } else {
            setSelectedPrivateChat((prevSelectedPrivateChats) =>
                !event.target.checked ? prevSelectedPrivateChats.filter(id => id !== chat._id) : [...prevSelectedPrivateChats, chat._id])
        }
    }
    const handleDeleteSelectGroupChat = () => {
        postRequest('api/deleteSelectedGroupChats', selectedGroupChat)
            .then(() => {
                setMessages(messages.filter(msg => !selectedGroupChat.includes(msg.id)));
                clearSelections();
                uncheckAllInputField(chatRef);
            })
    }
    const handleDeleteSelectPrivateChat = () => {
        postRequest('api/deleteSelectedPrivateChats', selectedPrivateChat).then(() => {
            setPrivateMessages(privateMessages.filter(msg => !selectedPrivateChat.includes(msg._id)));
            clearSelections()
            uncheckAllInputField(privateChatRef);
        })
    }

    const clearSelections = () => {
        setSelectedPrivateChat([]);
        setSelectedGroupChat([]);
        setIsChatMessageSelectable(false);
    }

    const privateChatRoomElement = () => (
        <div>
            {getFilteredPrivateMessages()?.map((msg, index) => msg.type === "date" ? (
                    <div className={'flex text-center'}>
                        <hr className={'flex-grow border-gray-400 dark:border-gray-600 opacity-50'}/>
                        <span className={'rounded text-sm text-gray-600 dark:text-gray-200 shadow-md bg-gray-100 dark:bg-gray-700 px-2 py-1 animate-slide-in-sent h-fit'}>{msg.message}</span>
                        <hr className={'flex-grow border-gray-400 dark:border-gray-600 opacity-50'}/>
                    </div>) :
                (
                    <div
                        className={`flex mb-[1px] rounded ${selectedPrivateChat.includes(msg._id) ? 'bg-gray-200 dark:bg-[#6b6c6d]' : ''} ${isChatMessageSelectable ? 'hover:bg-gray-100 hover:dark:bg-[#3d3e41]' : ''}`}>
                                <span
                                    className={`flex relative items-center justify-center ${isChatMessageSelectable ? "block" : "hidden"}`}>
                                    <input key={index} id="group_chat_select_input" type="checkbox"
                                           className={"checkbox-round"}
                                           onChange={(e) => handleCheckboxChange(e, msg)}
                                    />
                                </span>
                        <div key={index} className={`relative my-1 ml-1 rounded-lg max-w-[70%] max-w-fit 
                                ${msg.status === "sent" ? "animate-slide-in-sent ml-auto bg-blue-500 text-white whitespace-nowrap" :
                            "animate-slide-in-receive mr-auto bg-gray-200 text-black whitespace-nowrap"}`}>
                            {msg.status === "received" &&
                                <div className={`text-[13px] px-2`} style={{color: msg.color}}>
                                    <span
                                        className={' rounded px-1 relative'}>{msg.senderName.length > 40 ? msg.senderName.substring(0, 40) + '...' : msg.senderName}</span>
                                </div>}
                            <div
                                className={`pl-3 pr-1 flex justify-between items-end  ${msg.status === "sent" && "pt-1 "}  whitespace-pre-line`}>{msg.message}
                                <div className={`text-[10px] pl-2 ${
                                    msg.status === "sent" ? "text-white" : "text-gray-500"
                                }`}>
                                    {convertToLocalTime(msg.timeStamp)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    )
    let timer = null;

    const selectedCopyTextList = () => {
        const nestedElement = chatRef.current.querySelectorAll('.copy-text');
        const allText = Array.from(nestedElement).map((u) => u.childNodes[0].textContent.trim()).join('\n');
        navigator.clipboard.writeText(allText).then(() => {});
    }
    return (
        <div className="chat-content bg-[rgba(246,247,248,0.5)] dark:bg-[rgba(52,52,52)] relative flex flex-col md:flex-row w-full h-full">
            {/*back button will visible always in laptop view And only in list view will visible in mobile view*/}
            <div className={`flex items-center w-full px-1 py-2 max-[720px]:${chatTabValue === 'list_view' && selectedPrivateUser === null ? 'block' : 'hidden'}`}>
                <button onClick={() => navigate('/')}
                        className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span className="ml-2 font-medium">Back</span>
                </button>
            </div>
            <div className={`flex items-center w-full px-1 py-2 min-[721px]:hidden max-[720px]:${chatTabValue === 'list_view' && selectedPrivateUser === null ? 'hidden' : 'block'}`}>
                <button onClick={() => {
                    setChatTabValue('list_view')
                    setIsGroupChatView(false)
                    setSelectedPrivateUser(null)
                    clearSelections();
                }}
                        className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span className="ml-2 font-medium">
                            {selectedPrivateUser === null ? 'Group Chat' :
                                selectedPrivateUser?.userName.substring(0, 1).toUpperCase() + selectedPrivateUser?.userName.substring(1)}
                        </span>
                </button>
            </div>
            {/*List online users for laptop view in left side view*/}
            <div className={'flex flex-row flex-grow w-full md:w-4/5'}>
                <div className="hidden md:flex px-2 flex-col w-1/5 border-r dark:border-gray-700">
                    <h3 className="text-lg font-medium dark:text-white">Online Users</h3>
                    <div>
                        <div className={`dark:text-white flex items-center mt-1 px-2 py-2 border-b cursor-pointer rounded
                                       ${selectedPrivateUser === null && 'bg-[#d5daff] dark:bg-[#5f5f5f]'}`}
                             onClick={() =>{
                                 setSelectedPrivateUser(null);
                                 setIsGroupChatView(true);
                                 clearSelections();
                             }}>
                           <Diversity3Icon className={'pr-1'}/>Group chat
                        </div>
                        {onlineUsers.map((user, index) => (
                            <div key={index} className={`rounded flex items-center mt-1 px-2 py-2 border-b cursor-pointer ${selectedPrivateUser && selectedPrivateUser.userId === user.userId && 'bg-[#d5daff] dark:bg-[#5f5f5f] '}
                             ${selectedPrivateUser && selectedPrivateUser.userId !== user.userId && 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'} `}
                                 onClick={() => {
                                     setSelectedPrivateUser(user);
                                     setIsGroupChatView(false)
                                     clearSelections();
                                     refetch()
                                 }}>
                                <div className="text-sm text-gray-500 dark:text-white">{user.userName.substring(0,1).toUpperCase()+ user.userName.substring(1)}</div>
                                <div className="ml-1 w-2 h-2 rounded-full bg-green-500"/>
                            </div>
                        ))}
                    </div>
                </div>
                {/*Chat view */}
                <div style={{height: chatHeight + 130}}
                    className={`relative flex flex-col flex-grow ${isMobile ? 'w-[95%] h-[95%]' : 'w-[60%]'}`}>
                    {/*Header for chat page for laptop and mobile view*/}
                    <h5 className={`relative max-[720px]:hidden dark:text-white ml-4 flex items-center`}>
                        {selectedPrivateUser === null || isGroupChatView ? <span>Group chat</span> :
                            <div>{selectedPrivateUser?.userName.substring(0, 1).toUpperCase() + selectedPrivateUser?.userName.substring(1)}</div>}
                        <div className={'absolute right-0'}>
                            {selectedGroupChat.length > 0 || selectedPrivateChat.length > 0 ?
                                <><ContentCopyIcon className={`cursor-pointer hover:text-gray-500`}
                                                   style={{width: '20px', height: '20px', cursor: "pointer"}}
                                                   onClick={() => selectedCopyTextList()}/>
                                    <DeleteOutlineRoundedIcon titleAccess={'Delete'} onClick={() => {
                                        if (selectedPrivateUser === null) {
                                            handleDeleteSelectGroupChat();
                                        } else {
                                            handleDeleteSelectPrivateChat();
                                        }
                                    }} className={`cursor-pointer text-red-400`}/></>
                                : null}
                            <MoreVertIcon className={`cursor-pointer`}
                                          onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}/>
                        </div>
                        <CustomMenu isMenuOpen={isChatMenuOpen} setIsMenuOpen={setIsChatMenuOpen}
                                    className={'absolute right-0  top-8'}>
                            <CustomMenu.Item onClick={() => {
                                if (selectedPrivateUser === null) {
                                    setSelectedGroupChat([]);
                                    uncheckAllInputField(chatRef);
                                } else {
                                    setSelectedPrivateChat([]);
                                    uncheckAllInputField(privateChatRef);
                                }
                                setIsChatMessageSelectable(!isChatMessageSelectable)
                            }}>
                                <ChecklistIcon/> Select </CustomMenu.Item>
                            {selectedPrivateUser === null ?
                                <CustomMenu.Item onClick={() => deleteAllChatMessages()}>
                                    <RefreshIcon/> Reset chat
                                </CustomMenu.Item> : null}
                        </CustomMenu>
                    </h5>
                    <div
                        className={`relative z-50 w-full px-3 py-2 mt-1 ${selectedGroupChat.length === 0 ? 'hidden' : 'block'} min-[721px]:hidden bg-[#e1f5fe] drop-shadow-lg`}>
                        <CloseIcon onClick={() => {
                            setSelectedGroupChat([]);
                            setIsChatMessageSelectable(false)
                        }}/> {selectedGroupChat.length}
                        <span className={`absolute right-2 space-x-2`}>
                          <ContentCopyIcon className={`cursor-pointer hover:text-gray-500`}
                                           style={{width: '20px', height: '20px'}}
                                           onClick={() => selectedCopyTextList()}/>
                          <DeleteOutlineRoundedIcon className={`text-red-400`}
                                                    onClick={() => {
                                                        handleDeleteSelectGroupChat();
                                                    }}/>
                      </span>
                    </div>
                    {/*Group chat both laptop and mobile */}
                    <div ref={chatRef} className={`overflow-y-auto h-[80%] max-[720px]:fixed max-[720px]:bottom-[5.5rem] max-[720px]:w-full
                                                  max-[720px]:h-[82%] p-2 max-[720px]:${chatTabValue === 'list_view' || selectedPrivateUser !== null  ? 'hidden' : 'block'} min-[721px]:${selectedPrivateUser !== null ? 'hidden' : 'block'}`}>
                        {isPublicMessageLoading ? <ListLoader/> :
                            <div>
                                {messages.map((msg, index) =>
                                    msg.type === "date" ? (
                                            <div className={'flex text-center'}>
                                                <hr className={'flex-grow border-gray-400 dark:border-gray-600 opacity-50'}/>
                                                <span className={'rounded text-sm text-gray-600 dark:text-gray-200 shadow-md bg-gray-100 dark:bg-gray-700 px-2 py-1 animate-slide-in-sent h-fit'}>{msg.message}</span>
                                                <hr className={'flex-grow border-gray-400 dark:border-gray-600 opacity-50'}/>
                                            </div>) :
                                        (
                                            <div
                                                className={`flex mb-[1px] rounded ${selectedGroupChat.includes(msg.id) ? 'bg-gray-200 dark:bg-[#6b6c6d]' : ''} ${isChatMessageSelectable ? 'min-[721px]:hover:bg-gray-100 dark:min-[721px]:hover:bg-[#3d3e41]' : ''}`}>
                                        <span
                                            className={`flex relative items-center justify-center ${isChatMessageSelectable ? "block" : "hidden"} max-[720px]:hidden`}>
                                            <input key={index} id="group_chat_select_input" type="checkbox"
                                                   className={"checkbox-round"}
                                                   onChange={(e) => handleCheckboxChange(e, msg)}
                                            />
                                        </span>
                                                <div key={index}
                                                     className={`relative my-[2px] ml-1 rounded-lg max-[720px]:select-none max-w-[70%] max-w-fit ${
                                                         msg.status === "sent" ? "animate-slide-in-sent ml-auto bg-blue-500 text-white whitespace-nowrap"
                                                             : "animate-slide-in-receive mr-auto bg-gray-200 text-black dark:bg-[#4b5563] whitespace-nowrap"
                                                     }`}
                                                     onTouchStart={() => {
                                                         timer = setTimeout(() => {
                                                             setIsChatMessageSelectable(true);
                                                             setSelectedGroupChat((prevSelectedGroupChats) =>
                                                                 [...prevSelectedGroupChats, msg.id]
                                                             )
                                                         }, 500);
                                                     }}
                                                     onTouchEnd={() => clearInterval(timer)}
                                                     onClick={(e) => {
                                                         if (isChatMessageSelectable) {
                                                             setSelectedGroupChat((prevSelectedGroupChats) => {
                                                                 const updatedSelectedGroupChats = prevSelectedGroupChats.includes(msg.id)
                                                                     ? prevSelectedGroupChats.filter(id => id !== msg.id) : [...prevSelectedGroupChats, msg.id];

                                                                 if (updatedSelectedGroupChats.length === 0) {
                                                                     setIsChatMessageSelectable(false);
                                                                 }
                                                                 return updatedSelectedGroupChats
                                                             });
                                                         }
                                                     }}
                                                >
                                                    {msg.status === "received" &&
                                                        <div className={`text-[11px] px-2`} style={{color: msg.color}}>
                                                    <span
                                                        className={'rounded px-1 relative'}>{msg.userName?.length > 40 ? msg.userName.substring(0, 40) + '...' : msg?.userName}</span>
                                                        </div>}
                                                    <div
                                                        className={`${selectedGroupChat.includes(msg.id) ? 'copy-text' : ''} text-sm pl-3 pr-1 flex justify-between items-end ${msg.status === "sent" && "pt-1 "} whitespace-pre-line`}>
                                                        <span className={'dark:text-white'}>{msg.message}</span>
                                                        <div className={`text-[9px] pl-2 ${
                                                            msg.status === "sent" ? "text-white" : "text-gray-500 dark:text-gray-200"
                                                        }`}>
                                                            {convertToLocalTime(msg.timeStamp)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                            </div>}
                    </div>

                    {/*Private chat page for laptop view*/}
                    <div ref={privateChatRef} className={`overflow-y-auto h-[28rem] max-[720px]:fixed max-[720px]:bottom-0 max-[720px]:w-full max-[720px]:h-[90%] p-2 
                                    max-[720px]:${chatTabValue === 'list_view' ? 'block' : 'hidden'} min-[721px]:${selectedPrivateUser === null ? 'hidden' : 'block'} max-[720px]:hidden`}>

                        {isPrivateMessageLoading ?  <ListLoader/> :privateChatRoomElement() }

                    </div>

                    {/* List users who are in online and group chat only for Mobile view*/}
                    <div className={`max-[720px]:${chatTabValue === 'list_view' && selectedPrivateUser === null ? 'block' : 'hidden'} min-[721px]:hidden`}>
                        <div className="px-2 flex-col dark:border-gray-700">
                            <div>
                                <div className="flex items-center mt-2 px-2 py-2 border-b cursor-pointer" onClick={() =>{
                                    setChatTabValue("detail_view");
                                    setIsGroupChatView(true);
                                    setSelectedPrivateUser(null);
                                }}>
                                    <div className="text-sm text-gray-500">Group chat</div>
                                </div>
                                {onlineUsers.map((user, index) => (
                                    <div key={index} className="flex items-center mt-2 px-2 py-2 border-b cursor-pointer"
                                         onClick={() => {
                                             setSelectedPrivateUser(user);
                                             setChatTabValue("detail_view");
                                             setIsGroupChatView(false);
                                         }}>
                                        <div className="text-sm text-gray-500">{user.userName}</div>
                                        <div className="ml-1 w-1 h-1 rounded-full bg-green-500"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Selected user chat page for only mobile view*/}
                    <div ref={privateChatMobileRef} className={`overflow-y-auto h-[40rem] px-2 max-[720px]:${chatTabValue === 'detail_view' && selectedPrivateUser !== null ? 'block' : 'hidden'} min-[721px]:hidden`}>
                        { !isPrivateMessageLoading ? privateChatRoomElement() :
                        <ListLoader/> }
                    </div>

                    <div className={`pl-[5px] rounded fixed bottom-0 max-[720px]:w-[100%] w-[65%] dark:bg-[rgba(52,52,52)]`}>
                        <div className="textarea-wrapper flex items-center">
                    <textarea
                        ref={textareaRef}
                        className={'dark:text-white border'}
                        style={{height: textareaHeight, maxHeight: '190px'}}
                        id="prompt_inputs"
                        onKeyUp={handleOnKeyUp}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        disabled={!isServerActive}
                        placeholder="Message here..."
                        onChange={(e) => {
                            setMessage(e.target.value)
                        }}
                    />
                            <button
                                className="sent_button"
                                disabled={!isServerActive}
                                title={"Send"}
                                onClick={() => sendMessage()}
                            >
                                <SendIcon style={{width: "35px", height: "35px"}}
                                          className={'text-[#174AE4] dark:text-[#67e8f9]'}/>
                            </button>
                        </div>
                    </div>
                </div>
                <UserProfile state={state} setState={setState}/>
            </div>
        </div>
    );
}

export default Chat;