// src/components/Chat/index.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Box } from "@mui/material";

// Import components
import ChatHeader from "./ChatHeader";
import ReferenceImagesPanel from "./ReferenceImagesPanel";
import ChatBox from "./ChatBox";
import InstructionsPanel from "./InstructionsPanel";
import UploadPanel from "./UploadPanel";
import ImagePreviewDialog from "./ImagePreviewDialog";

// Import styled components
import {
  ChatContainer,
  MainContentWrapper,
  ChatSection,
  SideSection,
} from "../styles/StyledComponents";

// Import custom hooks
import { useChatMessages } from "../hooks/useChatMessages";
import { useLogoSubmission } from "../hooks/useLogoSubmission";
import { useImagePreview } from "../hooks/useImagePreview";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userid");
  const condition = searchParams.get("condition");

  // Timer state
  const [timeLeft, setTimeLeft] = useState(1800);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Reference images state
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Use custom hooks
  const {
    messages,
    input,
    setInput,
    sendMessage,
    handleKeyDown,
    loadingResponse,
    initialLoading,
  } = useChatMessages(userId, condition, timeLeft);

  const {
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
  } = useLogoSubmission(userId);

  const {
    previewOpen,
    previewUrl,
    selectedLogo,
    openPreview,
    closePreview,
    handleLogoClick,
    handleDownloadClick,
  } = useImagePreview();

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load personalized images if applicable
  useEffect(() => {
    if (userId && condition === "personalized") {
      setLoadingImages(true);
      axios
        .get(`/api/user/${userId}/images`)
        .then((res) => {
          console.log(res.data.images, "DATA");
          setImages(res.data.images);
          setLoadingImages(false);
        })
        .catch((err) => {
          console.error("Error fetching images:", err);
          setLoadingImages(false);
        });
    }
  }, [userId, condition]);

  return (
    <Box
      sx={{
        backgroundColor: "#f5f7fa", // Add subtle background color
        minHeight: "100vh",
        padding: { xs: 1, sm: 2 }, // Responsive padding
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 3,
      }}
    >
      <ChatContainer>
        {/* Header with Timer */}
        <ChatHeader timeLeft={timeLeft} />

        {/* Reference Images (Personalized condition only) */}
        <ReferenceImagesPanel
          condition={condition}
          images={images}
          loadingImages={loadingImages}
          openPreview={openPreview}
        />

        {/* Main Content Area - Side by Side Layout */}
        <MainContentWrapper>
          {/* Left Side - Chat Area */}
          <ChatSection>
            <ChatBox
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              handleKeyDown={handleKeyDown}
              loadingResponse={loadingResponse}
              sessionEnded={sessionEnded || uploadSuccess}
              initialLoading={initialLoading}
              selectedLogo={selectedLogo}
              handleLogoClick={handleLogoClick}
              openPreview={openPreview}
              handleDownloadClick={handleDownloadClick}
              condition={condition}
            />
          </ChatSection>

          {/* Right Side - Instructions and Upload */}
          <SideSection>
            <InstructionsPanel />

            <UploadPanel
              finalLogoFile={finalLogoFile}
              uploadLoading={uploadLoading}
              uploadSuccess={uploadSuccess}
              uploadError={uploadError}
              isDragActive={isDragActive}
              fileInputRef={fileInputRef}
              handleFileUpload={handleFileUpload}
              handleDragEnter={handleDragEnter}
              handleDragLeave={handleDragLeave}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleUploadClick={handleUploadClick}
              handleFinalSubmit={handleFinalSubmit}
            />
          </SideSection>
        </MainContentWrapper>

        {/* Image Preview Dialog */}
        <ImagePreviewDialog
          open={previewOpen}
          onClose={closePreview}
          imageUrl={previewUrl}
          handleDownloadClick={handleDownloadClick}
        />
      </ChatContainer>
    </Box>
  );
};

export default Chat;
