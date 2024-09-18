require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function getResponseByPrompt(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  return result.response.text();
}

module.exports = {getResponseByPrompt}