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
    <SidePanel>
      <Typography variant="h6" gutterBottom>
        Submit Final Logo
      </Typography>

      {/* Add a download button if we have a selected logo URL */}
      {selectedLogoUrl && (
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={handleLogoDownload}
          startIcon={<DownloadIcon />}
          sx={{ mb: 1.5 }}
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
        sx={{ py: 2 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept="image/*"
        />

        <CloudUploadIcon
          fontSize="large"
          color={finalLogoFile ? "success" : "action"}
          sx={{ mb: 1 }}
        />

        {finalLogoFile ? (
          <Typography variant="body2" color="success.main">
            File selected: {finalLogoFile.name}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center">
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
            mt: 1.5,
            p: 1.5,
            border: `1px solid #e0e0e0`,
            borderRadius: 1,
            textAlign: "center",
            bgcolor: "rgba(0,0,0,0.02)",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Selected Logo:
          </Typography>
          <Box
            component="img"
            src={URL.createObjectURL(finalLogoFile)}
            alt="Selected Logo"
            sx={{
              maxWidth: "100%",
              maxHeight: 120,
              objectFit: "contain",
            }}
          />
        </Box>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {uploadError}
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
            <CircularProgress size={20} color="inherit" />
          ) : (
            <CloudUploadIcon />
          )
        }
        sx={{ mt: 1 }}
      >
        {uploadLoading ? "Uploading..." : "Submit Logo"}
      </Button>
    </SidePanel>
  );
};

export default UploadPanel;
