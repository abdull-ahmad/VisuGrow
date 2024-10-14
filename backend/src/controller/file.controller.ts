import { RequestHandler, Request } from "express";
import { parseFile } from "../utils/fileParser";
import fs from "fs";

import { File } from "../models/file.model";

interface CustomRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

export const uploadFile: RequestHandler = async (req: CustomRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { headers, data } = parseFile(req.file.path);

    console.log(data)

    const file = new File({
      name: req.file.originalname,
      headers: headers,
      fileData: data,
      user: req.userId,
    });


    await file.save();

    fs.unlinkSync(req.file.path);
    
    res.status(201).json({ message: "File uploaded successfully", file });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  
};