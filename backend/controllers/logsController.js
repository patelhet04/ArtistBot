// logsController.js
import { CONDITIONS } from "../constants/conditionConstants.js";
import ChatSession from "../models/ChatSession.js";

/**
 * Adds a message to an active user session or creates a new session
 * @param {string} userId - The user identifier
 * @param {string} role - Either "user" or "assistant"
 * @param {string} content - The message content
 * @param {object} options - Additional options
 * @param {string[]} options.images - Optional array of image URLs for assistant messages
 * @param {string} options.condition - The user's condition (general or personalized)
 * @param {number} options.promptVariant - Which prompt variant was used (1 or 2)
 * @returns {Promise<Object>} The updated session
 */
export async function addMessageToSession(userId, role, content, options = {}) {
  try {
    // Find or create an active session
    let session = await ChatSession.findOne({
      userId,
      isActive: true,
    });

    if (!session) {
      // Ensure condition is provided when creating a new session
      if (!options.condition) {
        throw new Error("Condition is required when creating a new session");
      }

      // Validate the condition value against the allowed values
      if (!Object.values(CONDITIONS).includes(options.condition)) {
        console.warn(
          `Invalid condition value: ${options.condition}, defaulting to ${CONDITIONS.GENERAL}`
        );
        options.condition = CONDITIONS.GENERAL;
      }

      session = new ChatSession({
        userId,
        condition: options.condition,
      });
    }

    // Rest of the function remains the same
  } catch (error) {
    console.error("Error adding message to session:", error);
    throw error;
  }
}

/**
 * Ends an active user session
 * @param {string} userId - The user identifier
 * @returns {Promise<Object|null>} The updated session or null if no active session found
 */
export async function endSession(userId) {
  try {
    const session = await ChatSession.findOne({
      userId,
      isActive: true,
    });

    if (session) {
      session.isActive = false;
      session.sessionEnd = new Date();
      await session.save();
      return session;
    }

    return null;
  } catch (error) {
    console.error("Error ending session:", error);
    throw error;
  }
}

/**
 * Retrieves all sessions for a user
 * @param {string} userId - The user identifier
 * @returns {Promise<Array>} Array of user sessions
 */
export async function getUserSessions(userId) {
  try {
    return await ChatSession.find({ userId }).sort({ sessionStart: -1 });
  } catch (error) {
    console.error("Error retrieving user sessions:", error);
    throw error;
  }
}

/**
 * Retrieves statistics about sessions by condition
 * @returns {Promise<Object>} Stats by condition
 */
export async function getSessionStats() {
  try {
    const stats = await ChatSession.aggregate([
      {
        $group: {
          _id: "$condition",
          count: { $sum: 1 },
          avgMessagesPerSession: { $avg: { $size: "$messages" } },
        },
      },
    ]);

    return stats;
  } catch (error) {
    console.error("Error generating session stats:", error);
    throw error;
  }
}
