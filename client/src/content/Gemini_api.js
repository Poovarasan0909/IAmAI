import React, {useRef, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import jsonData from '../../package.json';
import LoaderActive from '../loader/LoaderActive';

const GeminiApi = () => {
    const [response, setResponse] = useState([]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [textareaHeight, setTextareaHeight] = useState('2rem');
    const textareaRef = useRef(null);
    const [previousLineCount, setPreviousLineCount] = useState(1);

    const getResponseFromAI = async (prompt) => {
        setLoading(true);
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(jsonData.authKey);

        const run = async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("response ->>", response);
            return response.text();
        };

        run().then(res => {
            const formattedResponse = reformatResponse(res);
            console.log("formatted response -->", formattedResponse);
            document.getElementById("response_element").innerHTML = '';
            formattedResponse.forEach(element =>
                document.getElementById("response_element").appendChild(element)
            );
            setResponse(formattedResponse);
            setLoading(false);
        });
    };

    const reformatResponse = (text) => {
        const lines = text.split('\n');
        console.log(lines, "linessss");
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
            line = line.replace(/^s+/, '');
            if (line.startsWith("```") || line.endsWith("```")) {
                const completeCodeLine = /```([\s\S]*?)```/g;
                if (completeCodeLine.test(line)) {
                    codeElement.textContent = line.replace(/```/g, "");
                    preElement.appendChild(codeElement);
                    codeContainer.appendChild(preElement);
                    formattedResponse.push(codeContainer);
                    codeContainer = document.createElement('div');
                    codeContainer.className = "code_block";
                    isCodeLine = 'oneLine';
                } else {
                    if (isCodeLine === '') {
                        codeElement.textContent = line.replace(/```/g, "");
                        preElement.appendChild(codeElement);
                        codeContainer.appendChild(preElement);
                        isCodeLine = 'start';
                        isCodeFirstLine = true;
                    } else if (isCodeLine === 'start') {
                        codeElement.textContent = line.replace(/```/g, "");
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
                codeElement.textContent = line;
                preElement.appendChild(codeElement);
                codeContainer.appendChild(preElement);
            }
            if ([''].includes(isCodeLine)) {
                if (line.startsWith("**")) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = `<strong style="color: red;">${line.replace(/\*\*/g, '')}</strong>`;
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
                    formattedResponse.push(document.createElement('br'));
                } else {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = `<p key=${index}>${line}</p>`;
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
        console.log(event)
        if (event.key === 'Enter' && !event.shiftKey) {
            const prompt = textareaRef.current.value;
            if (prompt.length > 0) {
                textareaRef.current.value = '';
                document.getElementById("response_element").innerHTML = '';
                // getResponseFromAI(prompt);
                setQuestion(prompt);
                setResponse([]);
            }
        }
        const currentLineCount = textareaRef.current.value.split('\n').length;
        console.log(currentLineCount, "dfvdfvdffdfvf")
        const input = textareaRef.current.value
        if(input.length === 0) {
            adjustTextareaHeight(null);
        } else if(event.key === 'Enter' && event.shiftKey){
            adjustTextareaHeight(textareaRef.current.scrollHeight);
        } else if (event.key === 'Backspace') {
            if (currentLineCount < previousLineCount) {
                adjustTextareaHeight((textareaRef.current.scrollHeight-22));
            }
            setPreviousLineCount(currentLineCount);
        }

        document.getElementById('prompt_inputs').addEventListener('keyup', function() {
            const lines = calculateLines(this);
            adjustTextareaHeight((lines*22));
            console.log('Number of lines:', lines);
        });
    };


    const adjustTextareaHeight = (scrollHeight) => {
        setTextareaHeight('1.5rem');
        const prompt_inputs = document.getElementById("prompt_inputs");
        if(scrollHeight) {
            setTextareaHeight(`${scrollHeight}px`);
            prompt_inputs.style.borderRadius = '15px'
            console.log(scrollHeight, "scrollheight .....", prompt_inputs)
        } else {
            prompt_inputs.style.borderRadius = '40px'
        }
    };

    return (
        <div className="parent-container">
            <div className="title-container">
                <h1 className="title">IAmAI</h1>
            </div>
            <div id="res" className="response_container">
                <div className="question_header">{question}</div>
                {question.length > 0 && <div className="horizontal-line"></div>}
                <div>
                    {loading && <LoaderActive />}
                    <div id="response_element"></div>
                </div>
            </div>
            <div className="input-portion">
                <div className="textarea-wrapper">
                <textarea
                    ref={textareaRef}
                    style={{height: textareaHeight,maxHeight: '190px'}}
                    id="prompt_inputs"
                    onKeyUp={handleKeyDown}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask what you want to know!"
                />
            <button
                className="sent_button"
                onClick={() => {
                    const prompt = document.getElementById("prompt_inputs").value;
                    if (prompt.length > 0) {
                        // getResponseFromAI(prompt);
                        document.getElementById("prompt_inputs").value = '';
                            setQuestion(prompt);
                            setResponse([]);
                        }
                    }}
                    onKeyUp={handleKeyDown}
                >
                    <FontAwesomeIcon icon={faPaperPlane} color="green" fontSize={20} />
                </button>
                </div>
            </div>
        </div>
    );
};

export default GeminiApi;
