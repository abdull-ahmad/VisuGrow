import { Router } from 'express';
import { login, logout, register, verifyEmail , forgotPassword , resetPassword, checkAuth  } from '../controller/auth.controller';
import { verifyToken } from '../middleware/verifyToken';

const authRouter = Router();  

authRouter.post('/register' , register);
authRouter.post('/verify-email' , verifyEmail);
authRouter.post('/login' , login);
authRouter.post('/forgot-password' , forgotPassword);
authRouter.post('/reset-password/:token' ,resetPassword);
authRouter.post('/logout' , logout);
authRouter.get('/checkAuth',verifyToken , checkAuth  )


export default authRouter;