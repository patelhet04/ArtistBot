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
  Build as ToolsIcon,
} from "@mui/icons-material";
import { SidePanel } from "../styles/StyledComponents";

const InstructionsPanel = () => {
  return (
    <SidePanel sx={{ py: 1 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ mb: 0.5, fontSize: "1.1rem" }}
      >
        Instructions
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5, fontSize: "0.85rem" }}>
        Use this creative assistant to help design your logo. You can:
      </Typography>

      <List dense disablePadding sx={{ ml: -0.5, mb: 0.5 }}>
        <ListItem dense sx={{ py: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 26 }}>
            <QuestionIcon
              fontSize="small"
              color="primary"
              sx={{ fontSize: "0.9rem" }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Ask for creative suggestions"
            primaryTypographyProps={{ variant: "body2", fontSize: "0.8rem" }}
          />
        </ListItem>

        <ListItem dense sx={{ py: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 26 }}>
            <DesignIcon
              fontSize="small"
              color="primary"
              sx={{ fontSize: "0.9rem" }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Request specific design"
            primaryTypographyProps={{ variant: "body2", fontSize: "0.8rem" }}
          />
        </ListItem>

        <ListItem dense sx={{ py: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 26 }}>
            <FeedbackIcon
              fontSize="small"
              color="primary"
              sx={{ fontSize: "0.9rem" }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Get feedback on your ideas"
            primaryTypographyProps={{ variant: "body2", fontSize: "0.8rem" }}
          />
        </ListItem>

        <ListItem dense sx={{ py: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 26 }}>
            <GenerateIcon
              fontSize="small"
              color="primary"
              sx={{ fontSize: "0.9rem" }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Generate logo options"
            primaryTypographyProps={{ variant: "body2", fontSize: "0.8rem" }}
          />
        </ListItem>

        <ListItem dense sx={{ py: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 26 }}>
            <ToolsIcon
              fontSize="small"
              color="primary"
              sx={{ fontSize: "0.9rem" }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Use external tools to create & modify logo"
            primaryTypographyProps={{ variant: "body2", fontSize: "0.8rem" }}
          />
        </ListItem>
      </List>

      <Typography
        variant="h6"
        gutterBottom
        sx={{ mb: 0.5, mt: 0.5, fontSize: "1.1rem" }}
      >
        Task
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
        Your task is to create a logo for a Local Farmers' Market.
      </Typography>
    </SidePanel>
  );
};

export default InstructionsPanel;
