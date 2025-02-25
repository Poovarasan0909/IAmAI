const express = require("express");
const router = express.Router();

const ChatMessage = require('../models/chatMessageModel')
const PrivateMessage = require('../models/privateMessageModel')

router.post('/deleteSelectedGroupChats', async (req, res) => {
    try{
       const result = await ChatMessage.deleteMany({ _id: { $in: req.body}} );
        res.status(200).json({
            message: 'Selected records deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(400).send('Error while deleting '+ error.message);
    }
})

router.post('/deleteSelectedPrivateChats', async (req, res) => {
    try{
        const result = await PrivateMessage.deleteMany({_id : { $in : req.body}});
        res.status(200).json({
            message: "Select records deleted successfully",
            deletedCount: result.deletedCount
        })
    }catch (error) {
        res.status(400).send('Error while deleting '+ error.message);
    }
})

module.exports = router;