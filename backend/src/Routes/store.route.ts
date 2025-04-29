import { Router } from "express";
import { addStore, validateEndpoint , getStores , deleteStore , getStoreData  } from "../controller/store.controller";
import { verifyToken } from '../middleware/verifyToken';

const storeRouter = Router();

storeRouter.get('/', verifyToken, getStores);
storeRouter.get('/data/:storeId', verifyToken, getStoreData);
storeRouter.post('/validate', verifyToken, validateEndpoint);
storeRouter.post('/add', verifyToken, addStore);
storeRouter.delete('/delete/:storeId', verifyToken, deleteStore);

export default storeRouter;