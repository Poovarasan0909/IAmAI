const express = require('express');
const router = express.Router();
const Test = require('../models/testModels');
const users = require('../models/usersModel');
const {createUser, createUserData, deleteUserDataById, deleteUserById, checkIsUserExit, getUserDataByUserId, storeIpData} = require('../managers/userManager');
const multer = require("multer");
const fs = require("fs");
const UserData = require('../models/userDataModel');

router.get('/createModule', async (req, res) => {
    try{
        const tests = await users.find();
        console.log(tests[0])
        res.status(200).json(tests);
    } catch (error) {
        res.status(400).send('Error fetching '+ error.message);
    }
})

router.post('/createUser', async (req, res) => {
    try{
        console.log(req,req.body, " - request....")
        res.status(200).send(await createUser(req.body))
    } catch (error){
        res.status(400).send('Error while creating '+ error.message);
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
           console.log(userData);
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

router.post('/isUserLoginExit', async (req, res) => {
    try {
        res.status(200).send(await checkIsUserExit(req.body));
    } catch (error){
        res.status(400).send('Error : ' + error.message);
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
module.exports = router;