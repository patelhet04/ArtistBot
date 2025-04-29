// src/components/Chat/ChatHeader.jsx
import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  SmartToy as SmartToyIcon,
  AccessTime as AccessTimeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Brush as BrushIcon,
  AutoAwesome as SparkleIcon,
} from "@mui/icons-material";
import { ChatHeader as Header, TimerDisplay } from "../styles/StyledComponents";
import { formatTime } from "../utils/imageUtils";

const ChatHeader = ({ timeLeft, isMobile, showSidebar, toggleSidebar }) => {
  const theme = useTheme();
  const timerPercentage = (timeLeft / 1800) * 100;

  return (
    <Header>
      <Box display="flex" flexDirection="column" width="100%">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          {/* Left Side: Logo + Title */}
          <Box
            display="flex"
            alignItems="center"
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.08
              )} 0%, ${alpha(theme.palette.primary.light, 0.12)} 100%)`,
              borderRadius: "12px",
              padding: { xs: "8px 12px", sm: "8px 16px" },
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.primary.main,
                borderRadius: "10px",
                padding: "8px",
                mr: 1.5,
              }}
            >
              <BrushIcon
                sx={{
                  fontSize: { xs: 20, sm: 24 },
                  color: "#fff",
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: "1.1rem", sm: "1.4rem" },
                  lineHeight: 1.2,
                  color: theme.palette.primary.dark,
                }}
              >
                Logo Designer
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                  color: theme.palette.text.secondary,
                  mt: 0.2,
                }}
              >
                AI-Powered Creative Assistant
              </Typography>
            </Box>
            <Tooltip title="AI-powered design tool">
              <SparkleIcon
                sx={{
                  ml: 1,
                  fontSize: 16,
                  color: theme.palette.primary.main,
                }}
              />
            </Tooltip>
          </Box>

          {/* Right Side: Timer and Mobile Menu Toggle */}
          <Box display="flex" alignItems="center" gap={1}>
            <TimerDisplay timeLeft={timeLeft}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body1" fontWeight="medium">
                {formatTime(timeLeft)}
              </Typography>
            </TimerDisplay>

            {/* Mobile Menu Toggle Button */}
            {isMobile && (
              <Tooltip title={showSidebar ? "Hide Menu" : "Show Menu"}>
                <IconButton
                  onClick={toggleSidebar}
                  sx={{
                    ml: 1,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  {showSidebar ? (
                    <CloseIcon sx={{ color: theme.palette.primary.main }} />
                  ) : (
                    <MenuIcon sx={{ color: theme.palette.primary.main }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Timer Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={timerPercentage}
          sx={{
            width: "100%",
            mt: 1.5,
            height: 5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.grey[300], 0.5),
            "& .MuiLinearProgress-bar": {
              backgroundColor:
                timeLeft <= 300
                  ? theme.palette.error.main
                  : theme.palette.primary.main,
              transition: "transform 1s linear",
            },
          }}
        />
      </Box>
    </Header>
  );
};

export default ChatHeader;
