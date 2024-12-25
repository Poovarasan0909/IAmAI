const cloudinary = require('cloudinary').v2;

require('dotenv').config();
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadFile = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, { resource_type: "image" });
        return result.secure_url;
    } catch (error) {
        console.error("Error during uploadFile:", error.message);
        return null;
    }
}

module.exports = { uploadFile }