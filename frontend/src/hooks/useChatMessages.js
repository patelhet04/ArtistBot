// src/components/Chat/hooks/useChatMessages.js
import { useState, useEffect } from "react";
import axios from "axios";

// Define valid conditions matching backend codes
const VALID_CONDITIONS = {
  G: "g", // General
  P: "p", // Personalized
  F: "f", // Personalized with explanation
};

// Helper function to validate condition
const isValidCondition = (condition) => {
  return Object.values(VALID_CONDITIONS).includes(condition);
};

export const useChatMessages = (responseId, condition, timeLeft) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const [temporaryId] = useState(() => {
    if (!responseId) {
      return `general_${Math.random().toString(36).substring(2, 15)}`;
    }
    return null;
  });

  const effectiveresponseId = responseId || temporaryId;

  // Validate and normalize condition
  const normalizedCondition = isValidCondition(condition)
    ? condition
    : VALID_CONDITIONS.G;

  // Log condition changes
  useEffect(() => {
    console.log(`Condition changed to: ${normalizedCondition}`);
  }, [normalizedCondition]);

  // Fetch initial greeting
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);
    setError(null);

    if (!isValidCondition(normalizedCondition)) {
      setError("Invalid condition parameter");
      setInitialLoading(false);
      return;
    }

    console.log(
      `Fetching greeting for responseId: ${effectiveresponseId}, condition: ${normalizedCondition}`
    );

    axios
      .post(`/api/greeting`, {
        responseId: effectiveresponseId,
        condition: normalizedCondition,
      })
      .then((res) => {
        if (isMounted) {
          setMessages([
            {
              role: "assistant",
              content: res.data.greeting,
              images: res.data.images || [],
            },
          ]);
          setInitialLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching initial greeting:", err);
        if (isMounted) {
          setInitialLoading(false);
          setError(
            err.response?.data?.error || "Failed to load initial greeting"
          );
          setMessages([
            {
              role: "assistant",
              content: "Welcome to Logo Design! How can I help you today?",
            },
          ]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveresponseId, normalizedCondition]);

  const sendMessage = async () => {
    if (timeLeft <= 0 || !input.trim() || loadingResponse) return;

    try {
      setLoadingResponse(true);
      setError(null);

      if (!isValidCondition(normalizedCondition)) {
        throw new Error("Invalid condition parameter");
      }

      const payload = {
        responseId: effectiveresponseId,
        message: input,
        condition: normalizedCondition,
      };

      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setInput("");

      const response = await axios.post(`/api/chat`, payload, {
        headers: { "Content-Type": "application/json" },
      });

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
      setError(
        err.response?.data?.error || err.message || "Failed to send message"
      );
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
    effectiveresponseId,
    error,
    condition: normalizedCondition,
  };
};
