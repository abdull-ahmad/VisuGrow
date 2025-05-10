import express from 'express';
import authRouter from './auth.route';
import fileRouter from './file.route';
import storeRouter from './store.route';
import aiRouter from './ai.route';

const router= express.Router();

router.use('/auth', authRouter);
router.use('/file', fileRouter);
router.use('/store', storeRouter);
router.use('/ai', aiRouter);

export default router;