import { RequestHandler, Request } from "express";
import { File } from "../models/file.model";

interface CustomRequest extends Request {
  userId?: string;
}

export const uploadFile: RequestHandler = async (req: CustomRequest, res) => {
  
  try {
    const userId = req.userId;
    const { rows, columns, fileName } = req.body;

    console.log('userId:', userId);
    console.log('columns:', columns);
    console.log('rows:', rows);

    
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