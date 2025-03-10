import { uploadBufferToS3 } from "../middleware/s3Utils.js";
import SurveyResponse from "../models/SurveyResponse.js";
import axios from "axios";

// ✅ Controller to fetch images for a specific user
export const getUserImages = async (req, res) => {
  try {
    const { responseId } = req.params;

    // Find user survey response with images
    const userResponse = await SurveyResponse.findOne({ responseId });

    if (!userResponse || userResponse.work_samples.length === 0) {
      return res.status(404).json({ error: "No images found for this user" });
    }

    // Convert images to Base64 format for frontend display
    const images = userResponse.work_samples.map((image) => ({
      fileName: image.fileName,
      url: image.url,
    }));

    res.status(200).json({ images });
  } catch (error) {
    console.error("❌ Error fetching user images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Assume AWS, dotenv, and helper functions are already imported as above
// Also, SurveyResponse model is imported

export const uploadUserLogo = async (req, res) => {
  try {
    const { responseId } = req.body;
    const uploadedFile = req.file;

    if (!responseId || !uploadedFile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Process the uploaded file
    const buffer = uploadedFile.buffer;
    const contentType = uploadedFile.mimetype;
    const ext = uploadedFile.originalname.split(".").pop();
    const fileKey = `${responseId}/final_logo.${ext}`;

    // Upload to S3
    const s3Response = await uploadBufferToS3(buffer, fileKey, contentType);

    // Extract just the URL string from the S3 response object
    const publicUrl = s3Response.url;

    // Update database with the correct structure matching your schema
    const updatedResponse = await SurveyResponse.findOneAndUpdate(
      { responseId },
      {
        $set: {
          final_logo: {
            fileName: uploadedFile.originalname,
            url: publicUrl, // Now correctly storing just the string URL
            uploadedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    console.log("✅ Final logo saved:", updatedResponse.final_logo);
    return res.status(200).json({
      message: "Final logo saved successfully",
      finalLogo: updatedResponse.final_logo,
    });
  } catch (error) {
    console.error("❌ Error saving final logo:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
