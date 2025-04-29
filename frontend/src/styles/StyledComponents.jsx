// src/components/Chat/styles/StyledComponents.jsx
import { styled, alpha } from "@mui/material/styles";
import { Box, Paper, Button, Card } from "@mui/material";

// Main container
export const ChatContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  maxWidth: "1000px",
  width: "100%",
  margin: "0 auto",
  padding: theme.spacing(3),
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

// Header styling
export const ChatHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2, 2.5),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",
  marginBottom: theme.spacing(2),
  position: "relative",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    borderRadius: "12px",
  },
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
  borderRadius: 30,
  border:
    timeLeft <= 300
      ? `1px solid ${alpha(theme.palette.error.main, 0.3)}`
      : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  color:
    timeLeft <= 300 ? theme.palette.error.main : theme.palette.primary.main,
  transition: "all 0.3s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  fontWeight: 600,
  animation: timeLeft <= 300 ? "pulse 2s infinite" : "none",
  "@keyframes pulse": {
    "0%": {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}`,
    },
    "70%": {
      boxShadow: `0 0 0 6px ${alpha(theme.palette.error.main, 0)}`,
    },
    "100%": {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}`,
    },
  },
}));

// Reference images
export const ImagesPreviewContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: "#fff",
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.07)",
  marginBottom: theme.spacing(3),
  overflowX: "auto",
  "&::-webkit-scrollbar": {
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#bbb",
    borderRadius: "3px",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    flexWrap: "nowrap",
  },
}));

// Chat area styling
export const MainContentWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  marginTop: theme.spacing(2),
  alignItems: "stretch",
  height: "calc(100vh - 250px)",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    height: "auto",
    gap: theme.spacing(2),
  },
}));

export const ChatSection = styled(Box)(({ theme }) => ({
  flex: 7,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("md")]: {
    flex: 1,
    marginBottom: theme.spacing(2),
    minHeight: "calc(100vh - 500px)",
  },
}));

export const SideSection = styled(Box)(({ theme }) => ({
  flex: 3,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
  minWidth: 260,
  maxWidth: 290,
  width: "100%",
  justifyContent: "flex-start",
  [theme.breakpoints.down("md")]: {
    flex: 1,
    minWidth: "100%",
    maxWidth: "100%",
  },
}));

export const ChatBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
}));

export const MessagesWrapper = styled(Paper)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2, 4),
  backgroundColor: "#ffffff",
  borderRadius: 12,
  boxShadow: "none",
  border: "none",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#bbb",
    borderRadius: "3px",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5, 2.5),
  },
}));

export const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(1.5),
  borderRadius: isUser ? "16px 16px 0 16px" : "16px 16px 16px 0",
  maxWidth: "70%",
  alignSelf: isUser ? "flex-end" : "flex-start",
  marginLeft: isUser ? 0 : theme.spacing(4),
  marginRight: isUser ? theme.spacing(4) : 0,
  backgroundColor: isUser ? alpha(theme.palette.primary.main, 0.08) : "#f8f9fa",
  border: isUser
    ? `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
    : `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
  boxShadow: isUser
    ? `0 2px 6px ${alpha(theme.palette.primary.main, 0.07)}`
    : "0 1px 3px rgba(0,0,0,0.03)",
  transition: "all 0.2s ease",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  fontSize: "0.9rem",
  "& img": {
    borderRadius: 8,
    maxWidth: "100%",
  },
  "& p": {
    margin: theme.spacing(0.5, 0),
    fontSize: "0.9rem",
  },
  "& code": {
    backgroundColor: alpha(theme.palette.grey[300], 0.3),
    padding: theme.spacing(0, 0.5),
    borderRadius: 3,
    fontFamily: "monospace",
    fontSize: "0.85rem",
  },
  "& pre": {
    backgroundColor: alpha(theme.palette.grey[300], 0.3),
    padding: theme.spacing(1),
    borderRadius: 4,
    overflowX: "auto",
    margin: theme.spacing(1, 0),
    fontSize: "0.85rem",
    "& code": {
      backgroundColor: "transparent",
      padding: 0,
      fontSize: "0.85rem",
    },
  },
  "& ul, & ol": {
    paddingLeft: theme.spacing(2.5),
    margin: theme.spacing(0.5, 0),
    fontSize: "0.9rem",
  },
  "& li": {
    fontSize: "0.9rem",
  },
  "& blockquote": {
    borderLeft: `3px solid ${alpha(theme.palette.grey[500], 0.5)}`,
    margin: theme.spacing(0.5, 0),
    paddingLeft: theme.spacing(1.5),
    color: theme.palette.text.secondary,
    fontSize: "0.9rem",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.25),
    maxWidth: "75%",
    fontSize: "0.85rem",
  },
}));

export const InputWrapper = styled(Box)(({ theme, disabled }) => ({
  display: "flex",
  alignItems: "center",
  background: "#f8f9fa",
  backdropFilter: "blur(10px)",
  padding: theme.spacing(0.75, 1.5),
  borderRadius: "24px",
  border: `1px solid #dadce0`,
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
  margin: theme.spacing(1),
  filter: disabled ? "blur(3px)" : "none",
  pointerEvents: disabled ? "none" : "auto",
  maxWidth: "100%",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.75),
  },
}));

export const SendButton = styled(Button)(({ theme }) => ({
  background: "#4086f4",
  color: "#fff",
  borderRadius: "50%",
  minWidth: 32,
  width: 32,
  height: 32,
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s ease",
  "&:hover": {
    background: "#3367d6",
    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.12)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
  "&.Mui-disabled": {
    background: "#e0e0e0",
    color: "#9e9e9e",
  },
  [theme.breakpoints.down("sm")]: {
    width: 30,
    height: 30,
    minWidth: 30,
  },
}));

// Logo display styling
export const LogoCard = styled(Paper)(({ theme, selected }) => ({
  position: "relative",
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : "2px solid transparent",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
  },
  "::before": selected
    ? {
        content: '""',
        position: "absolute",
        top: -12,
        right: -12,
        width: 28,
        height: 28,
        borderRadius: "50%",
        backgroundColor: theme.palette.primary.main,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'%3E%3C/path%3E%3C/svg%3E\")",
        backgroundSize: "18px",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.15)",
        zIndex: 1,
      }
    : {},
}));

export const LogoImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: "auto",
  borderRadius: theme.shape.borderRadius,
  objectFit: "contain",
  transition: "all 0.3s ease",
}));

export const LogoControls = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginTop: theme.spacing(1),
  gap: theme.spacing(1),
}));

// Panel styling
export const SidePanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.75),
  borderRadius: 12,
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.06)",
  backgroundColor: "white",
  transition: "all 0.3s ease",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  overflow: "visible",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  },
}));

// Upload styling
export const UploadZone = styled(Box)(({ theme, isDragActive, hasFile }) => ({
  border: `2px dashed ${
    isDragActive
      ? theme.palette.primary.main
      : hasFile
      ? theme.palette.success.main
      : theme.palette.grey[300]
  }`,
  borderRadius: 10,
  padding: theme.spacing(1.5),
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
  transition: "all 0.3s ease",
  marginBottom: theme.spacing(1.5),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
    transform: "translateY(-2px)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));
