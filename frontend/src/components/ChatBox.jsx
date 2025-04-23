// src/components/Chat/ChatBox.jsx - Fixed instruction box width
import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
  Paper,
  Fade,
} from "@mui/material";
import { Send as SendIcon, Image as ImageIcon } from "@mui/icons-material";
import {
  ChatBox as ChatBoxContainer,
  MessagesWrapper,
  MessageBubble,
  InputWrapper,
  SendButton,
} from "../styles/StyledComponents";
import GeneratedLogoItem from "./GeneratedLogoItem";

const ChatBox = ({
  messages,
  input,
  setInput,
  sendMessage,
  handleKeyDown,
  loadingResponse,
  sessionEnded,
  initialLoading,
  selectedLogo,
  handleLogoClick,
  openPreview,
  handleDownloadClick,
  condition,
  error,
}) => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  // Detect if logo generation is in progress based on the last message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const containsLogoKeywords =
        lastMessage.content.toLowerCase().includes("logo") ||
        lastMessage.content.toLowerCase().includes("generate") ||
        lastMessage.content.toLowerCase().includes("create") ||
        lastMessage.content.toLowerCase().includes("design");

      if (lastMessage.role === "user" && containsLogoKeywords) {
        console.log("Logo generation detected, showing indicator");
        setIsGeneratingLogo(true);
      } else if (
        lastMessage.role === "assistant" &&
        lastMessage.images &&
        lastMessage.images.length > 0
      ) {
        console.log("Logo received, hiding indicator");
        setIsGeneratingLogo(false);
      }
    }
  }, [messages]);

  // Reset generation state when response is complete
  useEffect(() => {
    if (!loadingResponse) {
      console.log("Loading response completed, hiding indicator");
      setIsGeneratingLogo(false);
    } else if (loadingResponse) {
      console.log(
        "Loading response started, indicator state:",
        isGeneratingLogo
      );
    }
  }, [loadingResponse, isGeneratingLogo]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file upload
  const handleFileUpload = (file) => {
    // Create a message with the file
    const message = {
      role: "user",
      content: "I've uploaded an image for reference",
      images: [file],
    };
    // Add the message to the chat
    sendMessage(message);
  };

  return (
    <ChatBoxContainer>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="caption">
            {error}
          </Typography>
        </Box>
      )}
      <MessagesWrapper>
        {initialLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                isUser={message.role === "user"}
                sx={{ mb: 2 }}
              >
                <Typography variant="body1">{message.content}</Typography>
                {message.images && message.images.length > 0 && (
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {message.images.map((image, imgIndex) => (
                      <Grid item xs={6} sm={4} key={imgIndex}>
                        <GeneratedLogoItem
                          logoUrl={image}
                          isSelected={selectedLogo === image}
                          handleLogoClick={handleLogoClick}
                          openPreview={openPreview}
                          handleDownloadClick={handleDownloadClick}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </MessageBubble>
            ))}

            {/* Logo Generation Indicator */}
            {isGeneratingLogo && loadingResponse && (
              <MessageBubble
                isUser={false}
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                <CircularProgress size={20} sx={{ mr: 1.5 }} />
                <Typography variant="body2">
                  Generating your logo... This may take a moment.
                </Typography>
              </MessageBubble>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesWrapper>

      <InputWrapper>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={
            sessionEnded ? "Session has ended" : "Type your message here..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sessionEnded || loadingResponse}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sessionEnded || loadingResponse}
                >
                  <ImageIcon />
                </IconButton>
                <SendButton
                  onClick={sendMessage}
                  disabled={!input.trim() || sessionEnded || loadingResponse}
                >
                  {loadingResponse ? (
                    <CircularProgress size={24} />
                  ) : (
                    <SendIcon />
                  )}
                </SendButton>
              </InputAdornment>
            ),
          }}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </InputWrapper>
    </ChatBoxContainer>
  );
};

export default ChatBox;
