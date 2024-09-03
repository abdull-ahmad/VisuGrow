import jwt from 'jsonwebtoken';

export const generateToken = (res:any , userId:any) => {
    if(!process.env.JWT_SECRET){
        throw new Error("JWT_SECRET is missing");
    }
    
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn:"7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return token;
};
