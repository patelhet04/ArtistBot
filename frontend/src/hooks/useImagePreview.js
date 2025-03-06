// src/components/Chat/hooks/useImagePreview.js
import { useState } from "react";
import { downloadLogo } from "../utils/imageUtils";

/**
 * Custom hook for image preview functionality
 * @returns {object} - Image preview state and handlers
 */
export const useImagePreview = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedLogo, setSelectedLogo] = useState(null);

  // Open preview dialog
  const openPreview = (url) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  // Close preview dialog
  const closePreview = () => {
    setPreviewOpen(false);
  };

  // Handle logo selection
  const handleLogoClick = (url) => {
    setSelectedLogo(url === selectedLogo ? null : url);
  };

  // Handle download button click
  const handleDownloadClick = (imageUrl) => {
    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
      const filename = `logo-${timestamp}.png`;
      downloadLogo(imageUrl, filename);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image. The link may have expired.");
    }
  };

  return {
    previewOpen,
    previewUrl,
    selectedLogo,
    openPreview,
    closePreview,
    handleLogoClick,
    handleDownloadClick,
    setSelectedLogo,
  };
};
