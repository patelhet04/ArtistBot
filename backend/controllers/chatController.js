// chatController.js
import OpenAI from "openai";
import dotenv from "dotenv";
import SurveyResponse from "../models/SurveyResponse.js";
import { addMessageToSession } from "../controllers/logsController.js";
import { CONDITIONS } from "../constants/conditionConstants.js";
import { mapUrlConditionToInternal } from "../services/conditionService.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    "You are an AI creative assistant specialized in logo design. Start with a brief welcome message. Use phrases like 'I'm your assistant' and focus on understanding the user's logo needs.",

  [CONDITIONS.PERSONALIZED_WITH_EXPLANATION]:
    "You are an AI creative assistant specialized in logo design collaborating with experienced designers. Begin with a warm greeting, then highlight key elements of the user's distinctive style from their reference images. Be supportive and insightful about what makes their work special. Use phrases like 'I'm your personalized assistant' and explain how you're incorporating their specific style elements into the designs you suggest.",

  [CONDITIONS.PERSONALIZED_WITHOUT_EXPLANATION]:
    "You are an AI creative assistant with expertise in logo design, collaborating with professional designers. I've studied your portfolio samples and have insights into your unique design approach. Be direct and focused - avoid explaining design theory or justifying style choices. Help create a logo that builds upon the user's distinctive style preferences.",
};

// Handler for initial greeting messages
export const handleGreeting = async (req, res) => {
  try {
    console.log(
      `📥 Received initial greeting request for userId: ${req.body.userId}`
    );
    const { userId, condition: urlCondition } = req.body;

    if (!userId) {
      console.error("❌ Missing required fields in request");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find user in database
    const userResponse = await SurveyResponse.findOne({ userId });
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
      max_tokens: 400,
      temperature: 0.7,
    });

    console.log(`✅ Received greeting response from OpenAI API`);

    // Get the assistant's reply
    const reply = apiResponse.choices[0].message.content;

    // Log the assistant's reply
    await addMessageToSession(userId, "assistant", reply, {
      condition: internalCondition,
      isInitialGreeting: true,
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
    console.log(`📥 Received chat request for userId: ${req.body.userId}`);
    const { userId, message, condition: urlCondition } = req.body;

    if (!userId || !message) {
      console.error("❌ Missing required fields in request");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Map URL condition parameter to internal condition
    const internalCondition = await mapUrlConditionToInternal(
      urlCondition,
      userId
    );

    // Find user in database
    const userResponse = await SurveyResponse.findOne({ userId });
    const isPersonalized = !!userResponse;

    // Save the assigned condition if not already saved
    if (isPersonalized && !userResponse.assignedCondition) {
      await SurveyResponse.findOneAndUpdate(
        { userId },
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
    await addMessageToSession(userId, "user", message, {
      condition: internalCondition,
    });
    console.log(`📝 Logged user message to database`);

    const hasWorkSamples =
      isPersonalized && userResponse?.work_samples?.length > 0;
    if (hasWorkSamples) {
      console.log(
        `🖼️ User has ${userResponse.work_samples.length} work samples available`
      );
    }

    // Prepare the system prompt based on condition
    console.log(`🔧 Preparing system prompt for ${internalCondition} user`);

    // Enhanced system prompt for general users to encourage logo generation
    let systemPrompt;
    if (internalCondition === CONDITIONS.GENERAL) {
      systemPrompt = `
You are an AI creative assistant specialized in logo design. ${
        treatmentPrompts[CONDITIONS.GENERAL]
      }

IMPORTANT: When the user provides details about a logo they need, always suggest generating a logo based on their description.

RESPONSE FORMAT:
You must respond in valid JSON format with these fields:
{
  "reply": "Your thoughtful message to the user",
  "imagePrompt": "Detailed instructions for generating a logo based on the user's request, or null if logo generation isn't needed yet"
}
`;
    } else {
      systemPrompt = `
You are an AI creative assistant specialized in logo design. ${
        treatmentPrompts[internalCondition] || ""
      }

RESPONSE FORMAT:
You must respond in valid JSON format with these fields:
{
  "reply": "Your thoughtful message to the user",
  "imagePrompt": "Detailed instructions for generating a logo based on the user's request, or null if logo generation isn't needed yet"
}
`;
    }

    // Prepare messages for the API
    let openaiMessages = [{ role: "system", content: systemPrompt }];

    // Handle work samples for personalized users
    if (
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

    // Add the user's actual request
    openaiMessages.push({ role: "user", content: message });
    console.log(`💬 Final message count for API: ${openaiMessages.length}`);

    // Select the appropriate model based on whether we need image analysis
    const modelToUse = "gpt-4-turbo";
    console.log(`🤖 Using model: ${modelToUse}`);

    // Call GPT chat completion
    console.log(`🔄 Sending request to OpenAI API...`);
    const apiResponse = await openai.chat.completions.create({
      model: modelToUse,
      messages: openaiMessages,
      max_tokens: 600,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    console.log(`✅ Received response from OpenAI API`);

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
        (message.toLowerCase().includes("logo") ||
          message.toLowerCase().includes("design") ||
          message.toLowerCase().includes("brand") ||
          message.toLowerCase().includes("create"))
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
    await addMessageToSession(userId, "assistant", parsedResponse.reply, {
      condition: internalCondition,
      images: generatedImages,
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
