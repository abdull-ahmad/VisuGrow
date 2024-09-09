import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath:string) => {
  try {
      if (!localFilePath) return null
      
      const response = await cloudinary.uploader.upload( localFilePath, {
          resource_type: "auto"
      })
      fs.unlinkSync(localFilePath)
      return response;
      
  } catch (error) {
      console.log("Error while uploading file on cloudinary", error);
      fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
      return null;
  }
}

const deleteFromCloudinary = async (originalUrl:string) => {
  try{
    const result = await cloudinary.uploader.destroy(originalUrl);
    console.log("file is deleted from cloudinary", result);
  }catch(error){
    console.log("Error while deleting file from cloudinary", error);
    return null;
  }
}



export {uploadOnCloudinary , deleteFromCloudinary}

