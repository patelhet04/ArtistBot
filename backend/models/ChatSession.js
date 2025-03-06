// ChatSession.js
import mongoose from "mongoose";
import { CONDITIONS } from "../constants/conditionConstants.js";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ["user", "assistant"],
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
});

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
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
   
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Add compound index for more efficient querying
chatSessionSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model("ChatSession", chatSessionSchema);
