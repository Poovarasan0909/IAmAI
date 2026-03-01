require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const  { GoogleGenAI } = require("@google/genai")
const path = require("path");

async function getResponseByPrompt(prompt, reqFile) {
     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    if(reqFile) {
      const filePath = path.join(__dirname, '..', 'uploads', reqFile?.filename);
      const uploadedFile = await ai.files.upload({
        file: filePath,
        config: {
          mimeType: reqFile.mimetype,
          displayName: reqFile.originalname,
        }
      })
      const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            fileData: {
                                fileUri: uploadedFile.uri,
                                mimeType: uploadedFile.mimeType
                            }
                        }
                    ]
                }
            ]
        });
      return response.text;
    } else {
        const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });
        return response.text;
    }
}

async function getResponse (prompt, reqFile) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    const chat = model.startChat({history: chatHistory});
    let result = await chat.sendMessage(prompt);
    return result.response.text();
}

async function getAIResponse(prompt, sendStatus) {
//   sendStatus("Initializing GoogleGenerativeAI...")
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//
//   sendStatus("Fetching generative model...");
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//
//   sendStatus("Sending your prompt to API🤖...");
//   const result = await model.generateContent(prompt);
//
//   sendStatus("Received response from API..");
//   const textResponse = result.response.text();
//
//   sendStatus("Processing API response...");
//   return textResponse
}

module.exports = {getResponseByPrompt, getAIResponse, getResponse}