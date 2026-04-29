import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import urlRoutes from './routes/url.js';
import Url from './models/url.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,
}));
app.use(express.json());

app.use("/",urlRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log("Connected to MongoDB");

  // Ensure TTL + other indexes exist before serving requests.
  // This keeps expired links "terminated" by auto-deletion as expected.
  await Url.init();

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
})
.catch((err)=>{
  console.error("Error connecting to MongoDB:", err);
})
