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
  Zoom,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Send as SendIcon,
  Image as ImageIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(56);

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
        setIsGeneratingLogo(true);
      } else if (
        lastMessage.role === "assistant" &&
        lastMessage.images &&
        lastMessage.images.length > 0
      ) {
        setIsGeneratingLogo(false);
      }
    }
  }, [messages]);

  // Reset generation state when response is complete
  useEffect(() => {
    if (!loadingResponse) {
      setIsGeneratingLogo(false);
    }
  }, [loadingResponse]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGeneratingLogo]);

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

  // Function to handle input height adjustment
  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Auto adjust height (reset first) with stricter limits
    e.target.style.height = "auto";
    const newHeight = Math.min(80, Math.max(36, e.target.scrollHeight));
    e.target.style.height = `${newHeight}px`;
    setTextareaHeight(newHeight);
  };

  return (
    <ChatBoxContainer sx={{ mt: 0 }}>
      {error && (
        <Fade in={!!error}>
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "error.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="error.dark" variant="body2" fontWeight="medium">
              {error}
            </Typography>
          </Box>
        </Fade>
      )}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          height: "100%",
        }}
      >
        <MessagesWrapper>
          {initialLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <CircularProgress size={40} thickness={4} />
              <Typography variant="body2" color="text.secondary">
                Loading conversation...
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((message, index) => (
                <Zoom
                  in={true}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    transitionDuration: "350ms",
                  }}
                  key={index}
                >
                  <MessageBubble
                    isUser={message.role === "user"}
                    sx={{
                      mb: 2.5,
                      position: "relative",
                      pl: message.role === "user" ? 2 : 2.5,
                      pr: message.role === "user" ? 2.5 : 2,
                    }}
                  >
                    {!isMobile && (
                      <Avatar
                        sx={{
                          position: "absolute",
                          left:
                            message.role === "user"
                              ? "calc(100% + 10px)"
                              : "-32px",
                          top: "5px",
                          width: 24,
                          height: 24,
                          bgcolor:
                            message.role === "user"
                              ? "primary.main"
                              : "grey.300",
                          zIndex: 1,
                        }}
                      >
                        {message.role === "user" ? (
                          <PersonIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <SmartToyIcon sx={{ fontSize: 12 }} />
                        )}
                      </Avatar>
                    )}

                    <Box
                      sx={{
                        lineHeight: 1.6,
                        color: "text.primary",
                        fontSize: "0.9rem",
                        "& p": {
                          fontSize: "0.9rem",
                        },
                        "& ul, & ol": {
                          fontSize: "0.9rem",
                        },
                        "& li": {
                          fontSize: "0.9rem",
                        },
                        "& blockquote": {
                          fontSize: "0.9rem",
                        },
                      }}
                    >
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </Box>

                    {message.images && message.images.length > 0 && (
                      <Grid container spacing={1.5} sx={{ mt: 2 }}>
                        {message.images.map((image, imgIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={imgIndex}>
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
                </Zoom>
              ))}

              {/* Logo Generation Indicator */}
              <Fade in={isGeneratingLogo && loadingResponse} timeout={800}>
                <Box
                  sx={{
                    display:
                      isGeneratingLogo && loadingResponse ? "block" : "none",
                  }}
                >
                  <MessageBubble
                    isUser={false}
                    sx={{
                      mb: 2.5,
                      display: "flex",
                      alignItems: "center",
                      pl: 3,
                      pr: 3,
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        gap: 1.5,
                      }}
                    >
                      <CircularProgress
                        size={30}
                        thickness={4}
                        sx={{ color: "primary.main" }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        align="center"
                      >
                        Creating your logo design...
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        align="center"
                      >
                        This process may take up to a minute
                      </Typography>
                    </Box>
                  </MessageBubble>
                </Box>
              </Fade>

              <div ref={messagesEndRef} />
            </>
          )}
        </MessagesWrapper>

        <InputWrapper
          disabled={sessionEnded || loadingResponse}
          sx={{
            position: "relative",
            bottom: 0,
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={2}
            variant="outlined"
            placeholder={
              sessionEnded ? "Session has ended" : "Type your message here..."
            }
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
                backgroundColor: "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "transparent",
                },
                "&.Mui-focused": {
                  backgroundColor: "transparent",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              },
              flex: 1,
              mx: 0.5,
            }}
            InputProps={{
              sx: {
                py: 0.25,
                px: 1,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                height: "auto",
                minHeight: "36px",
                maxHeight: "80px",
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sessionEnded || loadingResponse}
                    sx={{
                      color: "#5f6368",
                      opacity: sessionEnded || loadingResponse ? 0.5 : 1,
                      transition: "all 0.2s ease",
                      padding: "6px",
                      marginRight: "4px",
                      backgroundColor: "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                      width: "32px",
                      height: "32px",
                      minWidth: "32px",
                    }}
                    size="small"
                  >
                    <ImageIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <SendButton
                    onClick={sendMessage}
                    disabled={!input.trim() || sessionEnded || loadingResponse}
                    sx={{
                      opacity:
                        !input.trim() || sessionEnded || loadingResponse
                          ? 0.7
                          : 1,
                      width: "32px",
                      height: "32px",
                      minWidth: "32px",
                    }}
                  >
                    {loadingResponse ? (
                      <CircularProgress
                        size={14}
                        thickness={2}
                        sx={{ color: "white" }}
                      />
                    ) : (
                      <SendIcon
                        sx={{ fontSize: 16, transform: "translateX(1px)" }}
                      />
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
      </Box>
    </ChatBoxContainer>
  );
};

export default ChatBox;
