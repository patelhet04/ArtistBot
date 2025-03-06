// src/components/Chat/ImagePreviewDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

const ImagePreviewDialog = ({
  open,
  onClose,
  imageUrl,
  handleDownloadClick,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Logo Preview</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          component="img"
          src={imageUrl}
          alt="Logo Preview"
          sx={{
            width: "100%",
            height: "auto",
            maxHeight: "70vh",
            objectFit: "contain",
            display: "block",
            margin: "0 auto",
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => handleDownloadClick(imageUrl)}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImagePreviewDialog;
