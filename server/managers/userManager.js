const User = require('../models/usersModel');
const UserData = require('../models/userDataModel');
const UserGeolocation = require('../models/userGeolocation');
const mongoose = require('mongoose');
const {uploadFile, deleteImage} = require("../service/cloudinaryAPIs");
const axios = require("axios");


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
          let userData;
          const userId = new mongoose.Types.ObjectId(body.userId);
          await processChatHistory(body);

          if(!body.id) {
              userData = new UserData({
                  userId: userId,
                  historyLabel: body.historyLabel,
                  chatHistory: body.chatHistory
              })
              await userData.save();
              await User.findByIdAndUpdate(userId, {
                  $push: { userdatas: userData._id }
              });
          } else {
             const _id = new mongoose.Types.ObjectId(body.id);
              userData = await UserData.findByIdAndUpdate(
                  _id,
                  {
                      chatHistory: body.chatHistory,
                      historyLabel: body.historyLabel
                  },
                  {new: true}
              );
          }
          console.log('User Data Updated.');
          return userData
      } catch(error) {
          console.error('Error fetching user with data:', error);
      }
}
async function deleteUserDataById(userDataId) {
   try {
      const result = await UserData.findByIdAndDelete(userDataId);
      if (result) {
           console.log(`UserData with ID ${userDataId} deleted successfully.`);
           const publicIds = result.chatHistory.filter(item => item.role === "user" && item.parts?.image)
               .map(item => item.parts.image.split('/').slice(-1)[0].split('.')[0]);
           if(publicIds.length > 0) {
               await deleteImage(publicIds);
           }
      }
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
    const userData = await UserData.find({userId: userId}).sort({ updatedAt: -1 });
    return userData
}

async function storeIpData(body) {
    try {
        const userId = body.userId ? new mongoose.Types.ObjectId(body.userId) : null
        const value = await UserGeolocation.findOne({userId: userId});

        if(userId && value) {
            await UserGeolocation.findOneAndUpdate({userId: userId}, {
                $set:{
                    createdAt: new Date(),
                    geolocation: body.geolocation,
                    userId: userId
                }
            }, {
                new: true,
                upsert: true
            })
        } else {
            const userGeoLocation = new UserGeolocation({
                geolocation: body.geolocation,
                userId: userId
            })
            await userGeoLocation.save();
        }

    } catch (e) {
        console.error("!Error while Geolocation Storing", e)
    }
}


async function processChatHistory(body) {
    try {
        for (const item of body.chatHistory) {
            if (item.role === 'user' && item.parts?.image) {
                try {
                    const uploadedFileLink = await uploadFile(item.parts.image);
                    if (uploadedFileLink) {
                        item.parts.image = uploadedFileLink;
                    } else {
                        item.parts.image = null;
                        console.error(`Failed to upload image for item: ${item.id}`);
                    }
                } catch (error) {
                    console.error(`Error uploading image for item: ${item.id}`, error);
                    item.parts.image = null;
                }
            }
        }
    } catch (error) {
        console.error("Error processing chat history:", error);
    }
}
module.exports = {createUser,
                  createUserData,
                  deleteUserById,
                  deleteUserDataById,
                   getUserDataByUserId,
                  checkIsUserExit,
                  storeIpData};