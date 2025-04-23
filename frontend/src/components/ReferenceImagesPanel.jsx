// src/components/Chat/ReferenceImagesPanel.jsx
// Update the styling to match the new layout

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { ImagesPreviewContainer } from "../styles/StyledComponents";

const ReferenceImagesPanel = ({
  condition,
  images,
  loadingImages,
  openPreview,
}) => {
  // Show for both personalized conditions (p and f)
  if (condition !== "p" && condition !== "f") return null;

  return (
    <ImagesPreviewContainer
      sx={{
        mb: 2,
        mt: 1,
        py: 1.5,
        px: 2,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle1" fontWeight="medium" sx={{ mr: 2 }}>
        Your Style Reference:
      </Typography>

      {loadingImages ? (
        <CircularProgress size={24} />
      ) : images && images.length > 0 ? (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {images.map((img, index) => (
            <Box
              key={index}
              component="img"
              src={img.url}
              alt={`User Image ${index + 1}`}
              sx={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: 1.5,
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              onClick={() => openPreview(img.url)}
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No reference images available
        </Typography>
      )}
    </ImagesPreviewContainer>
  );
};

export default ReferenceImagesPanel;
