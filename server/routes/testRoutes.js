const express = require('express');
const router = express.Router();
const Test = require('../models/testModels');
const users = require('../models/usersModel');
const {createUser, createUserData, deleteUserDataById, deleteUserById, checkIsUserExit, getUserDataByUserId, storeIpData, getAllPublicChatMessage} = require('../managers/userManager');
const multer = require("multer");
const fs = require("fs");
const UserData = require('../models/userDataModel');
const ChatMessage = require('../models/chatMessageModel')
const PrivateChatMessage = require('../models/privateMessageModel')

router.get('/createModule', async (req, res) => {
    try{
        const tests = await users.find();
        console.log(tests[0])
        res.status(200).json(tests);
    } catch (error) {
        res.status(400).send('Error fetching '+ error.message);
    }
})


// const upload = multer({ dest: 'uploads/'});
//
// router.post('/createUserData', upload.single('image'), async (req, res) => {
//     let imageBase64 = null;
//     if(req.file) {
//         const imageBuffer = fs.readFileSync(req.file.path);
//         imageBase64 = imageBuffer.toString('base64');
//     }
//     try {
//       await createUserData(req.body, imageBase64).then(() => {
//         console.log("response After createUserData");
//       })
//         res.status(200).json({body: req.body, image: imageBase64});
//     } catch (error) {
//         res.status(400).send('Error while creating user data '+ error.message);
//     }
// })

router.post('/createUserData', async (req, res) => {
         try{
           const body = req.body
           const userData = await createUserData(body);
           res.status(200).send(userData);
         } catch (error) {
            console.log('Error While creating history: ', error.message)
         }
})

router.delete('/deleteUser/:id', async (req, res) => {
    try {
       await deleteUserById(req.params.id);
       res.status(200).send(`User with ID ${req.params.id} deleted successfully.`)
    } catch (error) {
        res.status(400).send(`Error while deleting user: ${error.message}`);
    }
});

router.delete('/deleteUserData/:id', async (req, res) => {
    try{
        await deleteUserDataById(req.params.id);
        res.status(200).send(`User with ID ${req.params.id} deleted successfully.`)
    } catch (error) {
        res.status(400).send(`Error while deleting userData: ${error.message}`);
    }
})


router.get('/getUserDataById/:id', async (req, res) => {
    try {
        res.status(200).send(await getUserDataByUserId(req.params.id))
    } catch(error) {
        res.status(400).send('Error : '+ error.message)
    }
})

router.post('/saveGeolocation', async (req, res) => {
    try{
        storeIpData(req.body);
    } catch(error) {
      console.error(error.message);
    }
})

router.delete('/deleteAllUserData', async  (req, res) => {
    const result = await UserData.deleteMany({});
    res.status(200).json({
        message: 'All records deleted successfully',
        deletedCount: result.deletedCount
    });
})

router.get('/fetchAllPublicChatMessage', async (req, res) => {
    try {
        res.status(200).send(await getAllPublicChatMessage());
    } catch (error) {
        res.status(400).send('Error : '+ error.message)
    }
})

router.post('/fetchPrivateChatMessages', async (req, res) => {
    try {
        res.status(200).send(await PrivateChatMessage.find({
            $or: [
                {senderId: req.body.senderId, receiverId: req.body.receiverId},
                {senderId: req.body.receiverId, receiverId: req.body.senderId}
      ]}).sort({ timeStamp: 1 }));
    } catch (error) {
        res.status(400).send('Error : '+ error.message)
    }
})

router.delete('/deleteClearChatMessages', async (req, res) => {
    const result = await ChatMessage.deleteMany({})
    res.status(200).json({
        message: 'All records deleted successfully',
        deletedCount: result.deletedCount
    });
})
router.delete('/deleteAllPrivateChatMessages', async (req, res) => {
    const result = await PrivateChatMessage.deleteMany({});
    res.status(200).json({
        message: 'All records deleted successfully',
        deletedCount: result.deletedCount
    })
})

module.exports = router;