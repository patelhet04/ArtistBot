// ChatSession.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["user", "assistant", "system"],
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
  // Store original imagePrompt if applicable
  imagePrompt: {
    type: String,
    default: null,
  },
  // Track token usage for this message
  tokensUsed: {
    type: Number,
    default: 0,
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
    // Store system prompt for this conversation to maintain context
    systemPrompt: {
      type: String,
      required: true,
    },
    // Track token usage for the session
    totalTokensUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for more efficient querying
chatSessionSchema.index({ responseId: 1, isActive: 1 });

export default mongoose.model("ChatSession", chatSessionSchema);
