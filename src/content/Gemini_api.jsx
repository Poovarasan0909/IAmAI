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
            return response.text();
        }

        run().then(res => {
            const paragraphs = res.split('\n\n');
            this.setState({response: paragraphs, loading : false})
             });
    }
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

        this.state.response.map((para) => (
            console.log(para, codeRegex.test(para).toString(), titleRegex.test(para).toString(), !codeRegex.test(para).toString())
        ))

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
                        {this.state.response.map((phara) => (
                            phara.split('\n').map((para) =>
                            (codeRegex.test(para)) ? <code>{para.replace(/`/g,'')}</code> :
                               (titleRegex.test(para)) ? <h3 className={"response-title"}> {para.replace(/[*]/g,'')}</h3>:
                                   <p>{para}</p>)
                        ))}
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