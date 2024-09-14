import { RequestHandler, Request } from "express";
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary";
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

    const newFileEntry = {
      fileUri: file?.url || "",
      publicId: file?.public_id || "",
    };

    if (fileData) {
      // Append the new file URI to the existing file URIs
      fileData.files.push(newFileEntry);
      
    } else {
      // Create a new file entry
      fileData = new File({ files: [newFileEntry], user: req.userId });
    }

    await fileData.save();

    res.status(200).json({ success: true, message: "File uploaded successfully", fileUri: file?.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteFile: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ success: false, message: "No public ID provided" });
    }
    // Find the file entry in the database
    const fileData = await File.findOne({ user: req.userId, 'files.publicId': publicId });

    if (!fileData) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    // Get the file entry to delete
    const fileEntry = fileData.files.find(file => file.publicId === publicId);
    
    if (!fileEntry) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Delete the file from Cloudinary
    try {
      await deleteFromCloudinary(publicId);
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error deleting file from Cloudinary" });
    }

    // Remove the file entry from the user's files array
    fileData.files.pull({ _id: fileEntry._id });
    await fileData.save();

    res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Internal server error", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};