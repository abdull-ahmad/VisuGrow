import express  from 'express';
import connectDB from './DB/connect';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/index';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();

app.use (cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({limit: '50mb'}));
app.use(cookieParser());
app.use('/api', router);

app.use('/health', (req, res) => {
  res.send('Server is running'); // Health check endpoint
});

app.listen(5000, () => {
  connectDB();
  console.log('Server is running on http://localhost:5000');
});