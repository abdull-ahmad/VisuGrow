import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';

// Extend the Request interface to include userId
interface CustomRequest extends Request {
  userId?: string;
}

export const verifyToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Token not found" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as { userId: string };
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid Token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};