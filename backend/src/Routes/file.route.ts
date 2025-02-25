import { Router } from 'express';
import { uploadFile , deleteFile, viewFiles, openFile, editFile, fileFields } from '../controller/file.controller';
import { verifyToken } from '../middleware/verifyToken';


const fileRouter = Router();  

fileRouter.get('/view', verifyToken, viewFiles );
fileRouter.get('/fields/:fileId', verifyToken, fileFields );   
fileRouter.get('/open/:fileId', verifyToken, openFile );
fileRouter.post('/upload', verifyToken, uploadFile );
fileRouter.put('/edit/:fileId', verifyToken, editFile );
fileRouter.delete('/delete/:fileId', verifyToken, deleteFile );


export default fileRouter;