import { RequestHandler , Request } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../models/user.model";


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

    const user = await User.findByIdAndUpdate(req.userId, { fileUri: file?.url || "" }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "File uploaded successfully", fileUri: file?.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};