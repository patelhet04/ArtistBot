// src/components/Chat/InstructionsPanel.jsx
// Add better styling to the instructions panel

import React from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  QuestionAnswer as QuestionIcon,
  DesignServices as DesignIcon,
  Feedback as FeedbackIcon,
  ImageSearch as GenerateIcon,
} from "@mui/icons-material";
import { SidePanel } from "../styles/StyledComponents";

const InstructionsPanel = () => {
  return (
    <SidePanel>
      <Typography variant="h6" gutterBottom>
        Instructions
      </Typography>
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        Use this creative assistant to help design your logo. You can:
      </Typography>

      <List dense disablePadding sx={{ ml: -1 }}>
        <ListItem dense>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <QuestionIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Ask for creative suggestions"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </ListItem>

        <ListItem dense>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <DesignIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Request specific design"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </ListItem>

        <ListItem dense>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <FeedbackIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Get feedback on your ideas"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </ListItem>

        <ListItem dense>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <GenerateIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Generate logo options"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </ListItem>
      </List>

      <Box sx={{ mt: 1, p: 0.5, bgcolor: "primary.50", borderRadius: 1 }}>
        <Typography variant="body2">
          When you find a logo you like, download it and submit it using the
          panel below.
        </Typography>
      </Box>
    </SidePanel>
  );
};

export default InstructionsPanel;
