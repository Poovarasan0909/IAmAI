import React, {useEffect, useRef} from 'react';
import {marked} from "marked";
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';


const ModelResponse = ({response, key}) => {
    const responseRef = useRef(null);
    useEffect(() => {
        if(response) {
        const rawMarkup = marked(response, {sanitize: true});
        if (responseRef.current) {
            responseRef.current.innerHTML = rawMarkup;

            responseRef.current.querySelectorAll("pre code").forEach((block) => {
                const language = block.className
                    .split(" ")
                    .find((className) => className.startsWith("language-"));
                if (language) {
                    const languageName = document.createElement("div");
                    languageName.className = "response-code-language-name";
                    languageName.textContent = language.substring(9);
                    block.parentNode.insertBefore(languageName, block);
                }
                hljs.highlightElement(block);
            });
        } else {
            console.error("Response Element Not Found.");
        }
    }
    }, [response]);

    return (
        <div key={key} ref={responseRef}>
        </div>
    )
}

export default ModelResponse;