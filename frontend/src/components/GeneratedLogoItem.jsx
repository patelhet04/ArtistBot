// src/components/Chat/GeneratedLogoItem.jsx
import React from "react";
import {
  Grid,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { LogoCard, LogoImage, LogoControls } from "../styles/StyledComponents";

const GeneratedLogoItem = ({
  logoUrl,
  isSelected,
  handleLogoClick,
  openPreview,
  handleDownloadClick,
}) => {
  return (
    <Grid item xs={12}>
      <LogoCard
        selected={isSelected}
        onClick={() => handleLogoClick(logoUrl)}
        elevation={isSelected ? 4 : 1}
      >
        <LogoImage src={logoUrl} alt="Generated Logo" />

        <Box
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            display: "flex",
            gap: 0.5,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: "4px",
            p: 0.5,
          }}
        >
          <Tooltip title="Preview">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                openPreview(logoUrl);
              }}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadClick(logoUrl);
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </LogoCard>

      <LogoControls>
        <Button
          variant="contained"
          size="small"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={() => handleDownloadClick(logoUrl)}
        >
          Download
        </Button>
      </LogoControls>
    </Grid>
  );
};

export default GeneratedLogoItem;
