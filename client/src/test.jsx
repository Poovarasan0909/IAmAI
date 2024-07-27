import React from "react";

export default class Test extends React.Component{
    render() {
        const response = `To reforma
￼t the response from code like * - to a more readable format, you can use the following steps:
1. **Split the response into individual elements.** You can do this by using the \`split()\` method on the response string. For example, if the response is \`* - \`, you would use the following code to split it into individual elements:
\`\`\`
response_elements = response.split()
\`
This would result in a list of two elements: ['*', '-'].

2. **Create a new string with the desired formatting.** You can use the \`join()\` method to concatenate the individual elements of the list into a new string. For example, if you want to format the response as a bulleted list, you would use the following code:

\`\`\`
formatted_response = '<ul><li>' + '</li><li>'.join(response_elements) + '</li></ul>'
\`

This would result in the following HTML:

\`\`\`
<ul><li>*</li><li>-</li></ul>
\`

3. **Output the formatted response.** You can use the \`console.log()\` function to output the formatted response to the console. For example, the following code would output the formatted response to the console:

\`\`\`
console.log(formatted_response)
\`

This would result in the following output:

\`
<ul><li>*</li><li>-</li></ul>
\`

Here is an example of how you can use these steps to reformat the response from code like \`* - \` to a more readable format in JavaScript:

\`\`\`
const response = '* - ';

// Split the response into individual elements.
const response_elements = response.split(' ');

// Create a new string with the desired formatting.
const formatted_response = '<ul><li>' + response_elements.join('</li><li>') + '</li></ul>';

// Output the formatted response.
console.log(formatted_response);
\`

Output:

\`
<ul><li>*</li><li>-</li></ul>
\``;

// Split the response into individual lines to process each line separately
        const lines = response.split('\n');

// Initialize an array to store the formatted elements
        let formattedElements = [];

// Process each line to identify titles, paragraphs, and code blocks
        lines.forEach((line) => {
            // Check for title format "**Title**"
            const titleRegex = /\*\*(.*?)\*\*/g;
            let match;
            while ((match = titleRegex.exec(line)) !== null) {
                formattedElements.push(`<h2>${match[1]}</h2>`);
            }

            // Check for code block format "```code```"
            const codeRegex = /``(.*?)``/g;
            let codeMatch;
            while ((codeMatch = codeRegex.exec(line)) !== null) {
                formattedElements.push(`<pre><code>${codeMatch[1]}</code></pre>`);
            }

            // Check if it's not a title or code block, treat it as a paragraph
            if (!line.match(titleRegex) && !line.match(codeRegex)) {
                formattedElements.push(`<p>${line}</p>`);
            }
        });

// Join all formatted elements and output
        const formattedResponse = formattedElements.join('');
        console.log(formattedResponse);
        const formattedResponseContainer = document.getElementById('test');

        // Check if the container element exists before setting its innerHTML
        // console.log(formattedResponse)
            formattedResponseContainer.innerHTML = <p>{"formattedResponse"}</p>

        return (<div>
             <div id="test" style={{color:'white'}}>{"kkk"}</div>
        </div>)
    }

}

{this.state.response && this.state.response.match(/\*\*(.*?)\*\*/g).map((title) => (
    <h2>{title.slice(2,-2)}</h2>
))}
{this.state.response && this.state.response.split('\n\n').map((para) => (
    <p>{para}</p>
))}
{this.state.response && this.state.response.match(/`(.*?)`/g)?.map((codeBlock) => (
    <pre><code>{codeBlock.slice(3,-3)}</code></pre>
))}