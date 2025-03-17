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
  const handleDownloadClick = async (imageUrl) => {
    if (!imageUrl) {
      console.warn("⚠️ No image URL provided for download.");
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
      const filename = `logo-${timestamp}.png`;

      console.log(`📥 Initiating download for: ${filename}`);
      await downloadLogo(imageUrl, filename);
    } catch (error) {
      console.error("❌ Error in handleDownloadClick:", error);
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
