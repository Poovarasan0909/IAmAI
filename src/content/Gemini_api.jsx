import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons'
import jsonData from '../../package.json'


class gemini_api extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            response: '',
            question: ''
        };
    }

    getResponseFromAI = (prompt) => {
        const {GoogleGenerativeAI} = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(jsonData.authKey);

        async function run() {
            const model = genAI.getGenerativeModel({model: "gemini-pro"});
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

        run().then(r => this.setState({response: r}));
    }
    handleKeyDown = (event) => {
        if(event.key === 'Enter')  {
            let prompt = document.getElementById("prompt_inputs").value
            if(prompt.length > 0) {
            document.getElementById("prompt_inputs").value = ''
            this.getResponseFromAI(prompt)
            this.setState({question : prompt})
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
                    <div>{this.state.response}</div>
                </div>
                <br/>
                <div>
                    <input type="text" id={"prompt_inputs"} onKeyUp={this.handleKeyDown}/>
                    <button className="sent_button"
                            onClick={() => {
                                let prompt = document.getElementById("prompt_inputs").value
                                if (prompt.length > 0) {
                                    this.getResponseFromAI(prompt)
                                    document.getElementById("prompt_inputs").value = ''
                                    this.setState({question: prompt})
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