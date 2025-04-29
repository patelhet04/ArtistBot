// src/components/Chat/ReferenceImagesPanel.jsx
// Update the styling to match the new layout

import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ImagesPreviewContainer } from "../styles/StyledComponents";

const ReferenceImagesPanel = ({
  condition,
  images,
  loadingImages,
  openPreview,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Show for both personalized conditions (p and f)
  if (condition !== "p" && condition !== "f") return null;

  return (
    <ImagesPreviewContainer
      sx={{
        mb: 2,
        mt: 1,
        py: 1.5,
        px: { xs: 1.5, sm: 2 },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 2,
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight="600"
        color="primary.dark"
        sx={{
          mr: { xs: 0, sm: 2 },
          mb: { xs: 1, sm: 0 },
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
      >
        Your Style Reference:
      </Typography>

      {loadingImages ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            py: 1,
          }}
        >
          <CircularProgress size={24} thickness={4} />
        </Box>
      ) : images && images.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "nowrap",
            overflowX: "auto",
            width: "100%",
            py: 0.5,
            px: 0.5,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              height: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0,0,0,0.05)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.primary.light,
              borderRadius: "4px",
            },
          }}
        >
          {images.map((img, index) => (
            <Box
              key={index}
              component="img"
              src={img.url}
              alt={`User Image ${index + 1}`}
              sx={{
                width: { xs: 70, sm: 80 },
                height: { xs: 70, sm: 80 },
                flexShrink: 0,
                objectFit: "cover",
                borderRadius: 2,
                boxShadow: "0px 3px 8px rgba(0,0,0,0.12)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: `2px solid transparent`,
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0px 6px 12px rgba(0,0,0,0.15)",
                  border: `2px solid ${theme.palette.primary.main}`,
                },
                "&:active": {
                  transform: "translateY(0px)",
                },
              }}
              onClick={() => openPreview(img.url)}
            />
          ))}
        </Box>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontStyle: "italic",
            py: 1,
          }}
        >
          No reference images available
        </Typography>
      )}
    </ImagesPreviewContainer>
  );
};

export default ReferenceImagesPanel;
