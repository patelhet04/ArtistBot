// logsController.js
import { CONDITIONS } from "../constants/conditionConstants.js";
import ChatSession from "../models/ChatSession.js";

/**
 * Creates a new chat session for a user
 * @param {string} responseId - The user identifier
 * @param {string} condition - The condition for this session
 * @param {string} systemPrompt - The system prompt used for this session
 * @param {boolean} hasWorkSamples - Whether this session involves work samples
 * @returns {Promise<Object>} The created session
 */
export async function createChatSession(
  responseId,
  condition,
  systemPrompt,
  hasWorkSamples = false
) {
  try {
    // Validate the condition value against the allowed values
    if (!Object.values(CONDITIONS).includes(condition)) {
      console.warn(
        `Invalid condition value: ${condition}, defaulting to ${CONDITIONS.GENERAL}`
      );
      condition = CONDITIONS.GENERAL;
    }

    // Create a new session
    const session = new ChatSession({
      responseId,
      condition,
      systemPrompt,
      hasWorkSamples,
    });

    // Add the system prompt as first message to maintain context properly
    session.messages.push({
      role: "system",
      content: systemPrompt,
      timestamp: new Date(),
    });

    await session.save();
    console.log(
      `Created new chat session for user ${responseId} with condition ${condition}`
    );
    return session;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
}

/**
 * Adds a message to an active user session or creates a new session
 * @param {string} responseId - The user identifier
 * @param {string} role - Either "user" or "assistant"
 * @param {string} content - The message content
 * @param {object} options - Additional options
 * @param {string[]} options.images - Optional array of image URLs for assistant messages
 * @param {string} options.condition - The user's condition (general or personalized)
 * @param {string} options.systemPrompt - System prompt if creating a new session
 * @param {string} options.imagePrompt - The image prompt used (if applicable)
 * @param {number} options.tokensUsed - Tokens used for this message (if known)
 * @returns {Promise<Object>} The updated session
 */
export async function addMessageToSession(
  responseId,
  role,
  content,
  options = {}
) {
  try {
    // Find or create an active session
    let session = await ChatSession.findOne({
      responseId,
      isActive: true,
    });

    if (!session) {
      // Ensure condition is provided when creating a new session
      if (!options.condition) {
        throw new Error("Condition is required when creating a new session");
      }

      // Ensure system prompt is provided
      if (!options.systemPrompt) {
        console.warn("No system prompt provided, using default");
        options.systemPrompt = "You are a helpful AI assistant.";
      }

      // Create a new session
      session = await createChatSession(
        responseId,
        options.condition,
        options.systemPrompt,
        !!options.hasWorkSamples
      );
    }

    // Create the message object
    const message = {
      role,
      content,
      timestamp: new Date(),
    };

    // Add image URLs if provided for assistant messages
    if (role === "assistant" && options.images && options.images.length > 0) {
      message.images = options.images;
    }

    // Add image prompt if provided
    if (options.imagePrompt) {
      message.imagePrompt = options.imagePrompt;
    }

    // Update token usage if provided
    if (options.tokensUsed) {
      session.totalTokensUsed += options.tokensUsed;
    }

    // Add the message to the session
    session.messages.push(message);
    await session.save();

    return session;
  } catch (error) {
    console.error("Error adding message to session:", error);
    throw error;
  }
}

/**
 * Retrieves chat history for a user's active session
 * @param {string} responseId - The user identifier
 * @param {number} limit - Maximum number of messages to retrieve (default: 10)
 * @param {boolean} includeSystem - Whether to include system messages (default: false)
 * @returns {Promise<Array>} Array of messages from the active session
 */
export async function getChatHistory(
  responseId,
  limit = 10,
  includeSystem = false
) {
  try {
    // Find the active session for this user
    const session = await ChatSession.findOne({
      responseId,
      isActive: true,
    });

    if (!session) {
      console.log(`No active session found for user ${responseId}`);
      return [];
    }

    // Filter messages based on whether to include system messages
    let filteredMessages = includeSystem
      ? session.messages
      : session.messages.filter((msg) => msg.role !== "system");

    // Get the most recent messages (up to the limit)
    filteredMessages = filteredMessages.slice(-limit);

    // Map the messages to the format expected by the OpenAI API
    return filteredMessages.map((msg) => {
      // Basic message format
      const formattedMsg = {
        role: msg.role,
        content: msg.content,
      };

      // For image messages, format them correctly
      if (msg.hasImageContent && msg.images && msg.images.length > 0) {
        formattedMsg.content = [
          { type: "text", text: msg.content },
          { type: "image_url", image_url: { url: msg.images[0] } },
        ];
      }

      return formattedMsg;
    });
  } catch (error) {
    console.error(
      `Error retrieving chat history for user ${responseId}:`,
      error
    );
    return []; // Return empty array on error
  }
}

/**
 * Retrieves complete chat history with system prompt for a user's active session
 * Used for maintaining full context in OpenAI requests
 * @param {string} responseId - The user identifier
 * @returns {Promise<Object>} System prompt and messages array
 */
export async function getFullChatContext(responseId) {
  try {
    // Find the active session for this user
    const session = await ChatSession.findOne({
      responseId,
      isActive: true,
    });

    if (!session) {
      console.log(`No active session found for user ${responseId}`);
      return { systemPrompt: null, messages: [] };
    }

    // Get all non-system messages (user and assistant)
    const messages = session.messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => {
        // Basic message format
        const formattedMsg = {
          role: msg.role,
          content: msg.content,
        };

        // For image messages, format them correctly
        if (msg.hasImageContent && msg.images && msg.images.length > 0) {
          formattedMsg.content = [
            { type: "text", text: msg.content },
            { type: "image_url", image_url: { url: msg.images[0] } },
          ];
        }

        return formattedMsg;
      });

    return {
      systemPrompt: session.systemPrompt,
      messages: messages,
    };
  } catch (error) {
    console.error(
      `Error retrieving full chat context for user ${responseId}:`,
      error
    );
    return { systemPrompt: null, messages: [] };
  }
}

/**
 * Ends an active user session
 * @param {string} responseId - The user identifier
 * @returns {Promise<Object|null>} The updated session or null if no active session found
 */
export async function endSession(responseId) {
  try {
    const session = await ChatSession.findOne({
      responseId,
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
 * @param {string} responseId - The user identifier
 * @returns {Promise<Array>} Array of user sessions
 */
export async function getUserSessions(responseId) {
  try {
    return await ChatSession.find({ responseId }).sort({ sessionStart: -1 });
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
          avgTokensPerSession: { $avg: "$totalTokensUsed" },
        },
      },
    ]);

    return stats;
  } catch (error) {
    console.error("Error generating session stats:", error);
    throw error;
  }
}
