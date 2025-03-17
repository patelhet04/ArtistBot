import { useState, useRef } from "react";
import axios from "axios";

/**
 * Custom hook for handling logo uploads
 * @param {string} responseId - The user ID
 * @returns {object} - Logo submission state and handlers
 */
export const useLogoSubmission = (responseId) => {
  const [finalLogoFile, setFinalLogoFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Allowed file types & size
  const MAX_FILE_SIZE_MB = 5; // 5MB limit
  const ALLOWED_FILE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
  ];

  // ✅ Validate file before setting state
  const validateFile = (file) => {
    if (!file) return false;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError("Invalid file type. Please upload a PNG, JPG, or SVG.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File is too large. Max size: ${MAX_FILE_SIZE_MB}MB.`);
      return false;
    }

    return true;
  };

  // ✅ Handle file selection
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
      setFinalLogoFile(file);
      setUploadError(null);
      setUploadSuccess(false); // Reset success state when a new file is selected
    }
  };

  // ✅ Drag & Drop Handlers
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
      if (validateFile(file)) {
        setFinalLogoFile(file);
        setUploadError(null);
        setUploadSuccess(false); // Reset success state when a new file is dropped
      }
    }
  };

  // ✅ Open file dialog on button click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // ✅ Submit the logo file
  const handleFinalSubmit = async () => {
    if (!finalLogoFile) {
      setUploadError("Please upload a logo file to submit.");
      console.warn("⚠️ No file selected for upload.");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false); // Reset success state when submitting

    try {
      const formData = new FormData();
      formData.append("responseId", responseId);
      formData.append("logoFile", finalLogoFile);

      console.log("🚀 Uploading final logo...");
      const response = await axios.post("/api/logos/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Final logo submitted successfully:", response.data);
      setUploadSuccess(true);
      setFinalLogoFile(null); // ✅ Reset file after successful upload
      fileInputRef.current.value = null; // ✅ Reset input field
    } catch (error) {
      console.error("❌ Error submitting final logo:", error);
      setUploadError(
        error.response?.data?.message ||
          "⚠️ Failed to upload logo. Please try again."
      );
    } finally {
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
