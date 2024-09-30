import React, {useContext, useRef, useState} from "react";
import LoaderActive from '../loader/LoaderActive';
import robot from '../css/webp/ro.webp';
import useIsMobile from "../hooks/useIsMobile";
import {CircularProgress, IconButton, Paper} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {UserContext} from "../context/UserContext";
import UserProfile from "./UserProfile";
import {postRequest} from "../API_helper/APIs";
import TaskAlt from '@mui/icons-material/TaskAlt';
import {AppContext} from "../context/AppContext";
import SideBar from "./SideBar";
import iamaiLogo from "../css/IAMAI-19-09-2024.png";
import SendIcon from '@mui/icons-material/Send';
import {markedResponse} from "./markedResponse";

const GeminiApi = () => {

    const [response, setResponse] = useState(false);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState('4.5rem');
    const textareaRef = useRef(null);
    const [previousLineCount, setPreviousLineCount] = useState(1);
    const isMobile = useIsMobile();
    const [historyList, setHistoryList] = useState([]);

    const { state, setState } = useContext(UserContext);
    const {isServerActive, isServerMsgVisible} = useContext(AppContext);
    const responseFormateRef = useRef(null);

    const fetchResponse = async (prompt) => {
        return postRequest('/geminiAI-data', {
            prompt: prompt
        });
    }

    const storeSearchHistory = (response, prompt) => {
        postRequest('createUserData', {
            userId: state.user._id,
            prompt: prompt,
            response: response
        })
        setHistoryList([{prompt: prompt, response: response}, ...historyList])
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
                const {data} = await fetchResponse(inst);
                return {response: data.res, prompt: prompt};
            } catch (err) {
                console.error(err);
                return {response: '!ERROR  : Something Went Wrong', prompt: prompt};
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
            markedResponse(res.response);
            setLoading(false);
            if(state.user)
               storeSearchHistory(res.response, res.prompt);
        });
    };

    // const reformatResponse = (text) => {
    //     const lines = text?.split('\n');
    //     const formattedResponse = [];
    //     const spaceStarCheck = /^\s*\*/gm;
    //     const spaceHypenCheck = /^\s*-/gm;
    //
    //     let isCodeFirstLine = false;
    //     let isCodeLine = '';
    //     let codeContainer = document.createElement('div');
    //     codeContainer.className = "code_block";
    //     lines.forEach((line, index) => {
    //         const codeElement = document.createElement('code');
    //         const preElement = document.createElement('pre');
    //         const language = codeLanguageName;
    //         preElement.key = `code-block-${index}`
    //         line = line.replace(/^s+/, '');
    //         if (line.startsWith("```") || line.endsWith("```")) {
    //             const completeCodeLine = /```([\s\S]*?)```/g;
    //             if (completeCodeLine.test(line)) {
    //                 codeElement.className = `language-${language}`
    //                 codeElement.innerHTML = Prism.highlight(line.replace(/```/g, ""), Prism.languages[language] || Prism.languages.javascript, language);
    //                 preElement.appendChild(codeElement);
    //                 codeContainer.appendChild(preElement);
    //                 formattedResponse.push(codeContainer);
    //                 codeContainer = document.createElement('div');
    //                 codeContainer.className = "code_block";
    //                 isCodeLine = 'oneLine';
    //             } else {
    //                 if (isCodeLine === '') {
    //                     codeElement.className = `language-${language}`
    //                     codeElement.innerHTML = Prism.highlight(line.replace(/```/g, ""), Prism.languages[language] || Prism.languages.javascript, language);
    //
    //                     setCodeLanguageName(line.replace(/```/g, ""));
    //                     preElement.appendChild(codeElement);
    //                     preElement.className = 'name-of-language border-b border-white-500'
    //                     codeContainer.appendChild(preElement);
    //                     isCodeLine = 'start';
    //                     isCodeFirstLine = true;
    //                 } else if (isCodeLine === 'start') {
    //                     codeElement.className = `language-${language}`;
    //                     codeElement.innerHTML = Prism.highlight(line.replace(/```/g, ""), Prism.languages[language] || Prism.languages.javascript, language);
    //                     preElement.appendChild(codeElement);
    //                     codeContainer.appendChild(preElement);
    //                     formattedResponse.push(codeContainer);
    //                     codeContainer = document.createElement('div');
    //                     codeContainer.className = "code_block";
    //                     isCodeLine = 'end';
    //                 }
    //             }
    //         } else isCodeFirstLine = false;
    //
    //         if (isCodeLine === 'start' && !isCodeFirstLine) {
    //             codeElement.className = `language-${language}`
    //             codeElement.innerHTML = Prism.highlight(line.replace(/```/g, ""), Prism.languages[language] || Prism.languages.javascript, language);
    //             preElement.appendChild(codeElement);
    //             codeContainer.appendChild(preElement);
    //         }
    //         console.log(line, " __outside...",)
    //         if ([''].includes(isCodeLine)) {
    //             if (line.startsWith("**")) {
    //                 const customElement = document.createElement('div');
    //                 customElement.innerHTML = `<strong class='dark:text-blue-400 text-zinc-900'>${line.replace(/\*\*/g, '')}</strong>`;
    //                 formattedResponse.push(customElement);
    //             } else if (line.startsWith("- **") || line.startsWith("* **")) {
    //                 // console.error(line , "_inside..");
    //                 const starLine = line.replace(/^[*-]/g, '').split('**');
    //                 const customElement = document.createElement('div');
    //                 customElement.innerHTML = `<li key=${index}><strong>${escapeHTML(starLine[1])}</strong>&nbsp;<small>${escapeHTML(starLine[2])}</small></li>`;
    //                 formattedResponse.push(customElement);
    //             } else if(/^\s+- \*\*/.test(line) || /^\s+\* \*\*/.test(line)) {
    //                 const hypenStarLine = line.replace(/^\s+[*-]/g, '').split('**');
    //                 const customElement = document.createElement('div');
    //                 customElement.style.padding = '6px 0px 6px 30px';
    //                 customElement.innerHTML = `<li key=${index}><strong>${escapeHTML(hypenStarLine[1])}</strong>&nbsp;<small>${escapeHTML(hypenStarLine[2])}</li>`;
    //                 formattedResponse.push(customElement);
    //             }
    //             // else if(/^\d+\.\s+\*\*(.*?)\*\*/.test(line)) {
    //             //     console.warn(line, "lines...")
    //             // }
    //             else if (line.startsWith("- ") || line.startsWith("* ")) {
    //                 const customElement = document.createElement('div');
    //                 customElement.innerHTML = `<li key=${index} >${line.substring(2)}</li>`;
    //                 formattedResponse.push(customElement);
    //             } else if (spaceStarCheck.test(line) || spaceHypenCheck.test(line)) {
    //                 const customElement = document.createElement('div');
    //                 customElement.innerHTML = `<li key=${index}>${line.replace(/^[-*]/, '')}</li>`;
    //                 formattedResponse.push(customElement);
    //             } else if (line.length === 0) {
    //                 const emptyDiv = document.createElement('div');
    //                 emptyDiv.style.height = '10px';
    //                 formattedResponse.push(emptyDiv);
    //             } else {
    //                 const customElement = document.createElement('div');
    //                 customElement.innerHTML = `<p key=${index}>&emsp;&emsp;${line}</p>`;
    //                 formattedResponse.push(customElement);
    //             }
    //         }
    //         if (isCodeLine === 'end' || isCodeLine === 'oneLine')
    //             isCodeLine = '';
    //     });
    //     return formattedResponse;
    // };

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
            if (prompt.trim().length > 0) {
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

    return (
        <>
            {isMobile && isSideBarOpen &&
            <div className={'mt-2'} style={{display: 'flex', alignItems: "center", width: '100%'}}>
                <IconButton onClick={() => updateIsSideBarOpen(!isSideBarOpen)}>
                    <MenuOutlinedIcon/>
                </IconButton>&nbsp;&nbsp;
                <h2 className="title-mobile title" style={{fontSize: '2rem !important'}}>IAmAI</h2>
            </div>}
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
                        updateIsSideBarOpen={updateIsSideBarOpen}>
                    </SideBar>
                </div>
                <div className="parent-container bg-[rgba(246,247,248,0.5)] dark:bg-[rgba(52,52,52)]" style={!isSideBarOpen ? {width: '100%'} : {width: '90%'}}>
                    {!isMobile && !isSideBarOpen && <>
                        <img src={iamaiLogo} alt="IAmAI"
                             className={'w-[150px] h-[40px] x-[999] absolute top-[10px] left-[60px]'}/>
                    </>}
                    {response ?
                        <div className={`h-[75%] ${isMobile ? 'w-[99%]' :'w-[60%]'} relative bottom-4 border-0 overflow-auto px-2`}>
                            <div className={'px-2 py-1 dark:text-white bg-[lavender] dark:bg-[#757575f7] w-fit rounded-t-md mb-2 ' +
                                'whitespace-pre-wrap max-w-[100%] max-h-[60%] min-w-[10%] overflow-y-auto'} >
                                {question}
                            </div>
                            <hr className={'dark:text-sky-100 text-[#757575f7]'}/>
                            {loading && <LoaderActive/>}
                            <div id="response_element" className={"dark:text-white"}>
                                <div dangerouslySetInnerHTML={responseFormateRef.current}></div>
                            </div>
                        </div>
                        :
                        <div style={{position: 'relative', bottom: '40px'}} className={'user-select-none'}>
                            <img className="robot-image user-select-none" src={robot} style={{height: '22rem'}}
                                 alt={"loading...."}/>
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
                                placeholder="Ask what you want to know!"
                            />
                            <button
                                className="sent_button"
                                disabled={!isServerActive}
                                title={"Send"}
                                onClick={() => {
                                    const prompt = document.getElementById("prompt_inputs").value;
                                    if (prompt.length > 0) {
                                        getResponseFromAI(prompt);
                                        document.getElementById("prompt_inputs").value = '';
                                        setQuestion(prompt);
                                    }
                                }}
                            >
                                <SendIcon style={{width: "35px", height: "35px"}} className={'text-[#174AE4] dark:text-[#67e8f9]'}/>
                            </button>
                       </div>
                    </div>
                    <UserProfile state={state} setState={setState}/>
                </div>
            </div>
        </>
    );
};

export default GeminiApi;
