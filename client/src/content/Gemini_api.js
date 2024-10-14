import React, {useContext, useRef, useState} from "react";
import robot from '../css/webp/ro.webp';
import useIsMobile from "../hooks/useIsMobile";
import {CircularProgress, IconButton} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {UserContext} from "../context/UserContext";
import UserProfile from "./UserProfile";
import {multipartPostRequest} from "../API_helper/APIs";
import TaskAlt from '@mui/icons-material/TaskAlt';
import {AppContext} from "../context/AppContext";
import SideBar from "./SideBar";
import iamaiLogo from "../css/IAMAI-19-09-2024.png";
import SendIcon from '@mui/icons-material/Send';
import {markedResponse} from "./markedResponse";
import spinner from "../css/spinner.svg"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faImage, faXmark} from "@fortawesome/free-solid-svg-icons";
import ImageDialog from "../common/ImageDialog";


const GeminiApi = () => {
    const textareaRef = useRef(null);
    const imageInputRef = useRef(null);

    const [response, setResponse] = useState(false);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState('4.5rem');
    const [previousLineCount, setPreviousLineCount] = useState(1);
    const isMobile = useIsMobile();
    const [historyList, setHistoryList] = useState([]);
    const [responseStatus, setResponseStatus] = useState('Loading...');
    const [file, setFile] = useState(null);
    const [questionImg, setQuestionImg] = useState(null);
    const [imageInDialog, setImageInDialog] = useState(null);


    const { state, setState } = useContext(UserContext);
    const {isServerActive, isServerMsgVisible} = useContext(AppContext);
    const responseFormateRef = useRef(null);

    const fetchResponse = async (prompt) => {
        const formData = new FormData();
        formData.append('prompt', prompt);
        if(file) {
            formData.append('image', file);
        }
        try {
         const response = multipartPostRequest('/geminiAI-data', formData)
         return response;
        } catch (error) {
           console.error(error)
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


    const storeSearchHistory = (response, prompt, img) => {
        const formData = new FormData();
        formData.append('userId', state.user._id);
        formData.append('prompt', prompt);
        formData.append('response', response)
        if(img) {
            formData.append('image', img);
        }
        multipartPostRequest('/createUserData', formData)
            .then((res) => setHistoryList([{prompt: prompt, response: response, image: res.data.image}, ...historyList]))

    }

    const escapeHTML = (str) => {
        return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    const getResponseFromAI = async (prompt) => {
        let inst = '';

        const nameRegex = /what.*your.*name|who.*are.*you|can.*say.*your.*name|tell.*your.*name/i;
        if (nameRegex.test(prompt)) {
            inst += 'If anybody asks your name, tell them "My name is Poovarasan" ';
        }

        inst += 'Prompt: "' + prompt + '"';
        setLoading(true);
        setResponse(true);
        let testRes = null;
        const run = async () => {
            try {
                setQuestionImg(file);
                const {data} = await fetchResponse(inst);
                return {response: data.res, prompt: prompt, img: file};
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
            if(res.response) {
                markedResponse(res.response);
            } else if(res.errorResponse) {
                markedResponse(`<h6 class="text-red-600 italic">${res.errorResponse}</h6>`)
            }
            setLoading(false);
            if(state.user)
               storeSearchHistory(res.response, res.prompt, res.img);
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

    const handleKeyDown = (event) => {
        const textAreaValue = textareaRef.current.value;

        if (event.key === 'Enter' && textAreaValue.trim() === '') {
            event.preventDefault();
        }
        if (event.key === 'Enter' && !event.shiftKey) {
            const prompt = textareaRef.current.value;
            if (prompt.trim().length > 0 || file) {
                textareaRef.current.value = null;
                if (document.getElementById("response_element"))
                    document.getElementById("response_element").innerHTML = '';
                getResponseFromAI(prompt);
                setQuestion(prompt);
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
            {isMobile && isSideBarOpen &&
            <div className={'mt-2'} style={{display: 'flex', alignItems: "center", width: '100%'}}>
                <IconButton onClick={() => updateIsSideBarOpen(!isSideBarOpen)}>
                    <MenuOutlinedIcon/>
                </IconButton>&nbsp;&nbsp;
                <h2 className="title-mobile title" style={{fontSize: '2rem !important'}}>IAmAI</h2>
            </div>}
            <ImageDialog imageInDialog={imageInDialog} setImageInDialog={setImageInDialog}/>
            <div className="main-container">
                <div className="title-container" style={!isSideBarOpen ? {width: 0} : {width: '10%'}}>
                    <SideBar
                        textareaRef={textareaRef}
                        setLoading={setLoading}
                        isSideBarOpen={isSideBarOpen}
                        setResponse={setResponse}
                        setQuestion={setQuestion}
                        setHistoryList={setHistoryList}
                        historyList={historyList}
                        setQuestionImg={setQuestionImg}
                        updateIsSideBarOpen={updateIsSideBarOpen}>
                    </SideBar>
                </div>
                <div className="parent-container bg-[rgba(246,247,248,0.5)] dark:bg-[rgba(52,52,52)]"
                     style={!isSideBarOpen ? {width: '100%'} : {width: '90%'}}>
                    {!isMobile && !isSideBarOpen && <>
                        <img src={iamaiLogo} alt="IAmAI"
                             className={'w-[150px] h-[40px] x-[999] absolute top-[10px] left-[60px]'}/>
                    </>}
                    {response ?
                        <div className={`h-[75%] ${isMobile ? 'w-[99%]' : 'w-[60%]'} relative bottom-4 border-0 overflow-auto px-2`}>
                            <div
                                className={`px-2 ${question.length > 0 && 'py-1'} dark:text-white bg-[lavender] dark:bg-[#757575f7] w-fit rounded-t-md mb-2 ` +
                                    'whitespace-pre-wrap max-w-[100%] max-h-[60%] min-w-[10%] overflow-y-auto'}>
                                {question}
                                {questionImg &&
                                <img src={typeof questionImg === 'string' ? `data:image/jpeg;base64, ${questionImg}` : URL.createObjectURL(questionImg)}
                                     className={'rounded-2xl mt-3 max-h-[14rem]'}
                                     onClick={() => {
                                         setImageInDialog(questionImg);
                                     }} alt={'Prompt Image'}/>}
                            </div>
                            <hr className={'dark:text-sky-100 text-[#757575f7]'}/>
                            {loading &&
                                <div className={'flex justify-center items-center h-[50vh]'}>
                                    <img alt={"Loading..."} style={{width: '10%'}} src={spinner}/>
                                    <span className={'dark:text-white'}>{responseStatus}</span>
                                </div>}
                            <div id="response_element" className={"dark:text-white"}>
                                <div dangerouslySetInnerHTML={responseFormateRef.current}></div>
                            </div>
                        </div>
                        :
                        <div style={{position: 'relative', bottom: '40px'}} className={'user-select-none'}>
                            <img className="robot-image user-select-none" src={robot} style={{height: '22rem'}}
                                 alt={"IAMAI"}/>
                        </div>}
                    <div className={'flex dark:text-white'}>
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
                    <input type="file"
                           ref={imageInputRef}
                           accept={"image/*"}
                           className={'hidden'}
                           onChange={(e) => setFile(e.target.files[0])}/>

                    <div className="input-portion">
                        {file && <div className={'image-inside-input'}>
                            <div className={'inline-flex'}>
                                <img className={'ring-2 ring-blue-500 hover:border-2 cursor-pointer rounded'} width={"60px"}
                                     height={"60px"} src={URL.createObjectURL(file)}
                                     alt={"Image"} onClick={() => setImageInDialog(file)}/>
                                <div className={'flex px-[4px] cancel-img-input '} onClick={() => setFile(null)}>
                                    <FontAwesomeIcon className={'cursor-pointer dark:text-white rounded-4 border-2 border-slate-900'} icon={faXmark}/></div>
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
                                onPaste={(e)=> handleOnPast(e) }
                                onDrop={(e)=> handleOnDrag(e)}
                            />
                            <button
                                className="sent_button"
                                disabled={!isServerActive}
                                title={"Send"}
                                onClick={() => {
                                    const prompt = document.getElementById("prompt_inputs").value;
                                    if (prompt.length > 0 || file) {
                                        getResponseFromAI(prompt);
                                        document.getElementById("prompt_inputs").value = '';
                                        setQuestion(prompt);
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
            </div>
        </>
    );
};

export default GeminiApi;
