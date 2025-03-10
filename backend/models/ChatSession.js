// ChatSession.js
import mongoose from "mongoose";
import { CONDITIONS } from "../constants/conditionConstants.js";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["user", "assistant", "system"], // Added "system" as a valid role
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Optional field to store image URLs generated during assistant responses
  images: {
    type: [String],
    default: [],
  },
  // Track if this is a message that contains image content (for multimodal models)
  hasImageContent: {
    type: Boolean,
    default: false,
  },
  // Store original imagePrompt if applicable
  imagePrompt: {
    type: String,
    default: null,
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    responseId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [messageSchema],
    sessionStart: {
      type: Date,
      default: Date.now,
    },
    sessionEnd: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Track which condition the user was in for analysis
    condition: {
      type: String,
      enum: Object.values(CONDITIONS), // Use the values from your constants file
      required: true,
    },
    // Store system prompt for this conversation to maintain context
    systemPrompt: {
      type: String,
      required: true,
    },
    // Track if this session involves personalization or work samples
    hasWorkSamples: {
      type: Boolean,
      default: false,
    },
    // Track token usage for the session (useful for monitoring)
    totalTokensUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add compound index for more efficient querying
chatSessionSchema.index({ responseId: 1, isActive: 1 });

export default mongoose.model("ChatSession", chatSessionSchema);
