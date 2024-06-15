import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import dbConnect from './config/dbConnection.js';
import productsRouter from './routes/productsRoutes.js';
import adminsRouter from './routes/adminsRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';

dotenv.config();
dbConnect();

const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/admins', adminsRouter);

app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
