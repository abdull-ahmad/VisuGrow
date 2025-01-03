import { Router } from 'express';
import { uploadFile , deleteFile, viewFiles, openFile, editFile } from '../controller/file.controller';


import { verifyToken } from '../middleware/verifyToken';
import { file } from 'googleapis/build/src/apis/file';

const fileRouter = Router();  

fileRouter.get('/view', verifyToken, viewFiles )   
fileRouter.get('/open/:fileId', verifyToken, openFile );
fileRouter.post('/upload', verifyToken, uploadFile );
fileRouter.put('/edit/:fileName', verifyToken, editFile );
fileRouter.delete('/delete/:fileId', verifyToken, deleteFile );


export default fileRouter;