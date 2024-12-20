import { RequestHandler, Request } from "express";
import { File } from "../models/file.model";

interface CustomRequest extends Request {
  userId?: string;
}

export const uploadFile: RequestHandler = async (req: CustomRequest, res) => {
  
  try {
    const userId = req.userId;
    const { rows, columns, fileName } = req.body;

    const existingFile = await File.findOne({ name: fileName, user: userId });
    if (existingFile) {
      return res.status(400).json({ 
        message: 'A file with this name already exists' 
      });
    }
    
    const file = new File({
      name: fileName,
      user: userId,
      headers: columns, 
      fileData: rows,
  });
    await file.save();

    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  
};

export const deleteFile: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const fileName = req.params.fileName;
    const userId = req.userId;

    const file = await File.findOneAndDelete({ name: fileName, user: userId });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}