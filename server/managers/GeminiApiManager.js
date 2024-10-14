require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require("path");

async function getResponseByPrompt(prompt, reqFile) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    if(reqFile) {
      const filePath = path.join(__dirname, '..', 'uploads', reqFile?.filename);
      const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
      const uploadResult = await fileManager.uploadFile(filePath, {
          mimeType: reqFile.mimetype,
          displayName: reqFile.originalname,
      });
      const fileUri = uploadResult.file.uri;
      const result = await model.generateContent([
          prompt, {
              fileData: {
                  fileUri,
                  mimeType: reqFile.mimetype
              },
          }]);
      return result.response.text();
    } else {
        const result = await model.generateContent([prompt]);
        return result.response.text();
    }
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

module.exports = {getResponseByPrompt, getAIResponse}