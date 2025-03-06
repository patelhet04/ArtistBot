// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import routes from "./routes.js";
import cors from "cors"
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use our routes
app.use("/api", routes);

// Serve static files from the React build folder
app.use(express.static(join(__dirname, '../frontend/build')));

// For any request that doesn't match an API route, serve the React index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
