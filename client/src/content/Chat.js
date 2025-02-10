import React, {useContext, useEffect, useRef, useState} from 'react'
import SendIcon from "@mui/icons-material/Send";
import {AppContext} from "../context/AppContext";
import {UserContext} from "../context/UserContext";
import UserProfile from "./UserProfile";
import {io} from "socket.io-client";
import {isMobile} from "react-device-detect";
import {getRequest} from "../API_helper/APIs";
import packageJson from "../../package.json";
import {useNavigate} from "react-router-dom";
import {adjustTextareaHeight, calculateLines} from "../service/commonFun";

const baseURL = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://192.168.1.56:4000' : packageJson.baseURL;

const socket = io(baseURL);

const Chat = () => {
    const {isServerActive, isServerMsgVisible} = useContext(AppContext);
    let {state, setState} = useContext(UserContext);
    const navigate = useNavigate();

    const [textareaHeight, setTextareaHeight] = useState('4.5rem');
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);
    const chatRef = useRef(null);

    useEffect(() => {
        const userData = JSON.parse(sessionStorage.getItem('user'));
        if (userData) {
            const data = {...state, user: userData}
            setState(data);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            state = data;
            console.log("state created.....")
        } else {
            navigate('/IAmAI/signin');
            return;
        }
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
                    setScrollDownToLatestMessage()
                }, 50);
            }
        })
    }, [])

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
                setScrollDownToLatestMessage();
            }, 50);
        });

        return () => {
            socket.off("receive_message");
            socket.off("chat_history");
        };
    }, [state.user?._id]);

    const setScrollDownToLatestMessage = () => {
        const lastMessage = chatRef.current?.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({behavior: 'smooth'})
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
        socket.emit("send_message",
            {
                message: message,
                userId: state.user._id,
                userName: state.user.username,
                color: getRandomColorsById(state.user._id)
            });
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

    return (
        <div className="parent-container bg-[rgba(246,247,248,0.5)] dark:bg-[rgba(52,52,52)] relative" style={{width: '100%'}}>
            <div className="absolute top-4 left-4">
                <button onClick={() => navigate('/')}
                        className="flex items-center text-indigo-600 hover:text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span className="ml-2 font-medium">Back</span>
                </button>
            </div>
            <h2 className={`dark:text-white absolute ${isMobile ? 'top-[3rem] left-[1rem]' : 'top-[0.4rem] left-[2rem]'} lg:top-[0.40rem] lg:left-[11rem]`}>
                Group chat </h2>
            <div ref={chatRef}
                 className={` ${isMobile ? 'w-[95%] h-[75%] pt-4' : 'w-[60%] h-96'}   p-1 overflow-y-auto overflow-x-hidden`}>
                {
                    messages.map((msg, index) => (
                        <div key={index}
                             className={`relative my-1 rounded-lg max-w-[70%] max-w-fit ${
                                 msg.status === "sent" ? "animate-slide-in-sent ml-auto bg-blue-500 text-white whitespace-nowrap"
                                     : "animate-slide-in-receive mr-auto bg-gray-200 text-black whitespace-nowrap"
                             }`}>
                            {msg.status === "received" &&
                                <div className={`text-[13px] px-2`} style={{color: msg.color}}>
                                    <span
                                        className={' rounded px-1 relative'}>{msg.userName.length > 40 ? msg.userName.substring(0, 40) + '...' : msg.userName}</span>
                                </div>}
                            <div
                                className={`pl-3 pr-1 flex justify-between items-end ${msg.status === "sent" && "pt-1 "} `}>
                                {msg.message}
                                <div className={`text-[10px] pl-2 ${
                                    msg.status === "sent" ? "text-white" : "text-gray-500"
                                }`}>
                                    {convertToLocalTime(msg.timeStamp)}
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="input-portion">
                <div className="textarea-wrapper">
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
            <UserProfile state={state} setState={setState}/>
        </div>
    );
}

export default Chat;