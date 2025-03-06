import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "artist_bot_survey";

const token = jwt.sign(
    { user: "qualtrics" }, // Payload
    SECRET_KEY, 
    { expiresIn: "365d" } // Token expiry time
);

console.log("Generated JWT Token:", token);