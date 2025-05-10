import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { getLLMAnalysis } from '../controller/ai.controller';


const aiRouter = Router();  

aiRouter.post('/analyze-chart-data' , getLLMAnalysis);


export default aiRouter;