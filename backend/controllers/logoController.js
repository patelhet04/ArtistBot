// controllers/logoController.js
import axios from "axios";
import SurveyResponse from "../models/SurveyResponse.js";
import {
  uploadBufferToS3,
  getPublicUrlFromS3Uri,
} from "../middleware/s3Utils.js";
import fileType from "file-type";

/**
 * Handles the upload of a user's final logo selection
 * Supports both direct file uploads and URLs from generated logos
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadFinalLogo = async (req, res) => {
  try {
    console.log("📥 Received final logo upload request");
    const { responseId } = req.body;

    if (!responseId) {
      return res.status(400).json({ error: "Missing responseId parameter" });
    }

    // Find the user's survey response to ensure they exist
    const surveyResponse = await SurveyResponse.findOne({ responseId });
    if (!surveyResponse) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`👤 Processing final logo for user: ${responseId}`);

    let imageBuffer, contentType, fileExtension;

    // CASE 1: Logo file was uploaded directly (multipart form data)
    if (req.file) {
      console.log("📁 Processing uploaded file");
      imageBuffer = req.file.buffer;
      contentType = req.file.mimetype;

      // Try to get a more accurate file extension from the actual file content
      try {
        const detectedType = await fileType.fromBuffer(imageBuffer);
        if (detectedType) {
          fileExtension = detectedType.ext;
          // Update content type if we detected a different one
          contentType = detectedType.mime;
        } else {
          // Fall back to extension from mimetype
          fileExtension = contentType.split("/").pop();
        }
      } catch (error) {
        console.error("Error detecting file type:", error);
        fileExtension = contentType.split("/").pop();
      }
    }
    // CASE 2: Logo URL was provided (from DALL-E or other source)
    else if (req.body.logoUrl) {
      console.log(
        "🔗 Processing logo from URL:",
        req.body.logoUrl.substring(0, 50) + "..."
      );

      try {
        // Download the image from the provided URL
        const response = await axios.get(req.body.logoUrl, {
          responseType: "arraybuffer",
          timeout: 10000, // 10 second timeout
        });

        imageBuffer = Buffer.from(response.data);
        contentType = response.headers["content-type"];

        // Try to determine file extension from URL and content-type
        if (req.body.logoUrl.includes(".")) {
          // Try to extract extension from URL
          const urlParts = req.body.logoUrl.split(".");
          const possibleExt = urlParts[urlParts.length - 1]
            .split("?")[0]
            .toLowerCase();

          // Check if it's a valid image extension
          if (
            ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(possibleExt)
          ) {
            fileExtension = possibleExt;
          } else {
            // Fall back to content type extension
            fileExtension = contentType.split("/").pop();
          }
        } else {
          // No extension in URL, use content type
          fileExtension = contentType.split("/").pop();
        }

        // Normalize jpeg extension
        if (fileExtension === "jpeg") fileExtension = "jpg";
      } catch (error) {
        console.error("Error downloading image from URL:", error);
        return res.status(400).json({
          error: "Failed to download image from provided URL",
          details: error.message,
        });
      }
    } else {
      return res.status(400).json({ error: "No logo file or URL provided" });
    }

    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const filename = `final_logo_${timestamp}.${fileExtension}`;

    // Construct the S3 key using the responseId as folder name
    const s3Key = `${responseId}/${filename}`;

    console.log(`📤 Uploading to S3: ${s3Key} (${contentType})`);

    // Upload to S3 and get both S3 URI and public URL
    // Note: We're now using public-read ACL by default
    const { s3Uri, url: publicUrl } = await uploadBufferToS3(
      imageBuffer,
      s3Key,
      contentType,
      "public-read",
      true
    );

    console.log(`✅ Successfully uploaded to S3: ${s3Uri}`);
    console.log(`🔗 Public URL: ${publicUrl}`);

    // Update the user's survey response in MongoDB
    const updatedResponse = await SurveyResponse.findOneAndUpdate(
      { responseId },
      {
        $set: {
          final_logo: {
            fileName: filename,
            url: publicUrl,      // Public URL that doesn't expire
            s3Uri: s3Uri,        // Permanent S3 URI for internal reference
            uploadedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    console.log("✅ Final logo saved to database");

    // Return success response with the updated document
    return res.status(200).json({
      success: true,
      message: "Final logo uploaded successfully",
      finalLogo: {
        fileName: updatedResponse.final_logo.fileName,
        url: updatedResponse.final_logo.url,
        uploadedAt: updatedResponse.final_logo.uploadedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in uploadFinalLogo:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload final logo",
      error:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

/**
 * Retrieves a user's final logo information
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getFinalLogo = async (req, res) => {
  try {
    const { responseId } = req.params;

    if (!responseId) {
      return res.status(400).json({ error: "Missing responseId parameter" });
    }

    const surveyResponse = await SurveyResponse.findOne({ responseId });

    if (!surveyResponse) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!surveyResponse.final_logo || !surveyResponse.final_logo.s3Uri) {
      return res
        .status(404)
        .json({ error: "No final logo found for this user" });
    }

    // With public access, we no longer need to refresh URLs
    // But we'll ensure a valid URL exists in case of older records
    let finalLogoUrl = surveyResponse.final_logo.url;

    // For backward compatibility with older records that might not have a valid public URL
    if (!finalLogoUrl || finalLogoUrl.includes('Expires=')) {
      // Generate a public URL from the S3 URI
      finalLogoUrl = getPublicUrlFromS3Uri(surveyResponse.final_logo.s3Uri);

      // Update the URL in the database to the permanent public URL
      surveyResponse.final_logo.url = finalLogoUrl;
      await surveyResponse.save();

      console.log(`🔄 Updated to public URL for ${responseId}'s final logo`);
    }

    return res.status(200).json({
      success: true,
      finalLogo: {
        fileName: surveyResponse.final_logo.fileName,
        url: finalLogoUrl,
        uploadedAt: surveyResponse.final_logo.uploadedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in getFinalLogo:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  uploadFinalLogo,
  getFinalLogo,
};