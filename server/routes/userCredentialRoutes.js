const express = require('express');
const {createUser, checkIsUserExit} = require("../managers/userManager");
const router = express.Router();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_test_1234";


router.post('/createUser', async (req, res) => {
    try{
        const user = await createUser(req.body);
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie("token", token, { httpOnly: true});
        res.setHeader("Authorization", `Bearer ${token}`);
        res.status(200).send(user)
    } catch (error){
        res.status(400).send('Error while creating '+ error.message);
    }
})

router.post('/isUserLoginExit', async (req, res) => {
    try {
        await checkIsUserExit(req.body, res);
    } catch (error){
        res.status(400).send('Error : ' + error.message);
    }
})

router.get('/userLogout', async (req, res) => {
    const token = jwt.sign({ id: 'stranger_is_here' }, JWT_SECRET, { expiresIn: '1h' });
    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).send('Logout Successfully');
})

module.exports = router;