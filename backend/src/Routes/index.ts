import express from 'express';
import authRouter from './auth.route';
import fileRouter from './file.route';
import storeRouter from './store.route';

const router= express.Router();

router.use('/auth', authRouter);
router.use('/file', fileRouter);
router.use('/store', storeRouter);

export default router;