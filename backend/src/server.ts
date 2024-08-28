import express from 'express';
import connectDB from './DB/connect';
import dotenv from 'dotenv';

dotenv.config();

const app = express();



app.listen(3000, () => {
  connectDB();
  console.log('Server is running on http://localhost:3000');
});