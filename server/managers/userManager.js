const User = require('../models/usersModel');
const UserData = require('../models/userDataModel');
const mongoose = require('mongoose');

async function createUser(body) {
    try {
     const newUser = new User({
         username: body.userName,
         email: body.userEmail,
         password: body.userPassword
     });
     await newUser.save();
     console.log("User created -> Email:", body.userEmail," Password: ",body.userPassword);
     return newUser
    } catch (error){
      console.error(error.message);
    }
}

async function createUserData(body) {
      try {
          const user = await User.findById(body.userId).populate('userdatas');
          const userId = new mongoose.Types.ObjectId(body.userId);
          const user1 = await User.findById(userId);
          console.log(user);
          console.log(user1);
          const userData = new UserData({
              userId: userId,
              prompt: body.prompt,
              response: body.response
          })
          await userData.save();

          await User.findByIdAndUpdate(userId, {
              $push: { userdatas: userData._id }
          });
          console.log('User Data Updated.');
      } catch(error) {
          console.error('Error fetching user with data:', error);
      }
}
async function deleteUserDataById(userDataId) {
   try{
      const result = await UserData.findByIdAndDelete(userDataId);
      if(result) {
          console.log(`UserData with ID ${userDataId} deleted successfully.`);
      } else {
          console.log(`UserData with ID ${userDataId} not found.`);
      }
   } catch (error) {
         console.error('Error in delete userData: ' + error.message)
   }
}
async function deleteUserById(userId) {
    try {
        await UserData.deleteMany({userId: new mongoose.Types.ObjectId(userId)});
        const result = await User.findByIdAndDelete(userId);
        if(result) {
            console.log(`User with ID ${userId} deleted successfully.`)
        } else {
            console.log(`User with ID ${userId} not found.`)
        }
    } catch (error) {
        console.error('Error in delete user by id' + error.message);
    }
}

async function getAllUsers() {
    try{
       return User.find();
    } catch (error) {
        console.error('Error while fetching all users : ' + error.message)
    }
}
async function checkIsUserExit(data) {
   const users = await getAllUsers();
    for(const user of users) {
        if(user.email === data.userEmail && user.password === data.userPassword) {
            return user;
        }
    }
    return null;
}

async function getUserDataByUserId(id) {
    const userId = new mongoose.Types.ObjectId(id);
    const userData = await UserData.find({userId: userId});
    return userData
}
module.exports = {createUser,
                  createUserData,
                  deleteUserById,
                  deleteUserDataById,
                   getUserDataByUserId,
                  checkIsUserExit};