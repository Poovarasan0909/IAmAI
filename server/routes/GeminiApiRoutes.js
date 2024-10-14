const express = require('express');
const router = express.Router();
const {getResponseByPrompt, getAIResponse} = require('../managers/GeminiApiManager');
const multer = require('multer');

const upload = multer({ dest: 'uploads/'});

router.post('/geminiAI-data', upload.single('image'), async (req, res) => {
    try {
        const prompt = req.body.prompt;
        if (!prompt) {
            return res.status(400).json({message: 'Prompt is required'});
        }
        const response = await getResponseByPrompt(req.body.prompt, req.file);
        res.json({res: response})
    } catch (error) {
        console.log(error.message);
        return error.message;
    }
})

router.post('/createUserData', )

// router.get('/geminiAI-data', async  (req, res) => {
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//
//     const sendStatus = (status) => {
//         res.write(`data: ${JSON.stringify({status})}\n\n`);
//     }
//     try {
//        const response = await getAIResponse(req.query.prompt, sendStatus);
//        const res1 = {data : {res: {response}}}
//        res.write(`data: ${JSON.stringify({ res: response })}\n\n`);
//        // console.log(`data: ${JSON.stringify({ res: response })}\n\n`);
//     } catch (error) {
//        res.write(`data: {"error": "${error.message}"}\n\n`)
//     } finally {
//         res.end();
//     }
// })

module.exports = router;