// src/components/Chat/hooks/useChatMessages.js
import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Custom hook for handling chat messages
 * @param {string|null} responseId - The user ID (null for general users)
 * @param {string} condition - The user's condition (general or personalized)
 * @param {number} timeLeft - Time remaining in session
 * @returns {object} - Chat message state and handlers
 */
export const useChatMessages = (responseId, condition, timeLeft) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Generate a temporary anonymous ID for general users if responseId is not provided
  const [temporaryId] = useState(() => {
    if (!responseId) {
      return `temp_${Math.random().toString(36).substring(2, 15)}`;
    }
    return null;
  });

  // Use the real responseId if available, otherwise use the temporary one
  const effectiveresponseId = responseId || temporaryId;

  // Fetch initial greeting
  useEffect(() => {
    setInitialLoading(true);

    // Use the updated endpoint for greeting
    axios
      .post(`/api/greeting`, {
        responseId: effectiveresponseId,
        condition: condition || "general", // Ensure a default if not provided
      })
      .then((res) => {
        setMessages([
          {
            role: "assistant",
            content: res.data.reply,
            images: res.data.images || [],
          },
        ]);
        setInitialLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching initial greeting:", err);
        setInitialLoading(false);

        // Fallback greeting message
        setMessages([
          {
            role: "assistant",
            content: "Welcome to Logo Design! How can I help you today?",
          },
        ]);
      });
  }, [effectiveresponseId, condition]);

  // Send message function
  const sendMessage = async () => {
    if (timeLeft <= 0 || !input.trim() || loadingResponse) {
      return;
    }

    try {
      setLoadingResponse(true);
      const payload = {
        responseId: effectiveresponseId,
        message: input,
        condition: condition || "general",
      };

      // Add user message immediately
      setMessages((prev) => [...prev, { role: "user", content: input }]);

      // Reset input field
      setInput("");

      // Send request to backend
      const response = await axios.post(`/api/chat`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      // Add assistant response with any generated images
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.reply,
          images: response.data.images || [],
        },
      ]);

      setLoadingResponse(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setLoadingResponse(false);

      // Show error message in chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
        },
      ]);
    }
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      input.trim() &&
      timeLeft > 0 &&
      !loadingResponse
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    messages,
    input,
    setInput,
    sendMessage,
    handleKeyDown,
    loadingResponse,
    initialLoading,
  };
};
