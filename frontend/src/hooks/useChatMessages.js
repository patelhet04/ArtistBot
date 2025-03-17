// src/components/Chat/hooks/useChatMessages.js
import { useState, useEffect } from "react";
import axios from "axios";

export const useChatMessages = (responseId, condition, timeLeft) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [temporaryId] = useState(() => {
    if (!responseId) {
      return `temp_${Math.random().toString(36).substring(2, 15)}`;
    }
    return null;
  });

  const effectiveresponseId = responseId || temporaryId;

  // Fetch initial greeting
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);
    console.log(
      `Fetching greeting for responseId: ${effectiveresponseId}, condition: ${condition}`
    );

    axios
      .post(`/api/greeting`, {
        responseId: effectiveresponseId,
        condition: condition || "general",
      })
      .then((res) => {
        if (isMounted) {
          setMessages([
            {
              role: "assistant",
              content: res.data.reply,
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
    }; // Cleanup to prevent state updates after unmount
  }, [effectiveresponseId, condition]);

  const sendMessage = async () => {
    if (timeLeft <= 0 || !input.trim() || loadingResponse) return;

    try {
      setLoadingResponse(true);
      const payload = {
        responseId: effectiveresponseId,
        message: input,
        condition: condition || "general",
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
  };
};
