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
            loading : false
        };
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
        console.log(lines, "linessss")
        const formattedResponse = [];

        let isCodeFirstLine = false;
        let isCodeLine = '';
        let codeContainer = document.createElement('div');
        codeContainer.className = "code-container";

        lines.forEach((line, index) => {
            let spaceStarCheck = /^\s*\*/gm;
            let spaceHypenCheck = /^\s*-/gm;
            let startWithDigitStar = /^\s*\d+\.\s+\*\*/gm;
            const codeElement = document.createElement('code');
            const preElement = document.createElement('pre');
            line = line.replace(/^s+/, '')
            if (line.startsWith("```") || line.endsWith("```")) {
                let completeCodeLine = /```([\s\S]*?)```/g;
                if (completeCodeLine.test(line)) {
                    codeElement.textContent = line.replace(/```/g, "")
                    preElement.appendChild(codeElement)
                    codeContainer.appendChild(preElement)
                    formattedResponse.push(codeContainer)
                    codeContainer = document.createElement('div');
                    codeContainer.className = "code-container";
                    isCodeLine = 'oneLine'
                } else {
                    if (isCodeLine === '') {
                        codeElement.textContent = line.replace(/```/g, "")
                        preElement.appendChild(codeElement)
                        codeContainer.appendChild(preElement)
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
                codeElement.textContent = line
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
                <div id="res" className="response_container">
                    <div className={"question_header"}>{this.state.question}</div>
                    {this.state.question.length > 0 && <div className={"horizontal-line"}></div>}
                    <div>
                        {this.state.loading && <LoaderActive/>}
                        <div id={"response_element"}></div>
                    </div>
                </div>
                <br/>
                <div className={"input-portion"}>
                    <input type="text" id={"prompt_inputs"} onKeyUp={this.handleKeyDown} placeholder={"Ask what you want to know!"}/>
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