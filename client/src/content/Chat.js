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
import {Tab, Tabs} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Diversity3Icon from '@mui/icons-material/Diversity3';


const baseURL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://192.168.174.115:4000' : packageJson.baseURL;

const socket = io(baseURL);

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
    const [chatTabValue, setChatTabValue] = useState('group_chat');
    const [selectedPrivateUser, setSelectedPrivateUser] = useState(null);
    let [privateMessages, setPrivateMessages] = useState([]);
    const [chatHeight, setChatHeight] = useState(window.innerHeight - 160); // 10rem = 160px

    useEffect(() => {
        const updateHeight = () => setChatHeight(window.innerHeight - 160);
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);


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
        getRequest('/fetchAllPublicChatMessage').then(r => {
            if (r.status === 200) {
                const chatHistory = r.data;
                setMessages(chatHistory.map((msg) => ({
                    status: msg.userId === state.user._id ? "sent" : "received",
                    message: msg.message,
                    userName: msg.userName,
                    color: msg.color,
                    timeStamp: msg.timeStamp
                })));
                setTimeout(() => {
                    setScrollDownToLatestMessage(chatRef)
                }, 300);
            }
        })
    }, [])

    useEffect(() => {
        if (selectedPrivateUser !== null && selectedPrivateUser.userId && state.user) {
            postRequest('/fetchPrivateChatMessages', {senderId: state.user._id, receiverId: selectedPrivateUser.userId}).then(r => {
                if (r.status === 200) {
                    setPrivateMessages(r.data);
                    setTimeout(() => {
                        setScrollDownToLatestMessage(privateChatRef)
                        setScrollDownToLatestMessage(privateChatMobileRef)
                    }, 50);
                }
            })
        }
    }, [selectedPrivateUser])

    useEffect(() => {
        socket.on("chat_history", (history) => {
            setMessages(history.map((msg) => ({
                status: msg.userId === state.user._id ? "sent" : "received",
                message: msg.message,
                userName: msg.userName,
                color: msg.color,
                timeStamp: msg.timeStamp
            })));
        });
        socket.on("receive_message", (data) => {
            console.log("Message received:", data);
            const senderType = data.userId === state.user._id ? "sent" : "received";
            setMessages((prevMessages) => [...prevMessages, {
                status: senderType,
                message: data.message,
                userName: data.userName,
                color: data.color,
                timeStamp: data.timeStamp
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
        deleteRequest('/deleteClearChatMessages').then(r => {
            if (r.status === 200) {
                setMessages([]);
            }
        })
    }

    const getFilteredPrivateMessages = () => {
        return privateMessages.filter(msg => (msg.senderId === state.user._id && msg.receiverId === selectedPrivateUser?.userId) ||
            (msg.senderId === selectedPrivateUser?.userId && msg.receiverId === state.user._id))
            .map(msg => ({...msg, status: msg.senderId === state.user._id ? "sent" : "received"}));
    }


    const privateChatRoomElement = () => (
        <div>
            {getFilteredPrivateMessages().map((msg, index) => (
                <div key={index} className={`relative my-1 rounded-lg max-w-[70%] max-w-fit 
                                ${msg.status === "sent" ? "animate-slide-in-sent ml-auto bg-blue-500 text-white whitespace-nowrap" :
                    "animate-slide-in-receive mr-auto bg-gray-200 text-black whitespace-nowrap"}`}>
                    {msg.status === "received" &&
                        <div className={`text-[13px] px-2`} style={{color: msg.color}}>
                                    <span
                                        className={' rounded px-1 relative'}>{msg.senderName.length > 40 ? msg.senderName.substring(0, 40) + '...' : msg.senderName}</span>
                        </div>}
                    <div className={`pl-3 pr-1 flex justify-between items-end  ${msg.status === "sent" && "pt-1 "}`}>{msg.message}
                    <div className={`text-[10px] pl-2 ${
                        msg.status === "sent" ? "text-white" : "text-gray-500"
                    }`}>
                        {convertToLocalTime(msg.timeStamp)}
                    </div>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="chat-content bg-[rgba(246,247,248,0.5)] dark:bg-[rgba(52,52,52)] relative flex flex-col md:flex-row w-full h-full">
            <div className={'flex items-center w-full px-1 py-2'}>
                <button onClick={() => navigate('/')}
                        className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span className="ml-2 font-medium">Back</span>
                </button>
            </div>
            {/*List online users for laptop view*/}
            <div className={'flex flex-row flex-grow w-full md:w-4/5'}>
                <div className="hidden md:flex px-2 flex-col w-1/5 border-r dark:border-gray-700">
                    <h3 className="text-lg font-medium dark:text-white">Online Users</h3>
                    <div>
                        <div className={`dark:text-white flex items-center mt-1 px-2 py-2 border-b cursor-pointer rounded
                                       ${selectedPrivateUser === null && 'bg-[#5f5f5f]'}`} onClick={() => setSelectedPrivateUser(null)}>
                           <Diversity3Icon className={'pr-1'}/>Group chat
                        </div>
                        {onlineUsers.map((user, index) => (
                            <div key={index} className={`rounded flex items-center mt-1 px-2 py-2 border-b cursor-pointer ${selectedPrivateUser && selectedPrivateUser.userId === user.userId && 'bg-[#5f5f5f]'}`}
                                 onClick={() => setSelectedPrivateUser(user)}>
                                <div className="text-sm text-gray-500 dark:text-white">{user.userName.substring(0,1).toUpperCase()+ user.userName.substring(1)}</div>
                                <div className="ml-1 w-2 h-2 rounded-full bg-green-500"/>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ height: chatHeight+130}}
                    className={`relative flex flex-col flex-grow ${isMobile ? 'w-[95%] h-[95%]' : 'w-[60%]'}`}>
                    {/* Tab for mobile view*/}
                    <div className={'z-[9999] min-[721px]:hidden'}>
                        <Tabs value={chatTabValue}
                              onChange={(e, newValue) => {
                                  setChatTabValue(newValue)
                                  setSelectedPrivateUser(null)
                              }}
                              sx={{
                                  "& .MuiTab-root": themeMode === 'dark'?{ color: "gray" }:{}, // Default text color
                                  "& .Mui-selected": themeMode === 'dark'?{ color: "white"}:{}, // Selected tab color
                                  "& .MuiTabs-indicator": themeMode === 'dark'?{ backgroundColor: "white" }:{} // Indicator color
                              }}>
                            <Tab value="group_chat" label="Group Chat"/>
                            <Tab value="private_chat" label="Private Chat"/>
                        </Tabs>
                    </div>
                    {/*Only for laptop view*/}
                    <h5 className={`max-[720px]:hidden dark:text-white ml-4 flex items-center ${selectedPrivateUser === null ? 'block' : 'hidden'}`}>
                       <span>
                           Group chat
                           <RefreshIcon className={'cursor-pointer'} onClick={() => deleteAllChatMessages()}/></span>
                    </h5>
                    <h5 className={`max-[720px]:hidden dark:text-white ml-4 flex items-center ${selectedPrivateUser !== null ? 'block' : 'hidden'}`}>
                        {selectedPrivateUser !== null && selectedPrivateUser.userName.substring(0,1).toUpperCase() + selectedPrivateUser.userName.substring(1) }
                    </h5>


                    {/* this is for both laptop and mobile view for group chat*/}
                    <div ref={chatRef} className={`overflow-y-auto h-[80%] max-[720px]:fixed max-[720px]:bottom-[5.5rem] max-[720px]:w-full
                                                  max-[720px]:h-[76%] p-2 max-[720px]:${chatTabValue === 'private_chat' ? 'hidden' : 'block'} min-[721px]:${selectedPrivateUser !== null ? 'hidden' : 'block'}`}>
                    {
                        messages.map((msg, index) => (
                            <div key={index}
                                 className={`relative my-1 rounded-lg max-w-[70%] max-w-fit ${
                                     msg.status === "sent" ? "animate-slide-in-sent ml-auto bg-blue-500 text-white whitespace-nowrap"
                                         : "animate-slide-in-receive mr-auto bg-gray-200 text-black whitespace-nowrap"
                                 }`}>
                                {msg.status === "received" &&
                                    <div className={`text-[11px] px-2`} style={{color: msg.color}}>
                                    <span
                                        className={' rounded px-1 relative'}>{msg.userName.length > 40 ? msg.userName.substring(0, 40) + '...' : msg.userName}</span>
                                    </div>}
                                <div className={`text-sm pl-3 pr-1 flex justify-between items-end ${msg.status === "sent" && "pt-1 "} `}>
                                    {msg.message}
                                    <div className={`text-[9px] pl-2 ${
                                        msg.status === "sent" ? "text-white" : "text-gray-500"
                                    }`}>
                                        {convertToLocalTime(msg.timeStamp)}
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                    </div>

                    {/*Private chat room for laptop view*/}
                    <div ref={privateChatRef} className={`overflow-y-auto h-[28rem] max-[720px]:fixed max-[720px]:bottom-0 max-[720px]:w-full max-[720px]:h-[90%] p-2 
                                    max-[720px]:${chatTabValue === 'private_chat' ? 'block' : 'hidden'} min-[721px]:${selectedPrivateUser === null ? 'hidden' : 'block'} max-[720px]:hidden`}>
                        {privateChatRoomElement()}
                    </div>

                    {/* Online user for Mobile view inside private chat tab*/}
                    <div className={`max-[720px]:${chatTabValue === 'private_chat' && selectedPrivateUser === null ? 'block' : 'hidden'} min-[721px]:hidden`}>
                        <div className="px-2 flex-col dark:border-gray-700">
                            <div>
                                {onlineUsers.map((user, index) => (
                                    <div key={index} className="flex items-center mt-2 px-2 py-2 border-b cursor-pointer" onClick={() => setSelectedPrivateUser(user)}>
                                        <div className="text-sm text-gray-500">{user.userName}</div>
                                        <div className="ml-1 w-1 h-1 rounded-full bg-green-500"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Selected user chat room for only mobile view*/}
                    <div ref={privateChatMobileRef} className={`overflow-y-auto h-[37rem] px-2 max-[720px]:${chatTabValue === 'private_chat' && selectedPrivateUser !== null ? 'block' : 'hidden'} min-[721px]:hidden`}>
                        <div className={'flex fixed z-[999] bg-white rounded'}>
                            <ArrowBackIcon onClick={() => setSelectedPrivateUser(null)}/>
                            <h5 className={'ml-2'}>{selectedPrivateUser?.userName.substring(0,1).toUpperCase() +selectedPrivateUser?.userName.substring(1) }</h5>
                        </div>
                        {privateChatRoomElement()}
                    </div>

                    <div className={`p-[2px] rounded fixed bottom-0 max-[720px]:w-[100%] w-[65%] bg-white dark:bg-[rgba(52,52,52)]`}>
                        <div className="textarea-wrapper flex items-center">
                    <textarea
                        ref={textareaRef}
                        className={'dark:text-white'}
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