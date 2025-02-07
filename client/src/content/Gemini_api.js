import React, {useContext, useEffect, useRef, useState} from "react";
import robot from '../css/webp/ro.webp';
import useIsMobile from "../hooks/useIsMobile";
import {CircularProgress, IconButton} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {UserContext} from "../context/UserContext";
import UserProfile from "./UserProfile";
import {getRequest, postRequest} from "../API_helper/APIs";
import TaskAlt from '@mui/icons-material/TaskAlt';
import {AppContext} from "../context/AppContext";
import SideBar from "./SideBar";
import iamaiLogo from "../css/IAMAI-19-09-2024.png";
import SendIcon from '@mui/icons-material/Send';
import spinner from "../css/spinner.svg"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faImage, faXmark} from "@fortawesome/free-solid-svg-icons";
import ImageDialog from "../common/ImageDialog";
import ModelResponse from "./ModelResponse";
import Chat from "./Chat";


const GeminiApi = () => {
    const textareaRef = useRef(null);
    const imageInputRef = useRef(null);

    let [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState('4.5rem');
    const [previousLineCount, setPreviousLineCount] = useState(1);
    const isMobile = useIsMobile();
    const [historyList, setHistoryList] = useState([]);
    const [responseStatus, setResponseStatus] = useState('Thinking...');
    const [file, setFile] = useState(null);
    const [imageInDialog, setImageInDialog] = useState(null);
    let [base64Image, setBase64Image] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [listItemPopupMenuId, setListItemPopupMenuId] = useState(null);
    const {isChatOpen, setIsChatOpen} = useContext(AppContext);


    const { state, setState } = useContext(UserContext);
    const {isServerActive, isServerMsgVisible} = useContext(AppContext);

    const fetchResponse = async (prompt) => {
        const formData = new FormData();
        formData.append('prompt', JSON.stringify(prompt));
        try {
            let response = null
            if (file) {
                response = await uploadFileInChunks(file, prompt);
            } else {
                response = postRequest('/gemini-AI-response', formData)
            }
            return response;
        } catch (error) {
            console.error(error)
        }
    }

    const uploadFileInChunks = async (file, prompt) => {
        const chunkSize = 1024 * 1024;
        const totalChunks = Math.ceil(file.size / chunkSize);

        for(let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * chunkSize;
            const end = Math.min(file.size, start + chunkSize);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('chunkIndex', chunkIndex);
            formData.append('totalChunks', totalChunks);
            formData.append('fileName', file.name);
            formData.append('prompt', JSON.stringify(prompt));
            try {
               const response = await postRequest('/gemini-AI-response', formData);
                if(response.data && response.data.isFinal) {
                   return response;
               }
            } catch (error) {
                console.error(`Error uploading chunk ${chunkIndex + 1}`, error);
                throw error;
            }
        }

    }
    // const fetchResponse = async (prompt) => {
    //     const baseUrl = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? 'http://192.168.29.57:4000' :  packageJson.baseURL;
    //     return new Promise((resolve, reject) => {
    //         const eventSource = new EventSource(`${baseUrl}/geminiAI-data?prompt=${encodeURIComponent(prompt)}`)
    //         eventSource.onmessage = (event) => {
    //             try {
    //                 const data = JSON.parse(event.data);
    //                 if (data.res) {
    //                     eventSource.close();
    //                     resolve({res: data.res});
    //                 } else if (data.error) {
    //                     eventSource.close();
    //                     reject(new Error(data.error))
    //                 } else {
    //                     setResponseStatus(data.status)
    //                 }
    //             } catch (e) {
    //                 reject(e)
    //             }
    //         };
    //         eventSource.onerror = () => {
    //             console.log("Error occurred while fetching data", "onerror");
    //             eventSource.close();
    //         };
    //
    //     });
    // }


    const storeSearchHistory = (conversation) => {
        const userId = state.user?._id;
        const userRole = conversation.filter((val) => val.role === 'user');
        const lable = userRole.length > 0 ? userRole[userRole.length-1].parts.text : '';
        postRequest('/createUserData', {id: selectedHistoryId, userId: userId, historyLabel: lable, chatHistory: conversation})
            .then((res) => {
                if (userId) {
                    getRequest(`getUserDataById/${userId}`).then((res) => {
                        setHistoryList(res.data?.reverse());
                        const historyIdToFind = selectedHistoryId
                        const selectedHistory = res.data.filter((val) => val._id === historyIdToFind)[0];
                        if(selectedHistory)
                          setConversations(selectedHistory?.chatHistory);
                    })
                }
            })
    }

    const escapeHTML = (str) => {
        return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    const getResponseFromAI = async (prompt) => {
        let inst = "In this instruction, I tell you how I want the response. " +
            "`Inside the `chatHistory` There is a list of Objects In that Each Object entry has a 'role' field ('user' or 'model') and a 'parts' field with a 'text' property" +
            "You should read the user last entry and generate a continuation of the conversation based on the latest 'user' entry " +
            "you should respond as a 'model' to the last 'users' message. you should generate the text value under the parts only, not generate entire object" +
            "provide troubleshooting steps for the user's issue with an proper step-by-step example. Respond in a friendly and casual tone, using emojis where appropriate. You should Read the entire conversation before generate the response" +
            ""

        const nameRegex = /what.*your.*name|who.*are.*you|can.*say.*your.*name|tell.*your.*name/i;
        if (nameRegex.test(prompt)) {
            inst += 'If anybody asks your name, tell them "My name is Poovarasan" ';
        }

        setLoading(true);
        let testRes = null;
        const run = async () => {
            try {
                const chatList = JSON.parse(JSON.stringify(conversations));
                for (let i = 0; i < chatList.length; i++) {
                    if(chatList[i].parts && chatList[i].parts.image) {
                        delete chatList[i].parts.image;
                    }
                }
                const {data} = await fetchResponse({instructions: inst, chatHistory: chatList });
                return {response: data.res};
            } catch (err) {
                console.error(err);
                return {errorResponse: '!ERROR  : Something Went Wrong', prompt: prompt};
            }

            /* Testing response code */
            // await fetch(testResponse)
            //     .then(response => response.text())
            //     .then(data => {
            //         testRes = data
            //     })
            // return testRes;
        };

        run().then(res => {
            if (document.getElementById("response_element"))
                document.getElementById("response_element").innerHTML = '';
            setFile(null);
            setLoading(false);
            const convers = [
                ...conversations,
                {
                    role: 'model',
                    parts: {text: res.response}
                }]
            setConversations(convers);
            conversations = convers;
            setBase64Image(null);
            if(state.user)
               storeSearchHistory(conversations);
        });
    };

    function calculateLines(textarea) {
        const style = window.getComputedStyle(textarea);
        const fontSize = parseFloat(style.fontSize);
        const fontFamily = style.fontFamily;

        // Create a temporary span to measure text width
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.whiteSpace = 'pre';
        span.style.fontSize = fontSize + 'px';
        span.style.fontFamily = fontFamily;
        document.body.appendChild(span);

        // Calculate the width of a character
        span.textContent = 'A';
        const charWidth = span.getBoundingClientRect().width;

        // Calculate the width of the textarea
        const textareaWidth = textarea.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

        // Calculate the number of characters per line
        const charsPerLine = Math.floor(textareaWidth / charWidth);

        // Calculate the number of lines
        const text = textarea.value;
        const lines = text.split('\n').reduce((acc, line) => {
            return acc + Math.ceil(line.length / charsPerLine);
        }, 0);
        document.body.removeChild(span);
        return lines;
    }
    const setChatWithImage = () => {
        if(file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                setBase64Image(e.target.result);
                base64Image = e.target.result;
            };
        }
        const convers = [
            ...conversations,
            {
                role: 'user',
                parts: {text: userInput, image: base64Image}
            }];
        setConversations(convers);
        conversations = convers
    }

    const handleKeyDown = (event) => {
        const textAreaValue = textareaRef.current.value;

        if (event.key === 'Enter' && textAreaValue.trim() === '') {
            event.preventDefault();
        }
        if (event.key === 'Enter' && !event.shiftKey) {
            const prompt = textareaRef.current.value;
            if (prompt.trim().length > 0 || file) {
                textareaRef.current.value = null;
                setChatWithImage()
                getResponseFromAI(prompt);
            }
        }
        const currentLineCount = textareaRef.current.value?.split('\n').length;
        const input = textareaRef.current.value
        if (input.length === 0) {
            adjustTextareaHeight(null);
        } else if (event.key === 'Enter' && event.shiftKey) {
            adjustTextareaHeight(textareaRef.current.scrollHeight);
        } else if (event.key === 'Backspace') {
            if (currentLineCount < previousLineCount) {
                adjustTextareaHeight(textareaRef.current.scrollHeight >= 72 ? textareaRef.current.scrollHeight : (textareaRef.current.scrollHeight - 22));
            }
            setPreviousLineCount(currentLineCount);
        }
    };

    const handleOnKeyUp = (event) => {
        const prompt_inputs = document.getElementById("prompt_inputs");
        if (event?.key === 'Enter' && !event.shiftKey) {
            event.target.value = '';
            event.preventDefault();
        }
        const lines = calculateLines(prompt_inputs);
        adjustTextareaHeight(lines * (lines === 1 ? 72 : 36));
    }

    const adjustTextareaHeight = (scrollHeight) => {
        setTextareaHeight('4.5rem');
        const prompt_inputs = document.getElementById("prompt_inputs");
        if (scrollHeight) {
            setTextareaHeight(`${scrollHeight}px`);
            prompt_inputs.style.borderRadius = '10px'
        } else {
            prompt_inputs.style.borderRadius = '10px'
        }
    };

     const updateIsSideBarOpen = (value) => {
         setIsSideBarOpen(value);
     }

     const handleOnInputImageClick = () => {
         imageInputRef.current.click();
     }

    const handleOnPast = (event) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if(item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                setFile(file);
            }
        }
    }

    const handleOnDrag = (event) => {
        const items = event.dataTransfer.items;
        for(let i = 0; i < items.length; i++) {
            const item = items[i];
            if(item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                setFile(file);
            }
        }
    }
    return (
        <>
            <ImageDialog imageInDialog={imageInDialog} setImageInDialog={setImageInDialog}/>
            <div className="main-container" onClick={() => setListItemPopupMenuId(null)}>
                <div className="title-container" style={!isSideBarOpen ? {width: 0} : {width: '10%'}}>
                    <SideBar
                        textareaRef={textareaRef}
                        setLoading={setLoading}
                        isSideBarOpen={isSideBarOpen}
                        setHistoryList={setHistoryList}
                        historyList={historyList}
                        setConversations={setConversations}
                        selectedHistoryId={selectedHistoryId}
                        setSelectedHistoryId={setSelectedHistoryId}
                        updateIsSideBarOpen={updateIsSideBarOpen}
                        listItemPopupMenuId={listItemPopupMenuId}
                        setListItemPopupMenuId={setListItemPopupMenuId}>
                    </SideBar>
                </div>
                {!isChatOpen ? <div className="parent-container bg-[rgba(246,247,248,0.5)] dark:bg-[rgba(52,52,52)]"
                                    style={!isSideBarOpen ? {width: '100%'} : {width: '90%'}}
                                    onClick={() => {
                                        isMobile && isSideBarOpen && updateIsSideBarOpen(false);
                                    }}>
                        {!isMobile && !isSideBarOpen && <>
                            <img src={iamaiLogo} alt="IAmAI"
                                 className={'w-[150px] h-[40px] x-[999] absolute top-[7px] left-[35px]'}/>
                        </>}
                        <div id={"conversation-content"}
                             className={`h-[75%] ${isMobile ? 'w-[99%]' : 'w-[60%]'} relative bottom-4 border-0 overflow-auto px-2`}>
                            {conversations?.length > 0 ? conversations.map((convers, index) => (
                                    <div>
                                        {convers.role === 'user' &&
                                            <div key={index}
                                                 className={`px-2 ${convers.length > 0 && 'py-1'} dark:text-white bg-[lavender] dark:bg-[#757575f7] w-fit rounded-t-md mb-2 ` +
                                                     'whitespace-pre-wrap max-w-[100%] max-h-[60%] min-w-[10%] overflow-y-auto'}>
                                                {convers.parts.text}
                                                {convers.parts.image &&
                                                    <img
                                                        src={typeof convers.parts.image === 'string' ? `${convers.parts.image}` : URL.createObjectURL(convers.parts.image)}
                                                        className={'rounded-2xl mt-3 max-h-[14rem]'}
                                                        onClick={() => {
                                                            setImageInDialog(convers.parts.image);
                                                        }} alt={'Prompt Image'}/>}
                                            </div>
                                        }
                                        {convers.role === 'model' &&
                                            <div className={"dark:text-white"}>
                                                <ModelResponse response={convers.parts?.text} key={index}/>
                                                <hr className={'dark:text-sky-100 text-[#757575f7] mt-0.5'}/>
                                            </div>
                                        }
                                    </div>
                                )) :
                                <div style={{position: 'relative'}}
                                     className={`user-select-none flex items-center justify-center ${isMobile ? 'top-[110px]' : ''}`}>
                                    <img className="robot-image user-select-none"
                                         src={robot} style={{height: '25rem'}}
                                         onDoubleClickCapture={(e) => e.preventDefault()}
                                         alt={"IAMAI"}/>
                                </div>
                            }
                            {loading &&
                                <div className={'flex justify-center items-center h-[50vh]'} onLoad={() => {
                                    const conversationContent = document.getElementById("conversation-content");
                                    conversationContent.scrollTop = conversationContent.scrollHeight;
                                }}>
                                    <img alt={"Loading..."} style={{width: '10%'}} src={spinner}/>
                                    <span className={'dark:text-white'}>{responseStatus}</span>
                                </div>}
                        </div>
                        <input type="file"
                               ref={imageInputRef}
                               accept={"image/*"}
                               className={'hidden'}
                               onChange={(e) => {
                                   setFile(e.target.files[0]);
                                   if (e.target.files[0]) {
                                       const reader = new FileReader();
                                       reader.readAsDataURL(e.target.files[0]);
                                       reader.onload = (e) => {
                                           setBase64Image(e.target.result);
                                           base64Image = e.target.result;
                                       };
                                   }
                               }}/>

                        <div className="input-portion">
                            <div className={'flex justify-center dark:text-white'}>
                                {isServerMsgVisible &&
                                    (!isServerActive ?
                                        <>
                                            <CircularProgress style={{width: '20px', height: '20px'}} color="inherit"/>
                                            <pre className={'px-2'}>server starting, please wait...</pre>
                                        </> :
                                        <> <TaskAlt style={{width: '20px', height: '20px'}} color={'success'}/>
                                            <pre>server started.</pre>
                                        </>)
                                }
                            </div>
                            {file && <div className={'image-inside-input'}>
                                <div className={'inline-flex'}>
                                    <img className={'ring-2 ring-blue-500 hover:border-2 cursor-pointer rounded'}
                                         width={"60px"}
                                         height={"60px"} src={URL.createObjectURL(file)}
                                         alt={"Image"} onClick={() => setImageInDialog(file)}/>
                                    <div className={'flex px-[4px] cancel-img-input '} onClick={() => setFile(null)}>
                                        <FontAwesomeIcon
                                            className={'cursor-pointer dark:text-white rounded-4 border-2 border-slate-900'}
                                            icon={faXmark}/></div>
                                </div>
                            </div>}
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
                                placeholder="Ask what you want to know!"
                                onPaste={(e) => handleOnPast(e)}
                                onDrop={(e) => handleOnDrag(e)}
                                onChange={(e) => setUserInput(e.target.value)}
                            />
                                <button
                                    className="sent_button"
                                    disabled={!isServerActive}
                                    title={"Send"}
                                    onClick={() => {
                                        if (userInput.length > 0 || file) {
                                            setChatWithImage();
                                            getResponseFromAI(userInput);
                                            document.getElementById("prompt_inputs").value = '';
                                        }
                                    }}
                                >
                                    <SendIcon style={{width: "35px", height: "35px"}}
                                              className={'text-[#174AE4] dark:text-[#67e8f9]'}/>
                                </button>
                                <FontAwesomeIcon className={'absolute left-2 bottom-3 dark:text-white cursor-pointer'}
                                                 icon={faImage}
                                                 onClick={() => handleOnInputImageClick()}
                                />
                            </div>
                        </div>
                        <UserProfile state={state} setState={setState}/>
                    </div>
                    :
                    <Chat isSideBarOpen={isSideBarOpen}
                          textareaRef={textareaRef}
                          textareaHeight={textareaHeight}
                          handleOnKeyUp={handleOnKeyUp}/>}
            </div>
            </>
            )};

            export default GeminiApi;
