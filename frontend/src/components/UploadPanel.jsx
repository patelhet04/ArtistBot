// src/components/Chat/UploadPanel.jsx
// Updated to properly handle image downloading

import React from "react";
import {
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { SidePanel, UploadZone } from "../styles/StyledComponents";
import { downloadLogo } from "../utils/imageUtils";

const UploadPanel = ({
  finalLogoFile,
  selectedLogoUrl, // Add this prop to receive the URL of the selected logo
  uploadLoading,
  uploadSuccess,
  uploadError,
  isDragActive,
  fileInputRef,
  handleFileUpload,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleUploadClick,
  handleFinalSubmit,
}) => {
  // Function to handle logo download
  const handleLogoDownload = async () => {
    if (selectedLogoUrl) {
      await downloadLogo(selectedLogoUrl, `generated_logo_${Date.now()}.png`);
    }
  };

  return (
    <SidePanel sx={{ py: 1 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ mb: 0.5, fontSize: "1.1rem" }}
      >
        Submit Final Logo
      </Typography>

      {/* Add a download button if we have a selected logo URL */}
      {selectedLogoUrl && (
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={handleLogoDownload}
          startIcon={<DownloadIcon fontSize="small" />}
          sx={{ mb: 0.75, py: 0.25, height: 30 }}
          size="small"
        >
          Download Selected Logo
        </Button>
      )}

      <UploadZone
        isDragActive={isDragActive}
        hasFile={!!finalLogoFile}
        onClick={handleUploadClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{ py: 0.75 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept="image/*"
        />

        <CloudUploadIcon
          fontSize="small"
          color={finalLogoFile ? "success" : "action"}
          sx={{ mb: 0.25, fontSize: "1rem" }}
        />

        {finalLogoFile ? (
          <Typography variant="body2" color="success.main" fontSize="0.75rem">
            File selected: {finalLogoFile.name}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ fontSize: "0.75rem" }}
          >
            {isDragActive
              ? "Drop your file here!"
              : "Click or drag and drop a file here"}
          </Typography>
        )}
      </UploadZone>

      {/* Preview */}
      {finalLogoFile && (
        <Box
          sx={{
            mt: 0.75,
            p: 0.75,
            border: `1px solid #e0e0e0`,
            borderRadius: 1,
            textAlign: "center",
            bgcolor: "rgba(0,0,0,0.02)",
          }}
        >
          <Typography
            variant="subtitle2"
            gutterBottom
            fontSize="0.8rem"
            sx={{ mb: 0.5 }}
          >
            Selected Logo:
          </Typography>
          <Box
            component="img"
            src={URL.createObjectURL(finalLogoFile)}
            alt="Selected Logo"
            sx={{
              maxWidth: "100%",
              maxHeight: 90,
              objectFit: "contain",
            }}
          />
        </Box>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mt: 0.75, py: 0.25 }}>
          <Typography fontSize="0.75rem">{uploadError}</Typography>
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleFinalSubmit}
        disabled={!finalLogoFile || uploadLoading}
        startIcon={
          uploadLoading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <CloudUploadIcon fontSize="small" sx={{ fontSize: "0.9rem" }} />
          )
        }
        sx={{ mt: 1, py: 0.25, height: 30 }}
        size="small"
      >
        {uploadLoading ? "Uploading..." : "Submit Logo"}
      </Button>
    </SidePanel>
  );
};

export default UploadPanel;
