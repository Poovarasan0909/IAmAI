const express = require('express');
const router = express.Router();
const {getResponseByPrompt, getAIResponse, getResponse} = require('../managers/GeminiApiManager');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const uploadsDir = path.join(__dirname,'..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
    dest: uploadsDir,
    limits: {
        fieldSize: 10 * 1024 * 1024,
        fileSize: 50 * 1024 * 1024,
    },
});

router.post('/gemini-AI-response', upload.single('chunk'), async (req, res) => {
    const { chunkIndex, totalChunks, fileName, prompt } = req.body;
    console.log('reqFile:', fileName);
    try {
        if(fileName) {
            const chunkPath = path.join(uploadsDir, fileName);
            const tempFilePath = req.file.path;
            const tempFileData = fs.readFileSync(tempFilePath);
            fs.appendFileSync(chunkPath, tempFileData);
            fs.unlinkSync(tempFilePath);

            if (parseInt(chunkIndex, 10) + 1 === parseInt(totalChunks, 10)) { // checking is final chunk
                const fileMimeType = mime.lookup(fileName) || 'application/octet-stream';
                const reqFile = {
                    filename: fileName,
                    mimetype: fileMimeType,
                    originalname: req.file.originalname,
                };
                const response = await getResponseByPrompt(prompt, reqFile);
                res.json({res: response, isFinal: true});

                fs.unlink(chunkPath, (err) => {
                    if (err) {
                        console.error(`Error deleting file ${chunkPath}:`, err.message);
                    }
                });
            } else {
                res.json({message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`, isFinal: false});
            }
        } else {
            const response = await getResponseByPrompt(prompt);
            res.json({res: response, isFinal: true});
        }
    } catch (error) {
        console.error('Error handling chunk upload:', error);
        res.status(500).json({ message: 'Error uploading chunk', error: error.message });
    }
})

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