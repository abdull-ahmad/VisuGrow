import { RequestHandler } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";

export const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const userAlreadyExists = await User.findOne({
      email,
    });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();
    generateToken(res, user._id);

    res.status(201).json({ success: true, message: "User created" , user:{
        ...user.toObject(),
        password:undefined,
    }});
  } catch (error) {
    res.status(400).json({ success: false, message: "Something went wrong" });
  }
};

export const login: RequestHandler = async (req, res) => {};

export const logout: RequestHandler = async (req, res) => {};
