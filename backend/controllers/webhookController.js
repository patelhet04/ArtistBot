import axios from "axios";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import SurveyResponse from "../models/SurveyResponse.js";
// import { getBalancedPersonalizedCondition } from "../services/conditionAssignmentService.js";
import { CONDITIONS } from "../constants/conditionConstants.js";

dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

// /**
//  * Generate a unique user ID
//  * @returns {string} Generated user ID in format U_XXXXXXXXX
//  */
// function generateCustomUserId() {
//   const randomPart = Math.floor(100000000 + Math.random() * 900000000);
//   return `U_${randomPart}`;
// }

/**
 * Determine file extension based on URL and content-type
 * @param {string} url - URL of the file
 * @param {string} contentType - Content-Type header
 * @returns {string} File extension without leading dot
 */
function getExtension(url, contentType) {
  let ext = url.split(".").pop().split("?")[0];
  console.log("Extracted extension:", ext);

  // If extension is "php" or not one of the common image extensions, infer from contentType
  if (
    !ext ||
    ext.toLowerCase() === "php" ||
    !["jpg", "jpeg", "png", "gif", "webp"].includes(ext.toLowerCase())
  ) {
    if (contentType.includes("jpeg")) ext = "jpg";
    else if (contentType.includes("png")) ext = "png";
    else if (contentType.includes("gif")) ext = "gif";
    else if (contentType.includes("webp")) ext = "webp";
    else ext = "bin";
  }
  return ext;
}

/**
 * Upload an image buffer to S3 with public access
 * @param {Buffer} buffer - Image data buffer
 * @param {string} fileKey - S3 object key
 * @param {string} contentType - Content-Type of the file
 * @returns {Object} Object containing s3Uri and public url
 */
async function uploadImageToS3(buffer, fileKey, contentType) {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error(
      "Missing required key 'S3_BUCKET_NAME' in environment variables"
    );
  }

  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "max-age=31536000", // Cache for 1 year (for efficiency)
  };

  try {
    // Upload the file to S3
    const uploadResult = await s3.upload(uploadParams).promise();

    // Get the public URL
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // Create S3 URI for internal reference
    const s3Uri = `s3://${bucketName}/${fileKey}`;

    console.log(`✅ File uploaded successfully with public access`);
    console.log(`🔗 Public URL: ${publicUrl}`);

    return {
      s3Uri,
      url: publicUrl,
    };
  } catch (error) {
    console.error(`❌ S3 Upload Error for ${fileKey}:`, error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
}

/**
 * Handle webhook requests from Qualtrics
 * Process survey responses and work samples
 */
export const handleWebhook = async (req, res) => {
  try {
    console.log("📥 Received Webhook Data:", req.body);

    const {
      responseId,
      artist_experience,
      work_sample_1,
      work_sample_2,
      work_sample_3,
    } = req.body;

    if (
      !responseId ||
      !artist_experience ||
      !work_sample_1 ||
      !work_sample_2 ||
      !work_sample_3
    ) {
      console.error("❌ Missing Fields in Request:", req.body);
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Process images
    const imageURLs = [work_sample_1, work_sample_2, work_sample_3];

    const work_samples = await Promise.all(
      imageURLs.map(async (url, index) => {
        try {
          const urlObj = new URL(url);
          const fileId = urlObj.searchParams.get("F");
          if (!fileId) throw new Error("File ID not found in URL");

          const qualtricsApiUrl = `https://${process.env.QUALTRICS_DATACENTER}.qualtrics.com/API/v3/surveys/${process.env.QUALTRICS_SURVEY_ID}/responses/${responseId}/uploaded-files/${fileId}`;

          const apiResponse = await axios.get(qualtricsApiUrl, {
            responseType: "arraybuffer",
            headers: { "X-API-TOKEN": process.env.QUALTRICS_API_TOKEN },
          });

          const buffer = Buffer.from(apiResponse.data);
          const contentType = apiResponse.headers["content-type"];
          const ext = getExtension(url, contentType);
          const fileKey = `${responseId}/work_sample_${index + 1}.${ext}`;

          const { s3Uri, url: publicUrl } = await uploadImageToS3(
            buffer,
            fileKey,
            contentType
          );

          return {
            fileName: `work_sample_${index + 1}.${ext}`,
            url: publicUrl,
            s3Uri,
            uploadedAt: new Date(),
          };
        } catch (error) {
          console.error(
            `❌ Error processing image ${index + 1}:`,
            error.message
          );
          return null;
        }
      })
    );

    // Filter out failed images
    const validWorkSamples = work_samples.filter((sample) => sample !== null);

    if (validWorkSamples.length === 0) {
      console.error("❌ Failed to process any work samples");
      return res.status(500).json({ error: "Failed to process work samples" });
    }

    // Save the response in the database
    const newResponse = await SurveyResponse.create({
      responseId,
      artist_experience,
      work_samples: validWorkSamples,
    });

    console.log("✅ Survey Response Saved:", newResponse);
    res.status(200).json({
      message: "Webhook received and images saved successfully",
      responseId,
    });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * This function is kept for backward compatibility,
 * but is less necessary with public URLs that don't expire
 */
export const refreshPresignedUrls = async (responseId) => {
  try {
    // Find the user's survey response
    const surveyResponse = await SurveyResponse.findOne({ responseId });
    if (!surveyResponse) {
      throw new Error("User not found");
    }

    // Refresh URLs for work samples
    if (surveyResponse.work_samples && surveyResponse.work_samples.length > 0) {
      surveyResponse.work_samples = surveyResponse.work_samples.map(
        (sample) => {
          if (sample.s3Uri) {
            // For public objects, construct the public URL directly
            const bucketName = process.env.S3_BUCKET_NAME;
            const key = sample.s3Uri.replace(`s3://${bucketName}/`, "");
            sample.url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
          }
          return sample;
        }
      );
    }

    // Refresh URL for final logo if it exists
    if (surveyResponse.final_logo && surveyResponse.final_logo.s3Uri) {
      const bucketName = process.env.S3_BUCKET_NAME;
      const key = surveyResponse.final_logo.s3Uri.replace(
        `s3://${bucketName}/`,
        ""
      );
      surveyResponse.final_logo.url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    // Save the updated document
    await surveyResponse.save();

    console.log(`✅ Refreshed URLs for user ${responseId}`);
    return surveyResponse;
  } catch (error) {
    console.error(`❌ Error refreshing URLs for user ${responseId}:`, error);
    throw error;
  }
};

// Export functions
export default {
  handleWebhook,
  refreshPresignedUrls,
  uploadImageToS3,
};
