import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "artist_bot_survey";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // ✅ Fix: Added space after "Bearer"
    return res
      .status(403)
      .json({ error: "Unauthorized request: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, SECRET_KEY); // Validate the JWT token
    next();
  } catch (error) {
    console.error("Invalid JWT Token:", error);
    return res
      .status(403)
      .json({ error: "Unauthorized request: Invalid token" });
  }
};

// Export using ES6 syntax
export default verifyToken;
