const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    userdatas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserData' }]
})

const User = mongoose.model('User', usersSchema);

module.exports = User;