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

     // reformatResponse =(response) =>  {
     //    // Extract and bold the title
     //    const titleMatch = response.match(/^(.*):/);
     //    const title = titleMatch ? `<b>${titleMatch[1]}</b>` : "";
     //
     //    // Split the response into lines, removing empty lines
     //    const lines = response.split("\n").filter((line) => line !== "");
     //
     //    // Apply formatting rules
     //    const formattedLines = lines.map((line) => {
     //        if (line.startsWith("- ")) {
     //            return `<li>> ${line.slice(2)}</li>`; // Convert hyphens to bullet points
     //        } else if (line.startsWith("```")) {
     //            return `<pre><code>${line.slice(3, -3)}</code></pre>`; // Convert code blocks
     //        } else {
     //            return line;
     //        }
     //    });

        // Join the formatted lines, prepend the title, and return
    //     return title + formattedLines.join("\n");
    // }

    // reformatResponse = (response)=>{
    //     return response
    //         .split('\n\n')
    //         .map((line) => {
    //             // Bold all level 1 headings (lines starting with '**')
    //             if (line.startsWith('**')) {
    //                 return `<h1>${line.slice(2,-2)}</h1>`;
    //             }
    //
    //             // Italicize all level 2 headings (lines starting with '*')
    //             if (line.startsWith('*')) {
    //                 return `<h2>${line.slice(1,-1)}</h2>`;
    //             }
    //
    //             // Convert hyphens to bullet points
    //             if (line.startsWith('- ')) {
    //                 return `<li>${line.slice(2)}</li>`;
    //             }
    //
    //             // Keep other lines as paragraphs
    //             return <p>{line}</p>;
    //         })
    // }

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
            // document.getElementById("response").innerHTML = response;
            // const paragraphs = response.split('\n\n');
            console.log("formatted response -->",response)
            document.getElementById("response_element").innerHTML = ''
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
        let spaceStarCheck = /^\s*\*/gm;
        let spaceHypenCheck = /^\s*-/gm;

        let isCodeFirstLine = false;
        let isCodeLine = '';
        let codeContainer = document.createElement('div');
        codeContainer.className = "code_block";

        lines.forEach((line, index) => {
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
                    codeContainer.className = "code_block";
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
                        codeContainer.className = "code_block";
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
                if (line.startsWith("**")) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = '<strong style={{color: \'red\'}}>' + line.replace(/\*\*/g, '') + '</strong>';
                    formattedResponse.push(customElement);
                } else if (line.startsWith("- **") || line.startsWith("* **")) {
                    let starLine = line.replace(/^[*-]/g, '').split('**');
                    const customElement = document.createElement('div');
                    customElement.innerHTML = '<li key={index}><strong>' + starLine[1] + '</strong>' + '&nbsp;' +
                        '<small>' + starLine[2] + '</small></li>';
                    // eslint-disable-next-line no-useless-concat
                    formattedResponse.push(customElement);
                } else if (line.startsWith("- ") || line.startsWith("* ")) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = '<li key={index}>' + line.substring(2) + '</li>';
                    formattedResponse.push(customElement);
                } else if (spaceStarCheck.test(line) || spaceHypenCheck.test(line)) {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = '<li key={index}>' + line.replace(/^[-*]/, '') + '</li>';
                    formattedResponse.push(customElement)
                } else if (line.length === 0) {
                    formattedResponse.push(document.createElement('br'))
                } else {
                    const customElement = document.createElement('div');
                    customElement.innerHTML = '<p key={index}>' + line + '</p>';
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
            let prompt = document.getElementById("prompt_inputs").value
            if(prompt.length > 0) {
            document.getElementById("prompt_inputs").value = ''
            this.getResponseFromAI(prompt)
            this.setState({question : prompt, response: []})
            }
        }
    }

    render() {
        const titleRegex = /\*\*(.*?)\*\*/g;
        const codeRegex = /```(.*?)```/g;
        //Todo: want to do
        const codeFirstRegex = /```/g;

        // this.state.response.map((para) => (
        //     console.log(para, codeRegex.test(para).toString(), titleRegex.test(para).toString(), !codeRegex.test(para).toString())
        // ))

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