import express from 'express';
import connectDB from './DB/connect';
import dotenv from 'dotenv';
import router from '../src/routes/index';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api', router);

app.use('/health', (req, res) => {
  res.send('Server is running'); // Health check endpoint
});

app.listen(5000, () => {
  connectDB();
  console.log('Server is running on http://localhost:5000');
});