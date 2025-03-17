// src/components/Chat/ChatBox.jsx - Fixed instruction box width
import React, { useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import { Send as SendIcon, Image as ImageIcon, Info as InfoIcon } from "@mui/icons-material";
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
}) => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ChatBoxContainer>
      <MessagesWrapper>
        {initialLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={30} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading conversation...
            </Typography>
          </Box>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={idx} isUser={msg.role === "user"}>
              <Typography variant="body1">{msg.content}</Typography>

              {/* Display logo if message has images */}
              {msg.role === "assistant" &&
                msg.images &&
                msg.images.length > 0 && (
                  <Box sx={{ mt: 2, width: "100%", maxWidth: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: "column", width: "100%" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 0.5, fontWeight: "bold" }}
                      >
                        Generated Logo:
                      </Typography>
                      
                      {/* Download instructions - fixed width */}
                      <Paper
                        variant="outlined"
                        sx={{
                          mb: 1.5,
                          px: 1.5,
                          py: 1,
                          fontSize: "0.75rem",
                          color: "text.secondary",
                          bgcolor: "rgba(0, 0, 0, 0.02)",
                          boxSizing: "border-box",
                          width: "100%",
                          maxWidth: "100%",
                          display: "flex",
                          alignItems: "flex-start",
                          alignSelf: "stretch",
                        }}
                      >
                        <InfoIcon 
                          fontSize="small" 
                          sx={{ 
                            mr: 1, 
                            fontSize: "0.9rem", 
                            mt: "1px",
                            color: "action.active",
                            flexShrink: 0,
                          }} 
                        />
                        <Typography 
                          variant="caption"
                          sx={{
                            wordBreak: "break-word",
                            width: "100%",
                          }}
                        >
                          Click "Download" to open the image in a new tab, or right-click on the image to save it directly.
                        </Typography>
                      </Paper>
                    </Box>

                    <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
                      {msg.images.map((imgUrl, imgIdx) => (
                        <GeneratedLogoItem
                          key={imgIdx}
                          logoUrl={imgUrl}
                          isSelected={imgUrl === selectedLogo}
                          handleLogoClick={handleLogoClick}
                          openPreview={openPreview}
                          handleDownloadClick={handleDownloadClick}
                        />
                      ))}
                    </Grid>
                  </Box>
                )}
            </MessageBubble>
          ))
        )}

        {loadingResponse && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={30} />
          </Box>
        )}

        <div ref={messagesEndRef} />
      </MessagesWrapper>

      <InputWrapper disabled={sessionEnded}>
        <TextField
          fullWidth
          label="Ask your creative assistant anything"
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={3}
          disabled={loadingResponse || sessionEnded}
          sx={{ backgroundColor: "#fff", borderRadius: 6 }}
          InputProps={{
            endAdornment: condition === "personalized" && (
              <InputAdornment position="end">
                <IconButton
                  component="label"
                  size="small"
                  disabled={sessionEnded}
                >
                  <ImageIcon />
                  <input
                    type="file"
                    hidden
                    onChange={(e) => console.log(e.target.files[0])}
                    ref={fileInputRef}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <SendButton
          variant="contained"
          onClick={sendMessage}
          disabled={!input.trim() || loadingResponse || sessionEnded}
          startIcon={
            loadingResponse ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
        >
          {loadingResponse ? "Generating..." : "Send"}
        </SendButton>
      </InputWrapper>
    </ChatBoxContainer>
  );
};

export default ChatBox;