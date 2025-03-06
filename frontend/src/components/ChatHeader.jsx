// src/components/Chat/ChatHeader.jsx
import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  SmartToy as SmartToyIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { ChatHeader as Header, TimerDisplay } from "../styles/StyledComponents";
import { formatTime } from "../utils/imageUtils";

const ChatHeader = ({ timeLeft }) => {
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
          {/* Left Side: Icon + Title */}
          <Box display="flex" alignItems="center">
            <SmartToyIcon
              sx={{
                mr: 1.5,
                fontSize: 32,
                color: theme.palette.primary.main,
              }}
            />
            <Typography variant="h5" fontWeight="bold">
              Logo Design
            </Typography>
          </Box>

          {/* Right Side: Timer */}
          <TimerDisplay timeLeft={timeLeft}>
            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body1" fontWeight="medium">
              {formatTime(timeLeft)}
            </Typography>
          </TimerDisplay>
        </Box>

        {/* Timer Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={timerPercentage}
          sx={{
            width: "100%",
            mt: 1.5,
            height: 4,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.grey[300], 0.5),
            "& .MuiLinearProgress-bar": {
              backgroundColor:
                timeLeft <= 300
                  ? theme.palette.error.main
                  : theme.palette.primary.main,
            },
          }}
        />
      </Box>
    </Header>
  );
};

export default ChatHeader;
