import { RequestHandler, Request } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { File } from "../models/file.model";

interface CustomRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

export const uploadFile: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const localFilePath = req.file?.path;

    if (!localFilePath) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    let file;

    try {
      file = await uploadOnCloudinary(localFilePath);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Something went wrong during file upload" });
    }

    let fileData = await File.findOne({ user: req.userId });

    if (fileData) {
      // Append the new file URI to the existing file URIs
      fileData.fileUri.push(file?.url || "");
    } else {
      // Create a new file entry
      fileData = new File({ fileUri: [file?.url], user: req.userId });
    }

    await fileData.save();

    res.status(200).json({ success: true, message: "File uploaded successfully", fileUri: file?.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteFile: RequestHandler = async (req: CustomRequest, res) => {

};