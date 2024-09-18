import React, {useContext, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import LoaderActive from '../loader/LoaderActive';
import robot from '../css/webp/robot_avatar.webp';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.min.js'; // Import the language you need
import 'prismjs/components/prism-markup.min.js';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-dark.css';
import SideBarContent from "./SideBarContent";
import useIsMobile from "../hooks/useIsMobile";
import {CircularProgress, IconButton} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {UserContext} from "../context/UserContext";
import UserProfile from "./UserProfile";
import {postRequest} from "../API_helper/APIs";
import TaskAlt from '@mui/icons-material/TaskAlt';
import {AppContext} from "../context/AppContext";



const GeminiApi = () => {

    const [response, setResponse] = useState(false);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [textareaHeight, setTextareaHeight] = useState('2.5rem');
    const textareaRef = useRef(null);
    const [previousLineCount, setPreviousLineCount] = useState(1);
    const [codeLanguageName, setCodeLanguageName] = useState('');
    const isMobile = useIsMobile();
    const [historyList, setHistoryList] = useState([]);

    const { state, setState } = useContext(UserContext);
    const {isServerActive, isServerMsgVisible} = useContext(AppContext);

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
            const formattedResponse = reformatResponse(res.response);
            if (document.getElementById("response_element"))
                document.getElementById("response_element").innerHTML = '';
            formattedResponse.forEach(element =>
                document.getElementById("response_element")?.appendChild(element)
            );
            setLoading(false);
            if(state.user)
               storeSearchHistory(res.response, res.prompt);
        });
    };

    const reformatResponse = (text) => {
        const lines = text?.split('\n');
        const formattedResponse = [];
        const spaceStarCheck = /^\s*\*/gm;
        const spaceHypenCheck = /^\s*-/gm;

        let isCodeFirstLine = false;
        let isCodeLine = '';
        let codeContainer = document.createElement('div');
        codeContainer.className = "code_block";
        lines.forEach((line, index) => {
            const codeElement = document.createElement('code');
            const preElement = document.createElement('pre');
            const language = codeLanguageName;
            preElement.key = `code-block-${index}`
            line = line.replace(/^s+/, '');
            if (line.startsWith("```") || line.endsWith("```")) {
                const completeCodeLine = /```([\s\S]*?)```/g;
                if (completeCodeLine.test(line)) {
                    codeElement.className = `language-${language}`
                    codeElement.innerHTML = Prism.highlight(line.replace(/```/g, ""), Prism.languages[language] || Prism.languages.javascript, language);
                    preElement.appendChild(codeElement);
                    codeContainer.appendChild(preElement);
                    formattedResponse.push(codeContainer);
                    codeContainer = document.createElement('div');
                    codeContainer.className = "code_block";
                    isCodeLine = 'oneLine';
                } else {
                    if (isCodeLine === '') {
                        codeElement.className = `language-${language}`
                        codeElement.innerHTML = Prism.highlight(line.replace(/```/g, ""), Prism.languages[language] || Prism.languages.javascript, language);
                        setCodeLanguageName(line.replace(/```/g, ""));
                        preElement.appendChild(codeElement);
                        preElement.className = 'name-of-language'
                        codeContainer.appendChild(preElement);
                        isCodeLine = 'start';
                        isCodeFirstLine = true;
                    } else if (isCodeLine === 'start') {
                        codeElement.className = `language-${language}`;
                        codeElement.innerHTML = Prism.highlight(line.replace(/```/g, ""), Prism.languages[language] || Prism.languages.javascript, language);
                        preElement.appendChild(codeElement);
                        codeContainer.appendChild(preElement);
                        formattedResponse.push(codeContainer);
                        codeContainer = document.createElement('div');
                        codeContainer.className = "code_block";
                        isCodeLine = 'end';
                    }
                }
            } else isCodeFirstLine = false;

            if (isCodeLine === 'start' && !isCodeFirstLine) {
                codeElement.className = `language-${language}`
                codeElement.innerHTML = Prism.highlight(line.replace(/```/g, ""), Prism.languages[language] || Prism.languages.javascript, language);
                preElement.appendChild(codeElement);
                codeContainer.appendChild(preElement);
            }
            if ([''].includes(isCodeLine)) {
                if (line.startsWith("**")) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = `<strong style="color: #000000;">${line.replace(/\*\*/g, '')}</strong>`;
                    formattedResponse.push(customElement);
                } else if (line.startsWith("- **") || line.startsWith("* **")) {
                    const starLine = line.replace(/^[*-]/g, '').split('**');
                    const customElement = document.createElement('div');
                    customElement.innerHTML = `<li key=${index}><strong>${starLine[1]}</strong>&nbsp;<small>${starLine[2]}</small></li>`;
                    formattedResponse.push(customElement);
                } else if (line.startsWith("- ") || line.startsWith("* ")) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = `<li key=${index}>${line.substring(2)}</li>`;
                    formattedResponse.push(customElement);
                } else if (spaceStarCheck.test(line) || spaceHypenCheck.test(line)) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = `<li key=${index}>${line.replace(/^[-*]/, '')}</li>`;
                    formattedResponse.push(customElement);
                } else if (line.length === 0) {
                    const emptyDiv = document.createElement('div');
                    emptyDiv.style.height = '10px';
                    formattedResponse.push(emptyDiv);
                } else {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = `<p key=${index}>&emsp;&emsp;${line}</p>`;
                    formattedResponse.push(customElement);
                }
            }
            if (isCodeLine === 'end' || isCodeLine === 'oneLine')
                isCodeLine = '';
        });
        return formattedResponse;
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
            if (prompt.trim().length > 0) {
                textareaRef.current.value = '';
                if (document.getElementById("response_element"))
                    document.getElementById("response_element").innerHTML = '';
                getResponseFromAI(prompt);
                setQuestion(prompt);
            }
        }
        const currentLineCount = textareaRef.current.value.split('\n').length;
        const input = textareaRef.current.value
        if (input.length === 0) {
            adjustTextareaHeight(null);
        } else if (event.key === 'Enter' && event.shiftKey) {
            adjustTextareaHeight(textareaRef.current.scrollHeight);
        } else if (event.key === 'Backspace') {
            if (currentLineCount < previousLineCount) {
                adjustTextareaHeight((textareaRef.current.scrollHeight - 22));
            }
            setPreviousLineCount(currentLineCount);
        }

        document.getElementById('prompt_inputs').addEventListener('keyup', function () {
            const lines = calculateLines(this);
            adjustTextareaHeight(lines * (lines === 1 ? 36 : 22));
        });
    };


    const adjustTextareaHeight = (scrollHeight) => {
        setTextareaHeight('2.5rem');
        const prompt_inputs = document.getElementById("prompt_inputs");
        if (scrollHeight) {
            setTextareaHeight(`${scrollHeight}px`);
            prompt_inputs.style.borderRadius = '15px'
        } else {
            prompt_inputs.style.borderRadius = '40px'
        }
    };

     const updateIsCollapsed = (value) => {
         setIsCollapsed(value);
     }

    return (
        <>
            {isMobile && isCollapsed &&
            <div className={'mt-2'} style={{display: 'flex', alignItems: "center", width: '100%'}}>
                <IconButton onClick={() => updateIsCollapsed(!isCollapsed)}>
                    <MenuOutlinedIcon/>
                </IconButton>&nbsp;&nbsp;
                <h2 className="title-mobile title" style={{fontSize: '2rem !important'}}>IAmAI</h2>
            </div>}
            <div className="main-container">
                <div className="title-container" style={isCollapsed ? {width: 0} : {width: '10%'}}>
                    <SideBarContent
                        reformatResponse={reformatResponse}
                        isCollapsed={isCollapsed}
                        setResponse={setResponse}
                        setQuestion={setQuestion}
                        setHistoryList={setHistoryList}
                        historyList={historyList}
                        updateIsCollapsed={updateIsCollapsed}>
                    </SideBarContent>
                    {!isMobile && isCollapsed && <> &nbsp;&nbsp;&nbsp;&nbsp;
                    <h2 style={{fontSize: 'xx-large'}} className="title" >IAmAI</h2></>}
                </div>
                <div className="parent-container" style={isCollapsed ? {width: '100%'} : {width: '90%'}}>
                    {response ?
                        <div id="res" className="response_container shadow rounded-2">
                            <div className="question_header">{question}</div>
                            {question.length > 0 && <div className="horizontal-line"></div>}
                            <div>
                                {loading && <LoaderActive/>}
                                <div id="response_element"></div>
                            </div>
                        </div>
                        :
                        <div style={{position: 'relative', bottom: '100px'}} className={'user-select-none'} >
                            <img className="robot-image" src={robot} style={{height: '22rem'}}
                                 alt={"loading...."}/>
                        </div>}
                    <div className={'flex'}>
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
                        style={{height: textareaHeight, maxHeight: '190px'}}
                        id="prompt_inputs"
                        onKeyUp={handleKeyDown}
                        onKeyDown={handleKeyDown}
                        disabled={!isServerActive}
                        placeholder="Ask what you want to know!"
                    />
                            <button
                                className="sent_button"
                                disabled={!isServerActive}
                                onClick={() => {
                                    const prompt = document.getElementById("prompt_inputs").value;
                                    if (prompt.length > 0) {
                                        getResponseFromAI(prompt);
                                        document.getElementById("prompt_inputs").value = '';
                                        setQuestion(prompt);
                                    }
                                }}
                                // onKeyUp={handleKeyDown}
                            >
                                <FontAwesomeIcon icon={faPaperPlane} color="green" fontSize={isMobile ? 33 : 20}/>
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
