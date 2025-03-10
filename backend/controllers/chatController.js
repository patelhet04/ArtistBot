// chatController.js
import OpenAI from "openai";
import dotenv from "dotenv";
import SurveyResponse from "../models/SurveyResponse.js";
import {
  addMessageToSession,
  getFullChatContext,
  endSession,
} from "../controllers/logsController.js";
import { CONDITIONS } from "../constants/conditionConstants.js";
import { mapUrlConditionToInternal } from "../services/conditionService.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Maximum number of messages to include in context
const MAX_CONTEXT_MESSAGES = 15;

// Maximum token context window for the model (to avoid exceeding limits)
const MAX_TOKENS = 32000; // for gpt-4-turbo
const MAX_RESPONSE_TOKENS = 800; // Allow for longer responses

// Helper function to enhance image prompts with professional logo guidelines
const enhanceImagePrompt = (basePrompt) => {
  return `${basePrompt.trim()}
  
Create a professional, business-quality logo with the following specifications:
- High contrast with clear visual hierarchy
- Balanced composition
- Scalable and versatile for different use cases
- Clean lines and professional appearance
- Appropriate for business use in any industry
- No text unless specifically requested in the instructions above

The logo should reflect the style and elements described above.`;
};

// Helper function to generate a logo
const generateLogo = async (basePrompt) => {
  console.log(
    `🎨 Starting logo generation process with prompt: "${basePrompt.substring(
      0,
      50
    )}..."`
  );

  try {
    // Create enhanced prompt for better results
    const fullPrompt = enhanceImagePrompt(basePrompt);
    console.log(`📝 Enhanced prompt: "${fullPrompt.substring(0, 50)}..."`);

    // Generate image
    console.log(`⏳ Sending request to DALL-E API...`);
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural", // Use natural style for logos
    });

    console.log(`✅ DALL-E request successful`);
    return result.data[0].url;
  } catch (error) {
    console.error("❌ Error generating logo:", error);
    console.error("  Error details:", error.message);
    if (error.response) {
      console.error("  API response status:", error.response.status);
      console.error(
        "  API response data:",
        JSON.stringify(error.response.data)
      );
    }
    return null;
  }
};

// Treatment condition prompts with descriptive names
export const treatmentPrompts = {
  [CONDITIONS.GENERAL]:
    "You are a helpful creative assistant that helps users create logos. You are working with an experienced logo designer on this task. Start with a short welcoming message. Use phrases like “I’m your assistant”.",

  [CONDITIONS.PERSONALIZED_WITH_EXPLANATION]:
    "You are a helpful creative assistant that helps the user create logos. The user is an experienced logo designer. The user has provided three examples of their prior work. Analyze the style of the three images provided. Start with a warm welcoming message then summarize the key style elements of the artist. Be insightful and supportive highlighting what stands out about their style and offer to help create a logo that incorporates and builds on the unique style of the artist. Then start a conversation asking the user about their vision for the logo is. Use phrases like “I’m your personalized assistant”. When you generate images, you always provide explanations for why and how you incorporated the specific style of the user. Help the user create a logo that incorporates and builds on their unique style.",

  [CONDITIONS.PERSONALIZED_WITHOUT_EXPLANATION]:
    "You are a helpful creative assistant that helps users create logos. You are working with an experienced logo designer on this task. Analyze the style of the three images provided. Help the user create a logo that incorporates and builds on their unique style. Use phrases like “I’m your personalized assistant”. You don’t provide explanations what that their style is or how you are incorporating it. When you generate images, you never explain why you used a certain style. Begin the conversation by asking the user a question to understanding their vision for the logo is.",
};

// Helper function to check if a message might prompt logo generation
const messageRequestsLogo = (message) => {
  const logoKeywords = [
    "logo",
    "design",
    "brand",
    "create",
    "make",
    "generate",
    "icon",
    "symbol",
    "emblem",
    "trademark",
    "identity",
  ];

  const messageLower = message.toLowerCase();
  return logoKeywords.some((keyword) => messageLower.includes(keyword));
};

// Handler for initial greeting messages
export const handleGreeting = async (req, res) => {
  try {
    console.log(
      `📥 Received initial greeting request for responseId: ${req.body.responseId}`
    );
    const { responseId, condition: urlCondition } = req.body;

    if (!responseId) {
      console.error("❌ Missing required fields in request");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find user in database
    const userResponse = await SurveyResponse.findOne({ responseId });
    const isPersonalized = !!userResponse;

    const internalCondition =
      userResponse?.assignedCondition || CONDITIONS.GENERAL;
    console.log(`👤 Using condition: ${internalCondition}`);

    console.log(
      `👤 User type: ${
        isPersonalized ? "Personalized" : "General"
      }, Condition: ${internalCondition}`
    );

    // Get work samples if available for personalized users
    const hasWorkSamples =
      isPersonalized && userResponse?.work_samples?.length > 0;
    if (hasWorkSamples) {
      console.log(
        `🖼️ User has ${userResponse.work_samples.length} work samples available`
      );
    }

    // Select appropriate greeting prompt based on condition
    const systemPrompt =
      treatmentPrompts[internalCondition] ||
      treatmentPrompts[CONDITIONS.GENERAL];

    // Prepare messages for the API
    let openaiMessages = [{ role: "system", content: systemPrompt }];

    // Handle work samples for personalized conditions
    if (
      hasWorkSamples &&
      (internalCondition === CONDITIONS.PERSONALIZED_WITH_EXPLANATION ||
        internalCondition === CONDITIONS.PERSONALIZED_WITHOUT_EXPLANATION)
    ) {
      console.log(
        `📤 Adding ${userResponse.work_samples.length} work samples to message context`
      );

      // Process each work sample image
      userResponse.work_samples.forEach((image, index) => {
        openaiMessages.push({
          role: "user",
          content: [
            { type: "text", text: `Work sample ${index + 1}:` },
            { type: "image_url", image_url: { url: image.url } },
          ],
        });
      });

      // Add prompt to analyze and greet based on style
      openaiMessages.push({
        role: "user",
        content:
          "Please provide an initial greeting that analyzes my style from these images and welcomes me to the logo design tool.",
      });
    } else {
      // For non-personalized, just add a generic greeting request
      openaiMessages.push({
        role: "user",
        content:
          "Please provide a friendly welcome message for a new user of your logo design tool.",
      });
    }

    // Select the appropriate model based on whether we need image analysis
    const modelToUse = "gpt-4-turbo";
    console.log(`🤖 Using model: ${modelToUse}`);

    // Call GPT chat completion
    console.log(`🔄 Sending greeting request to OpenAI API...`);
    const apiResponse = await openai.chat.completions.create({
      model: modelToUse,
      messages: openaiMessages,
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: 0.7,
    });

    console.log(`✅ Received greeting response from OpenAI API`);

    // Get the assistant's reply
    const reply = apiResponse.choices[0].message.content;

    // Log the assistant's reply with the system prompt
    await addMessageToSession(responseId, "assistant", reply, {
      condition: internalCondition,
      isInitialGreeting: true,
      systemPrompt: systemPrompt,
      hasWorkSamples: hasWorkSamples,
      tokensUsed: apiResponse.usage?.total_tokens || 0,
    });

    // Return the greeting to the client
    return res.status(200).json({
      reply: reply,
      images: [], // No images for initial greeting
    });
  } catch (error) {
    console.error("❌ Error in handleGreeting:", error);
    return res.status(500).json({
      error:
        "We encountered an issue processing your request. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const handleChat = async (req, res) => {
  try {
    console.log(`📥 Received chat request for responseId: ${req.body.responseId}`);
    const { responseId, message, condition: urlCondition } = req.body;

    if (!responseId || !message) {
      console.error("❌ Missing required fields in request");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Map URL condition parameter to internal condition
    const internalCondition = await mapUrlConditionToInternal(
      urlCondition,
      responseId
    );

    // Find user in database
    const userResponse = await SurveyResponse.findOne({ responseId });
    const isPersonalized = !!userResponse;

    // Save the assigned condition if not already saved
    if (isPersonalized && !userResponse.assignedCondition) {
      await SurveyResponse.findOneAndUpdate(
        { responseId },
        { assignedCondition: internalCondition },
        { new: true }
      );
      console.log(`✅ Assigned and saved new condition: ${internalCondition}`);
    }

    console.log(
      `👤 User type: ${
        isPersonalized ? "Personalized" : "General"
      }, Condition: ${internalCondition}`
    );

    // Log user's message with condition
    await addMessageToSession(responseId, "user", message, {
      condition: internalCondition,
    });
    console.log(`📝 Logged user message to database`);

    // Get the full conversation context
    console.log(`📚 Retrieving conversation context for responseId: ${responseId}`);
    const chatContext = await getFullChatContext(responseId);

    // If no existing session found (rare case but possible),
    // use default system prompt based on condition
    const systemPrompt =
      chatContext.systemPrompt ||
      treatmentPrompts[internalCondition] ||
      treatmentPrompts[CONDITIONS.GENERAL];

    const hasWorkSamples =
      isPersonalized && userResponse?.work_samples?.length > 0;
    if (hasWorkSamples) {
      console.log(
        `🖼️ User has ${userResponse.work_samples.length} work samples available`
      );
    }

    // Enhanced system prompt for general users to encourage logo generation
    let enhancedSystemPrompt;
    if (internalCondition === CONDITIONS.GENERAL) {
      enhancedSystemPrompt = `
You are an AI creative assistant specialized in logo design. ${systemPrompt}

IMPORTANT: When the user provides details about a logo they need, always suggest generating a logo based on their description.

RESPONSE FORMAT:
You must respond in valid JSON format with these fields:
{
  "reply": "Your thoughtful message to the user",
  "imagePrompt": "Detailed instructions for generating a logo based on the user's request, or null if logo generation isn't needed yet"
}
`;
    } else {
      enhancedSystemPrompt = `
You are an AI creative assistant specialized in logo design. ${systemPrompt}

RESPONSE FORMAT:
You must respond in valid JSON format with these fields:
{
  "reply": "Your thoughtful message to the user",
  "imagePrompt": "Detailed instructions for generating a logo based on the user's request, or null if logo generation isn't needed yet"
}
`;
    }

    // Prepare messages for the API
    let openaiMessages = [{ role: "system", content: enhancedSystemPrompt }];

    // Handle work samples for personalized users if this is a new session
    // (Only add work samples if they weren't already in the conversation)
    const isFirstMessageInSession = chatContext.messages.length === 0;

    if (
      isFirstMessageInSession &&
      hasWorkSamples &&
      (internalCondition === CONDITIONS.PERSONALIZED_WITH_EXPLANATION ||
        internalCondition === CONDITIONS.PERSONALIZED_WITHOUT_EXPLANATION)
    ) {
      console.log(
        `📤 Adding ${userResponse.work_samples.length} work samples to message context`
      );

      // Add context about the work samples
      openaiMessages.push({
        role: "user",
        content:
          "These are examples of my previous logo work that showcase my style. Please review them before helping with my new logo request.",
      });

      // Process each work sample image
      userResponse.work_samples.forEach((image, index) => {
        openaiMessages.push({
          role: "user",
          content: [
            { type: "text", text: `Work sample ${index + 1}:` },
            { type: "image_url", image_url: { url: image.url } },
          ],
        });
      });

      // Add assistant acknowledgment of images
      openaiMessages.push({
        role: "assistant",
        content:
          "I've analyzed your work samples and understand your design style. How can I help with your new logo project?",
      });
    }

    // Add conversation history (limited to last MAX_CONTEXT_MESSAGES)
    const limitedMessages = chatContext.messages.slice(-MAX_CONTEXT_MESSAGES);
    if (limitedMessages.length > 0) {
      console.log(
        `💬 Adding ${limitedMessages.length} previous messages for context`
      );
      openaiMessages = [...openaiMessages, ...limitedMessages];
    }

    // Add the user's current message
    openaiMessages.push({ role: "user", content: message });
    console.log(`💬 Final message count for API: ${openaiMessages.length}`);

    // Select the appropriate model
    const modelToUse = "gpt-4-turbo";
    console.log(`🤖 Using model: ${modelToUse}`);

    // Call GPT chat completion
    console.log(`🔄 Sending request to OpenAI API...`);
    const apiResponse = await openai.chat.completions.create({
      model: modelToUse,
      messages: openaiMessages,
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    console.log(`✅ Received response from OpenAI API`);

    // Track token usage
    const tokensUsed = apiResponse.usage?.total_tokens || 0;
    console.log(`📊 Total tokens used: ${tokensUsed}`);

    // Process the model's response
    const aiReplyText = apiResponse.choices[0].message.content;
    console.log(`📄 Raw AI response: ${aiReplyText.substring(0, 100)}...`);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiReplyText);
      console.log(`✅ Successfully parsed JSON response`);

      // Validate response structure
      if (!parsedResponse.reply) {
        throw new Error("Response missing required 'reply' field");
      }

      // Ensure imagePrompt is null if not provided
      if (!parsedResponse.hasOwnProperty("imagePrompt")) {
        console.log(
          `ℹ️ Response doesn't contain imagePrompt field, setting to null`
        );
        parsedResponse.imagePrompt = null;
      } else if (parsedResponse.imagePrompt) {
        console.log(
          `🖌️ Found image prompt: "${parsedResponse.imagePrompt.substring(
            0,
            50
          )}..."`
        );
      }
    } catch (err) {
      console.error("❌ Error parsing GPT response:", err);

      // Create a structured fallback response
      parsedResponse = {
        reply: `I'd be happy to help with your logo design. ${aiReplyText.substring(
          0,
          200
        )}...`,
        imagePrompt: null,
      };
      console.log(`⚠️ Using fallback response structure`);
    }

    // Generate a logo if an image prompt was provided
    let generatedImageUrl = null;
    if (parsedResponse.imagePrompt) {
      console.log(`🎨 Image prompt detected, initiating logo generation`);
      generatedImageUrl = await generateLogo(parsedResponse.imagePrompt);
      console.log(
        `📊 Logo generation complete: ${
          generatedImageUrl ? "Success" : "Failed"
        }`
      );
    } else {
      // For general users, try to proactively generate a logo if the message seems to be describing logo requirements
      if (
        internalCondition === CONDITIONS.GENERAL &&
        messageRequestsLogo(message)
      ) {
        console.log(
          `🔍 General user potentially requesting logo. Attempting to generate one.`
        );

        // If the model didn't provide an image prompt but the message seems logo-related,
        // create a default image prompt from the user's message
        const defaultImagePrompt = `Create a logo based on this description: ${message}`;
        console.log(`🖌️ Using default image prompt from user message`);

        generatedImageUrl = await generateLogo(defaultImagePrompt);

        if (generatedImageUrl) {
          console.log(`📊 Proactive logo generation complete: Success`);
          // Update the response to acknowledge the logo generation
          parsedResponse.reply +=
            "\n\nI've created a logo based on your description. Let me know what you think and if you'd like any changes!";
          parsedResponse.imagePrompt = defaultImagePrompt;
        } else {
          console.log(`📊 Proactive logo generation complete: Failed`);
        }
      } else {
        console.log(`ℹ️ No image prompt provided, skipping logo generation`);
      }
    }

    // Create the images array (with just one image if generated)
    const generatedImages = generatedImageUrl ? [generatedImageUrl] : [];

    // Log the assistant's reply with metadata
    console.log(
      `📝 Logging assistant reply and ${generatedImages.length} images to database`
    );

    await addMessageToSession(responseId, "assistant", parsedResponse.reply, {
      condition: internalCondition,
      images: generatedImages,
      imagePrompt: parsedResponse.imagePrompt,
      tokensUsed: tokensUsed,
      hasImageContent: generatedImages.length > 0,
    });

    // Return the complete response to the client
    console.log(
      `🔄 Sending response to client with ${generatedImages.length} logo images`
    );
    return res.status(200).json({
      reply: parsedResponse.reply,
      images: generatedImages,
    });
  } catch (error) {
    console.error("❌ Error in handleChat:", error);
    return res.status(500).json({
      error:
        "We encountered an issue while processing your request. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Function to reset chat session
export const resetChat = async (req, res) => {
  try {
    const { responseId } = req.body;

    if (!responseId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // End the current active session
    await endSession(responseId);
    console.log(`🔄 Reset chat session for user ${responseId}`);

    return res.status(200).json({
      success: true,
      message: "Chat session has been reset",
    });
  } catch (error) {
    console.error("❌ Error resetting chat session:", error);
    return res.status(500).json({
      error: "We encountered an issue while resetting the chat session.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper function to estimate token count (rough estimate)
// This is useful for monitoring token usage and keeping within limits
const estimateTokenCount = (text) => {
  // Very rough estimate: 1 token ~= 4 characters in English
  return Math.ceil(text.length / 4);
};

export default {
  handleGreeting,
  handleChat,
  resetChat,
};
