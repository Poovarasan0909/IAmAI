const express = require('express');
const router = express.Router();
const {getResponseByPrompt} = require('../managers/GeminiApiManager');

router.post('/geminiAI-data', async (req, res) => {
    try {
     const response =  await getResponseByPrompt(req.body.prompt);
     res.json({res: response})
    } catch (error) {
        console.log(error.message)
    }
})

module.exports = router;