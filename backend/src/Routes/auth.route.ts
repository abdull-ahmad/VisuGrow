import { Router } from 'express';
import { login, logout, register } from '../controller/auth.controller';

const authRouter = Router();  

authRouter.post('/register' , register);
authRouter.post('/login' , login);
authRouter.post('/logout' , logout);
export default authRouter;