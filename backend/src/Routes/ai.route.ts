import { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken';
import { getLLMAnalysis, initializeDataAnalysis, queryData } from '../controller/ai.controller';


const aiRouter = Router();  

aiRouter.post('/analyze-chart-data', getLLMAnalysis);
aiRouter.post('/initialize-data-analysis', initializeDataAnalysis);
aiRouter.post('/query-data', queryData);


export default aiRouter;