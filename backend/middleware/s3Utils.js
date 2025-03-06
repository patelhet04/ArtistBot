// utils/s3Utils.js
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

/**
 * Generates a presigned URL from an S3 URI
 *
 * @param {string} s3Uri - S3 URI in the format s3://bucket-name/object-key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 day)
 * @returns {string} Presigned URL for temporary access
 */
// export function getPresignedUrlFromS3Uri(s3Uri, expiresIn = 86400) {
//   if (!s3Uri || !s3Uri.startsWith("s3://")) {
//     throw new Error(
//       "Invalid S3 URI format. Expected: s3://bucket-name/object-key"
//     );
//   }

//   // Parse S3 URI: s3://bucket-name/object-key
//   const uriParts = s3Uri.replace("s3://", "").split("/", 2);
//   const bucket = uriParts[0];
//   const key = s3Uri.replace(`s3://${bucket}/`, "");

//   if (!bucket || !key) {
//     throw new Error("Failed to parse bucket or key from S3 URI");
//   }

//   try {
//     return s3.getSignedUrl("getObject", {
//       Bucket: bucket,
//       Key: key,
//       Expires: expiresIn,
//     });
//   } catch (error) {
//     console.error(`Failed to generate presigned URL for ${s3Uri}:`, error);
//     throw error;
//   }
// }

/**
 * Generates a public URL from an S3 URI
 *
 * @param {string} s3Uri - S3 URI in the format s3://bucket-name/object-key
 * @returns {string} Public URL for the object
 */
export function getPublicUrlFromS3Uri(s3Uri) {
  if (!s3Uri || !s3Uri.startsWith("s3://")) {
    throw new Error(
      "Invalid S3 URI format. Expected: s3://bucket-name/object-key"
    );
  }

  // Parse S3 URI: s3://bucket-name/object-key
  const uriParts = s3Uri.replace("s3://", "").split("/", 2);
  const bucket = uriParts[0];
  const key = s3Uri.replace(`s3://${bucket}/`, "");

  if (!bucket || !key) {
    throw new Error("Failed to parse bucket or key from S3 URI");
  }

  // Return the public URL for the object
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Uploads a buffer to S3 and returns both S3 URI and URL (presigned or public)
 *
 * @param {Buffer} buffer - File buffer to upload
 * @param {string} fileKey - S3 object key (path/filename.ext)
 * @param {string} contentType - MIME type of the file
 * @param {boolean} makePublic - Whether to make the object publicly accessible
 * @returns {Object} Object containing s3Uri and url (presigned or public)
 */
export async function uploadBufferToS3(
  buffer,
  fileKey,
  contentType,
  makePublic = true
) {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Missing required S3_BUCKET_NAME in environment variables");
  }

  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "max-age=31536000", // 1 year caching for better performance
  };

  try {
    // Upload the file to S3
    await s3.upload(uploadParams).promise();

    // Create S3 URI in the format s3://bucket-name/object-key
    const s3Uri = `s3://${bucketName}/${fileKey}`;

    let url;
    if (makePublic) {
      // For public objects, generate a direct public URL
      url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } else {
      // For private objects, generate a presigned URL
      url = s3.getSignedUrl("getObject", {
        Bucket: bucketName,
        Key: fileKey,
        Expires: 86400, // Default: 24 hours
      });
    }

    return {
      s3Uri,
      url,
      isPublic: makePublic,
    };
  } catch (error) {
    console.error(`Failed to upload to S3 (${fileKey}):`, error);
    throw error;
  }
}

/**
 * Creates a copy of an existing S3 object
 *
 * @param {string} sourceUri - Source S3 URI (s3://bucket/key)
 * @param {string} destinationKey - Destination object key
 * @param {boolean} makePublic - Whether to make the object publicly accessible
 * @returns {Object} Object containing s3Uri and url for the new copy
 */
export async function copyS3Object(
  sourceUri,
  destinationKey,
  makePublic = true
) {
  const bucketName = process.env.S3_BUCKET_NAME;

  // Parse source URI
  const sourceParts = sourceUri.replace("s3://", "").split("/", 2);
  const sourceBucket = sourceParts[0];
  const sourceKey = sourceUri.replace(`s3://${sourceBucket}/`, "");

  const copyParams = {
    Bucket: bucketName,
    CopySource: `/${sourceBucket}/${sourceKey}`,
    Key: destinationKey,
    CacheControl: "max-age=31536000", // 1 year caching for better performance
  };

  try {
    await s3.copyObject(copyParams).promise();

    // Create S3 URI for the copied object
    const s3Uri = `s3://${bucketName}/${destinationKey}`;

    let url;
    if (makePublic) {
      // For public objects, generate a direct public URL
      url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${destinationKey}`;
    } else {
      // For private objects, generate a presigned URL
      url = s3.getSignedUrl("getObject", {
        Bucket: bucketName,
        Key: destinationKey,
        Expires: 86400,
      });
    }

    return {
      s3Uri,
      url,
      isPublic: makePublic,
    };
  } catch (error) {
    console.error(
      `Failed to copy S3 object from ${sourceUri} to ${destinationKey}:`,
      error
    );
    throw error;
  }
}

export default {
  getPublicUrlFromS3Uri,
  uploadBufferToS3,
  copyS3Object,
  s3,
};
