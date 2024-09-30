import {marked} from "marked";
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// marked.setOptions({
//     highlight: function (code, language) {
//         const validLang =  hljs.getLanguage(language) ? language : 'plaintext';
//         return hljs.highlight(code, { language:  validLang }).value;
//     }
// })
export const markedResponse = (response) => {
    const rawMarkup = marked(response, {sanitize: true})
    setTimeout(() => {
        const responseElement = document.getElementById("response_element");
        if(responseElement) {
            responseElement.innerHTML += rawMarkup;

            responseElement.querySelectorAll('pre code').forEach((block) => {
                const language = block.className.split(' ').find(className => className.startsWith('language-'));
                if(language) {
                    const languageName = document.createElement('div');
                    languageName.className = 'response-code-language-name'
                    languageName.textContent = language.substring(9);
                    block.parentNode.insertBefore(languageName, block);
                }
                hljs.highlightElement(block);
            });
        } else {
            console.error("Response Element Not Found.")
        }
        }, 0)
}