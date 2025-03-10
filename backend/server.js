// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import routes from "./routes.js";
import cors from "cors"
dotenv.config();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? false // In production, Nginx handles this
    : 'http://localhost:3000', // During development
  credentials: true
};

const app = express();
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use our routes
app.use("/api", routes);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
