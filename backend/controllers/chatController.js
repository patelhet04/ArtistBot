// chatController.js
import OpenAI from "openai";
import dotenv from "dotenv";
import SurveyResponse from "../models/SurveyResponse.js";
import {
  addMessageToSession,
  getFullChatContext,
  endSession,
} from "../controllers/logsController.js";
import {
  CONDITIONS,
  treatmentPrompts,
} from "../constants/conditionConstants.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_CONTEXT_MESSAGES = 15;
const MAX_TOKENS = 32000; // gpt-4-turbo
const MAX_RESPONSE_TOKENS = 800;

const generateLogo = async (basePrompt) => {
  console.log(
    `🎨 Generating logo with prompt: "${basePrompt.substring(0, 50)}..."`
  );
  try {
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: basePrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });
    return result.data[0].url;
  } catch (error) {
    console.error("❌ Error generating logo:", error);
    return null;
  }
};

export const handleGreeting = async (req, res) => {
  const requestId = Math.random().toString(36).substring(2);
  try {
    const { responseId, condition } = req.body;

    console.log(
      `📥 [${requestId}] Received greeting request for responseId: ${responseId} with condition: ${condition}`
    );

    // Validate condition
    if (!Object.values(CONDITIONS).includes(condition)) {
      return res.status(400).json({ error: "Invalid condition" });
    }

    // For personalized conditions, check if user has images
    let hasImages = false;
    if (
      condition === CONDITIONS.PERSONALIZED ||
      condition === CONDITIONS.PERSONALIZED_WITH_EXPLANATION
    ) {
      const userResponse = await SurveyResponse.findOne({ responseId });
      hasImages = userResponse?.work_samples?.length > 0;

      // If no images found for personalized conditions, fall back to general
      if (!hasImages) {
        console.log(
          `⚠️ [${requestId}] No images found for personalized condition, falling back to general`
        );
        condition = CONDITIONS.GENERAL;
      }
    }

    // Get the appropriate prompt based on condition
    const prompt = treatmentPrompts[condition];
    console.log(`🔍 [${requestId}] Using prompt: ${prompt}`);

    // Get user's images if available
    let imageUrls = [];
    if (hasImages) {
      const userResponse = await SurveyResponse.findOne({ responseId });
      imageUrls = userResponse.work_samples.map((sample) => sample.url);
    }

    // Generate greeting message
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: hasImages
            ? [
                {
                  type: "text",
                  text: "Here are my work samples. Please analyze them and help me create a logo that matches my style.",
                },
                ...imageUrls.map((url) => ({
                  type: "image_url",
                  image_url: { url },
                })),
              ]
            : "Start the conversation.",
        },
      ],
      max_tokens: MAX_RESPONSE_TOKENS,
    });

    const greeting = completion.choices[0].message.content;

    // Log the interaction
    await addMessageToSession(responseId, "assistant", greeting);

    res.json({ greeting });
  } catch (error) {
    console.error(`❌ [${requestId}] Error in handleGreeting:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleChat = async (req, res) => {
  const requestId = Math.random().toString(36).substring(2);
  try {
    const { condition, responseId, message } = req.body;

    console.log(
      `📥 [${requestId}] Received chat request for responseId: ${responseId} with condition: ${condition}`
    );

    if (!responseId || !message || !condition) {
      console.error(`❌ [${requestId}] Missing required fields`);
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate condition
    if (!Object.values(CONDITIONS).includes(condition)) {
      return res.status(400).json({ error: "Invalid condition" });
    }

    // For personalized conditions, check if user has images
    let hasImages = false;
    if (
      condition === CONDITIONS.PERSONALIZED ||
      condition === CONDITIONS.PERSONALIZED_WITH_EXPLANATION
    ) {
      const userResponse = await SurveyResponse.findOne({ responseId });
      hasImages = userResponse?.work_samples?.length > 0;

      // If no images found for personalized conditions, fall back to general
      if (!hasImages) {
        console.log(
          `⚠️ [${requestId}] No images found for personalized condition, falling back to general`
        );
        condition = CONDITIONS.GENERAL;
      }
    }

    // Get the appropriate prompt based on condition
    const prompt = treatmentPrompts[condition];

    // Get chat context
    const chatContext = (await getFullChatContext(responseId)) || {
      messages: [],
    };

    // Prepare system prompt with condition-specific instructions
    const systemPrompt = `
    ${prompt}
    IMPORTANT: Respond in valid JSON format. Only include "imagePrompt" when the user explicitly requests a logo, such as:
      - "Generate a logo for me"
      - "Create a logo"
      - "Make a logo"
    DO NOT include "imagePrompt" for general discussions, ideation, or brainstorming about logo concepts.
    
    Format:
    {
      "reply": "Your response message",
      "imagePrompt": "Logo description or null"
    }
    `;

    const openaiMessages = [
      { role: "system", content: systemPrompt },
      ...chatContext.messages.slice(-MAX_CONTEXT_MESSAGES),
      { role: "user", content: message },
    ];

    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: openaiMessages,
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    console.log(`✅ [${requestId}] Received chat response`);
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(
        apiResponse.choices[0]?.message?.content || "{}"
      );
    } catch (error) {
      console.error(
        `❌ [${requestId}] Error parsing GPT response JSON:`,
        error
      );
      parsedResponse = { reply: "I'm here to assist!", imagePrompt: null };
    }

    parsedResponse.reply = parsedResponse.reply || "I'm here to assist!";
    parsedResponse.imagePrompt = parsedResponse.imagePrompt || null;

    const isLogoRequest = parsedResponse.imagePrompt !== null;
    let generatedImageUrl = null;

    if (isLogoRequest) {
      generatedImageUrl = await generateLogo(parsedResponse.imagePrompt);
      parsedResponse.reply += generatedImageUrl
        ? " Here's your generated logo!"
        : " Sorry, I couldn't generate the logo.";
    }

    const generatedImages = generatedImageUrl ? [generatedImageUrl] : [];

    await addMessageToSession(responseId, "assistant", parsedResponse.reply, {
      condition,
      images: generatedImages,
      imagePrompt: parsedResponse.imagePrompt,
      tokensUsed: apiResponse.usage?.total_tokens || 0,
    });

    return res
      .status(200)
      .json({ reply: parsedResponse.reply, images: generatedImages });
  } catch (error) {
    console.error(`❌ [${requestId}] Error in handleChat:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resetChat = async (req, res) => {
  const requestId = Math.random().toString(36).substring(2);
  try {
    const { responseId } = req.body;
    console.log(
      `📥 [${requestId}] Received reset request for responseId: ${responseId}`
    );

    if (!responseId) {
      console.error(`❌ [${requestId}] Missing required fields`);
      return res.status(400).json({ error: "User ID is required" });
    }

    await endSession(responseId);
    return res
      .status(200)
      .json({ success: true, message: "Chat session reset" });
  } catch (error) {
    console.error(`❌ [${requestId}] Error resetting chat session:`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default { handleGreeting, handleChat, resetChat };
