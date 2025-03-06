// src/components/Chat/UploadPanel.jsx
// Update the upload panel to match the new styling

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
} from "@mui/icons-material";
import { SidePanel, UploadZone } from "../styles/StyledComponents";

const UploadPanel = ({
  finalLogoFile,
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
  return (
    <SidePanel>
      <Typography variant="h6" gutterBottom>
        Submit Final Logo
      </Typography>

      {uploadSuccess ? (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 50, mb: 1.5 }} />
          <Typography variant="body1">
            Logo submitted successfully! Thank you for your participation.
          </Typography>
        </Box>
      ) : (
        <>
          {/* <Typography variant="body2" sx={{ mb: 1.5 }}>
            Download your favorite generated logo, then upload it here to submit
            as your final design.
          </Typography> */}

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
        </>
      )}
    </SidePanel>
  );
};

export default UploadPanel;
