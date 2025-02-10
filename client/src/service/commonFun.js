
export function calculateLines(textarea) {
    const style = window.getComputedStyle(textarea);
    const fontSize = parseFloat(style.fontSize);
    const fontFamily = style.fontFamily;

    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.whiteSpace = 'pre';
    span.style.fontSize = fontSize + 'px';
    span.style.fontFamily = fontFamily;
    document.body.appendChild(span);

    // Calculate the width of a character
    span.textContent = 'A';
    const charWidth = span.getBoundingClientRect().width;

    // Calculate the width of the textarea
    const textareaWidth = textarea.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

    // Calculate the number of characters per line
    const charsPerLine = Math.floor(textareaWidth / charWidth);

    // Calculate the number of lines
    const text = textarea.value;
    const lines = text.split('\n').reduce((acc, line) => {
        return acc + Math.ceil(line.length / charsPerLine);
    }, 0);
    document.body.removeChild(span);
    return lines;
}

export const adjustTextareaHeight = (scrollHeight, setTextareaHeight, element_Id) => {
    setTextareaHeight('4.5rem');
    const prompt_inputs = document.getElementById(element_Id);
    if (scrollHeight) {
        setTextareaHeight(`${scrollHeight}px`);
        if(prompt_inputs)
            prompt_inputs.style.borderRadius = '10px'
    } else {
        if(prompt_inputs)
            prompt_inputs.style.borderRadius = '10px'
    }
};