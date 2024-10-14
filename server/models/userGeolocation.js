const mongoose = require('mongoose');

const userGeolocationSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt:{
        type: Date,
        default: () => new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata'})
    },
    geolocation: {
        type: Object
    }
})

const UserGeolocation = mongoose.model('UserGeolocation', userGeolocationSchema);
module.exports = UserGeolocation;
