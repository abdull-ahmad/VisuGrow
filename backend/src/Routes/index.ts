import express from 'express';
import authRouter from './auth.route';
import fileRouter from './file.route';


const router= express.Router();

router.use('/auth', authRouter);
router.use('/file', fileRouter);

export default router;