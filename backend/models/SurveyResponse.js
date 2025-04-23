// models/SurveyResponse.js
import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  fileName: { type: String, required: false },
  url: { type: String, required: false }, // Presigned URL (temporary)
  s3Uri: { type: String, required: false }, // S3 URI (permanent)
  uploadedAt: { type: Date, default: Date.now },
});

const SurveyResponseSchema = new mongoose.Schema(
  {
    responseId: { type: String, required: true },
    artist_experience: { type: String, required: false },
    work_samples: { type: [ImageSchema], required: false },
    final_logo: {
      fileName: { type: String },
      url: { type: String },
      uploadedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Export using ES6 syntax
export default mongoose.model("SurveyResponse", SurveyResponseSchema);
