// src/components/Chat/hooks/useLogoSubmission.js
import { useState, useRef } from "react";
import axios from "axios";

/**
 * Custom hook for handling logo uploads
 * @param {string} userId - The user ID
 * @returns {object} - Logo submission state and handlers
 */
export const useLogoSubmission = (userId) => {
  const [finalLogoFile, setFinalLogoFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFinalLogoFile(file);
      setUploadError(null);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFinalLogoFile(file);
      setUploadError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Submit the logo
  const handleFinalSubmit = async () => {
    if (!finalLogoFile) {
      setUploadError("Please upload a logo file to submit");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("logoFile", finalLogoFile);

      const response = await axios.post("/api/logos/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Final logo submitted successfully:", response.data);
      setUploadSuccess(true);
      setUploadLoading(false);
    } catch (error) {
      console.error("Error submitting final logo:", error);
      setUploadError(
        error.response?.data?.message ||
          "Failed to upload logo. Please try again."
      );
      setUploadLoading(false);
    }
  };

  return {
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
    setFinalLogoFile,
    setUploadError,
  };
};
