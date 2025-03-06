// src/components/Chat/styles/StyledComponents.jsx
import { styled, alpha } from "@mui/material/styles";
import { Box, Paper, Button, Card } from "@mui/material";

// Main container
export const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '1000px', // Reduced from 1200px
  width: "100%",
  margin: "0 auto",
  padding: theme.spacing(3),
  position: "relative",
}));

// Header styling
export const ChatHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  borderBottom: `2px solid ${theme.palette.grey[300]}`,
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(10px)",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
}));

export const TimerDisplay = styled(Box)(({ theme, timeLeft }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.75, 2),
  backgroundColor:
    timeLeft <= 300
      ? alpha(theme.palette.error.main, 0.1)
      : alpha(theme.palette.primary.main, 0.1),
  borderRadius: 20,
  border:
    timeLeft <= 300
      ? `1px solid ${alpha(theme.palette.error.main, 0.3)}`
      : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  color:
    timeLeft <= 300 ? theme.palette.error.main : theme.palette.primary.main,
  transition: "all 0.3s ease",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}));

// Reference images
export const ImagesPreviewContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: "#fff",
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  marginBottom: theme.spacing(3),
}));

// Chat area styling
export const MainContentWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2.5),
  marginTop: theme.spacing(3),
  alignItems: "stretch", // Make children fill the container height
  height: "calc(100vh - 350px)", // Set a specific height (adjust the value as needed)
}));

export const ChatSection = styled(Box)(({ theme }) => ({
  flex: 7, // Keep your current flex value
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column', // Arrange children vertically
}));

export const SideSection = styled(Box)(({ theme }) => ({
  flex: 1, // Keep your current flex value
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  minWidth: 300, // Keep your current width
  justifyContent: 'space-between', // This pushes the upload panel to the bottom
}));

export const ChatBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%", // Fill available height
  overflow: "hidden",
  borderRadius: 10,
  backgroundColor: "#f8f9fa",
  boxShadow: "0px 3px 15px rgba(0, 0, 0, 0.1)",
}));

export const MessagesWrapper = styled(Paper)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: "#ffffff",
  borderRadius: "10px 10px 0 0",
  boxShadow: "none",
  border: `1px solid ${theme.palette.grey[300]}`,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

export const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 10,
  maxWidth: "85%",
  alignSelf: isUser ? "flex-end" : "flex-start",
  backgroundColor: isUser ? "#e3f2fd" : "#f1f3f4",
  boxShadow: isUser ? theme.shadows[2] : theme.shadows[1],
}));

export const InputWrapper = styled(Box)(({ theme, disabled }) => ({
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "center",
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(10px)",
  padding: theme.spacing(1.5),
  borderRadius: "0 0 10px 10px",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.12)",
  filter: disabled ? "blur(3px)" : "none",
  pointerEvents: disabled ? "none" : "auto",
}));

export const SendButton = styled(Button)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: "#fff",
  borderRadius: 8,
  padding: "10px 20px",
  transition: "0.3s",
  boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    background: theme.palette.primary.dark,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
  },
}));

// Logo display styling
export const LogoCard = styled(Paper)(({ theme, selected }) => ({
  position: "relative",
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : "2px solid transparent",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
}));

export const LogoImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  objectFit: "contain",
}));

export const LogoControls = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginTop: theme.spacing(1),
  gap: theme.spacing(1),
}));

// Panel styling
export const SidePanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
  backgroundColor: "white",
}));

// Upload styling
export const UploadZone = styled(Box)(({ theme, isDragActive, hasFile }) => ({
  border: `2px dashed ${
    isDragActive
      ? theme.palette.primary.main
      : hasFile
      ? theme.palette.success.main
      : theme.palette.grey[400]
  }`,
  borderRadius: 8,
  padding: theme.spacing(3),
  backgroundColor: isDragActive
    ? alpha(theme.palette.primary.main, 0.05)
    : hasFile
    ? alpha(theme.palette.success.main, 0.05)
    : alpha(theme.palette.grey[100], 0.5),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  marginBottom: theme.spacing(2),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
  },
}));