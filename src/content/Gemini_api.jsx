import React,{Component} from "react";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

class gemini_api extends React.Component{
    constructor(props) {
        super(props);
        this.state ={
            response : ''
        };
    }
    // componentDidMount() {
    //
    // }


    getResponseFromAI = (prompt) => {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI('AIzaSyD3hYO3Ese95XivATRhmJxLQBaQl-e5JTs');
        async function run() {
            const model = genAI.getGenerativeModel({ model: "gemini-pro"});
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return response.text();
        }
        run().then(r =>   this.setState ({response : r}));
    }

    render() {
          return(
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
                  <div id="res" className="response_container">{this.state.response}</div>
                  <br/>
                  <div>
                  <input type="text" id={"prompt_inputs"}/>
                  <button className = "sent_button" onClick={() => {
                      let prompt = document.getElementById("prompt_inputs").value
                      this.getResponseFromAI(prompt)
                  }} > <FontAwesomeIcon icon={faPaperPlane} color={'green'} fontSize={40} />
                  </button></div>
              </div>
          );
    }
}

export default gemini_api