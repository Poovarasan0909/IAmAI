import React, {useContext, useEffect, useRef} from 'react';
import {marked} from "marked";
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';
import {AppContext} from "../context/AppContext";


const ModelResponse = ({response, key}) => {
    const themeMode = useContext(AppContext).themeMode;
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
                    const copyButton = document.createElement("button");
                    copyButton.title = 'Copy'
                    copyButton.className = "copy-button absolute top-[1px] right-1 dark:fill-white";
                    copyButton.innerHTML = `<svg id='Copy_24' width='16' height='16' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/>
                        <g transform="matrix(1 0 0 1 12 12)" >
                            <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill-rule: nonzero; opacity: 1;" transform=" translate(-12, -12)" d="M 4 2 C 2.895 2 2 2.895 2 4 L 2 17 C 2 17.552 2.448 18 3 18 C 3.552 18 4 17.552 4 17 L 4 4 L 17 4 C 17.552 4 18 3.552 18 3 C 18 2.448 17.552 2 17 2 L 4 2 z M 8 6 C 6.895 6 6 6.895 6 8 L 6 20 C 6 21.105 6.895 22 8 22 L 20 22 C 21.105 22 22 21.105 22 20 L 22 8 C 22 6.895 21.105 6 20 6 L 8 6 z M 8 8 L 20 8 L 20 20 L 8 20 L 8 8 z" stroke-linecap="round" />
                        </g>
                    </svg>`
                    copyButton.onclick = () => {
                        navigator.clipboard.writeText(block.textContent).then(() => {
                            copyButton.setAttribute("title", "Copied!");
                            copyButton.innerHTML = 'copied!';
                            setTimeout(() => {
                                copyButton.innerHTML = `<svg id='Copy_24' width='16' height='16' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/>
                                                        <g transform="matrix(1 0 0 1 12 12)" >
                                                            <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill-rule: nonzero; opacity: 1;" transform=" translate(-12, -12)" d="M 4 2 C 2.895 2 2 2.895 2 4 L 2 17 C 2 17.552 2.448 18 3 18 C 3.552 18 4 17.552 4 17 L 4 4 L 17 4 C 17.552 4 18 3.552 18 3 C 18 2.448 17.552 2 17 2 L 4 2 z M 8 6 C 6.895 6 6 6.895 6 8 L 6 20 C 6 21.105 6.895 22 8 22 L 20 22 C 21.105 22 22 21.105 22 20 L 22 8 C 22 6.895 21.105 6 20 6 L 8 6 z M 8 8 L 20 8 L 20 20 L 8 20 L 8 8 z" stroke-linecap="round" />
                                                        </g>
                                                    </svg>`
                                copyButton.setAttribute("title", "Copy");
                            }, 1500);
                        });
                    }
                    languageName.appendChild(copyButton)
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