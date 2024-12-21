import { Router } from 'express';
import { uploadFile , deleteFile, viewFiles, openFile } from '../controller/file.controller';


import { verifyToken } from '../middleware/verifyToken';

const fileRouter = Router();  

fileRouter.get('/view', verifyToken, viewFiles )   
fileRouter.get('/open/:fileName', verifyToken, openFile );
fileRouter.post('/upload', verifyToken, uploadFile );
fileRouter.delete('/delete/:fileName', verifyToken, deleteFile );


export default fileRouter;