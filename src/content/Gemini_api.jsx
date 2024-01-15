import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons'
import jsonData from '../../package.json'
import LoaderActive from '../loader/LoaderActive'


class gemini_api extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            response: [],
            question: '',
            scrollPosition: 0,
            loading : false
        };
    }

    handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = this.scrollableDiv;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        this.setState({ scrollPosition: scrollPercentage });
    };

    componentDidMount() {
        this.scrollableDiv.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        this.scrollableDiv.removeEventListener('scroll', this.handleScroll);
    }

    getResponseFromAI = (prompt) => {
        this.setState({loading: true});
        const {GoogleGenerativeAI} = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(jsonData.authKey);

        async function run() {
            const model = genAI.getGenerativeModel({model: "gemini-pro"});
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log("response ->>",response)
            return response.text();
        }

        run().then(res => {
            const response = this.reformatResponse(res);
            console.log("formatted response -->",response)
            response.map((element) =>
                document.getElementById("response_element").appendChild(element)
            )
            this.setState({response: response, loading : false})
             });
    }


    reformatResponse = (text) => {
        const lines = text.split('\n');
        let isLineForProgramName = false;
        console.log(lines, "linessss")
        const formattedResponse = [];

        let isCodeFirstLine = false;
        let isCodeLine = '';
        let codeContainer = document.createElement('div');
        codeContainer.className = "code-container";

        lines.forEach((line, index) => {
            let spaceStarCheck = /^\s*\*\s/gm;
            let spaceHypenCheck = /^\s*-/gm;
            const codeElement = document.createElement('code');
            const preElement = document.createElement('pre');
            line = line.replace(/^s+/, '')
            if (line.startsWith("```") || line.endsWith("```")) {
                let completeCodeLine = /```([\s\S]*?)```/g;
                if (completeCodeLine.test(line)) {
                    const words = line.replace(/```/g, "").split(' ');
                    const firstWord = words[0];

                    let code_header = document.createElement('div');
                    code_header.className = "code-header";
                    code_header.textContent = firstWord;
                    codeContainer.appendChild(code_header);

                    codeElement.textContent = words.slice(1).join(' ');
                    preElement.appendChild(codeElement)
                    codeContainer.appendChild(preElement)
                    formattedResponse.push(codeContainer)

                    codeContainer = document.createElement('div');
                    codeContainer.className = "code-container";
                    isCodeLine = 'oneLine'
                } else {
                    if (isCodeLine === '') {
                        if(line === '```') {
                            isLineForProgramName = true;
                        }
                        const words = line.replace(/```/g, "").split(' ');
                        const firstWord = words[0];

                        let code_header = document.createElement('div');
                        code_header.className = "code-header";
                        code_header.textContent = firstWord;
                        codeContainer.appendChild(code_header);
                        if(words.slice(1).join(' ').length > 0) {
                            codeElement.textContent = words.slice(1).join(' ');
                            preElement.appendChild(codeElement)
                            codeContainer.appendChild(preElement)
                        }
                        isCodeLine = 'start';
                        isCodeFirstLine = true;
                    } else if (isCodeLine === 'start') {
                        codeElement.textContent = line.replace(/```/g, "")
                        preElement.appendChild(codeElement)
                        codeContainer.appendChild(preElement)
                        formattedResponse.push(codeContainer)
                        codeContainer = document.createElement('div');
                        codeContainer.className = "code-container";
                        isCodeLine = 'end';
                    }
                }
            } else isCodeFirstLine = false;

            if (isCodeLine === 'start' && !isCodeFirstLine) {
                let words = line
                let code_header = document.createElement('div');
                if(isLineForProgramName){
                    words = line.split(" ")
                    const firstWord = words[0];
                    words = words.slice(1).join(' ');
                    code_header.className = "code-header";
                    code_header.textContent = firstWord;
                    isLineForProgramName = false
                }
                codeContainer.appendChild(code_header);

                codeElement.textContent = words
                preElement.appendChild(codeElement)
                codeContainer.appendChild(preElement)
            }
            if ([''].includes(isCodeLine)) {
                if (line.startsWith("**") && line.endsWith("**")) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong> &ensp;');
                    formattedResponse.push(customElement);
                } else if (line.startsWith("- **") || line.startsWith("* **")) {
                    let starLine = line.replace(/^[*-]/g, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>&ensp;');
                    const customElement = document.createElement('div');
                    customElement.innerHTML = '<li>'+starLine+'</li>'
                    // eslint-disable-next-line no-useless-concat
                    formattedResponse.push(customElement);
                    formattedResponse.push(document.createElement('br'))
                }else if (line.startsWith("- ") || line.startsWith("* ")) {
                    const customElement = document.createElement('div');
                    customElement.style = "margin:6px;"
                    customElement.innerHTML = '<li key={index}>' + line.substring(2) + '</li>';
                    formattedResponse.push(customElement);
                } else if (spaceStarCheck.test(line) || spaceHypenCheck.test(line)) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = '<li key={index}>' + line.replace(/^\s+/,'').replace(/^[-*]/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>&ensp;') + '</li>';
                    formattedResponse.push(customElement)
                } else {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = '<p key={index}>' + line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong> &ensp;') + '</p>';
                    formattedResponse.push(customElement);
                }
            }
            if (isCodeLine === 'end' || isCodeLine === 'oneLine')
                isCodeLine = '';
        });
        return formattedResponse;
    };
    handleKeyDown = (event) => {
        if(event.key === 'Enter')  {
            document.getElementById("response_element").innerHTML = ''
            let prompt = document.getElementById("prompt_inputs").value
            if(prompt.length > 0) {
            document.getElementById("prompt_inputs").value = ''
            this.getResponseFromAI(prompt)
            this.setState({question : prompt, response: []})
            }
        }
    }

    render() {
        const defaultMarginRight = -55;
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh'
            }}>
                <div className="title-container">
                    <h1 className="title">IAmAI</h1>
                </div>
                <div style={{
                    color: 'skyblue',
                    marginLeft: `${defaultMarginRight + (this.state.scrollPosition * 1.1)}` + '%'
                }}>
                    {Math.floor(this.state.scrollPosition) > 0 ? Math.floor(this.state.scrollPosition) + '%' : ''}</div>
                <div id="res" className="response_container" ref={(div) => {
                    this.scrollableDiv = div
                }}>
                    <div
                        style={{
                            width: `${this.state.scrollPosition}%`,
                            height: '5px',
                            background: 'blue',
                            position: 'sticky',
                            top: '-30px',
                            zIndex: '1',
                        }}
                    ></div>
                    <div className={"question_header"}>{this.state.question}</div>
                    {this.state.question.length > 0 && <div className={"horizontal-line"}></div>}
                    <div>
                        {this.state.loading && <LoaderActive/>}
                        <div id={"response_element"}></div>
                    </div>
                </div>
                <div className={"input-portion"}>
                    <input type="text" id={"prompt_inputs"} onKeyUp={this.handleKeyDown}
                           placeholder={"Ask what you want to know!"}/>
                    <button className="sent_button"
                            onClick={() => {
                                let prompt = document.getElementById("prompt_inputs").value
                                if (prompt.length > 0) {
                                    this.getResponseFromAI(prompt)
                                    document.getElementById("prompt_inputs").value = ''
                                    this.setState({question: prompt, response: []})
                                }
                            }}
                            onKeyUp={this.handleKeyDown}
                    ><FontAwesomeIcon icon={faPaperPlane} color={'green'} fontSize={40}/>
                    </button>
                </div>
            </div>
        );
    }
}

export default gemini_api