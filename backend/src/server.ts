import express from 'express';
import connectDB from './DB/connect';
import dotenv from 'dotenv';
import router from '../src/routes/index';

dotenv.config();

const app = express();

app.use('/api', router);

app.use('/health', (req, res) => {
  res.send('Server is running'); // Health check endpoint
});

app.listen(3000, () => {
  connectDB();
  console.log('Server is running on http://localhost:3000');
});