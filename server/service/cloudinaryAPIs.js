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

const deleteImage = async (publicIds) => {
    try {
        cloudinary.api.delete_resources(publicIds)
            .then(result => console.log("Image deleted successfully", result))
            .catch(error => console.error("Error during deleteImage:", error.message));
    } catch (error) {
        console.error("During Delete image => ", error);
    }
}

module.exports = { uploadFile, deleteImage }