import { Router } from 'express';
import { upload } from '../middleware/multer';
import { uploadFile , deleteFile } from '../controller/file.controller';


import { verifyToken } from '../middleware/verifyToken';

const fileRouter = Router();  

fileRouter.post('/upload', verifyToken, uploadFile );
fileRouter.delete('/delete/:fileName', verifyToken, deleteFile );


export default fileRouter;