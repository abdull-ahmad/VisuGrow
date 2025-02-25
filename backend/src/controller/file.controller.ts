import { RequestHandler, Request } from "express";
import { File } from "../models/file.model";

interface CustomRequest extends Request {
  userId?: string;
}

export const uploadFile: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const userId = req.userId;
    const { rows, columns, fileName } = req.body;

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

export const openFile: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const userId = req.userId;
    const fileid = req.params.fileId;
    const file = await File.findOne({ _id: fileid, user: userId });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(200).json({ file });
  } catch (error) {
    console.error('Error opening file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

}

export const viewFiles: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const userId = req.userId;
    const files = await File.find({ user: userId });
    res.status(200).json({ files: files.map((file) => ({ _id: file._id, name: file.name, createdAt: file.createdAt })) });
  } catch (error) {
    console.error('Error viewing files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const fileFields: RequestHandler = async (req: CustomRequest, res) => {

  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      user: req.userId
    }).select('headers fileData');

    if (!file) return res.status(404).json({ message: 'File not found' });

    res.json({
      fields: file.headers.map(h => ({
        name: h.title,
        type: h.type
      })), 
      fileData: file.fileData
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const deleteFile: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.userId;

    const file = await File.findOneAndDelete({ _id: fileId, user: userId });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const editFile: RequestHandler = async (req: CustomRequest, res) => {
  try {
    const userId = req.userId;
    const fileId = req.params.fileId;
    const { rows } = req.body;

    const file = await File.findOne({ _id: fileId, user: userId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    await file.updateOne({ fileData: rows });

    res.status(200).json({ message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}