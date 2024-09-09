import { Router } from 'express';
import { upload } from '../middleware/multer';
import { uploadFile } from '../controller/file.controller';
import { verifyToken } from '../middleware/verifyToken';

const fileRouter = Router();  

fileRouter.post('/upload' , verifyToken ,upload.single('file'), uploadFile);

export default fileRouter;