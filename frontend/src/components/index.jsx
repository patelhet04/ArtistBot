// src/components/Chat/index.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Box, useMediaQuery, useTheme, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

// Import components
import ChatHeader from "./ChatHeader";
import ReferenceImagesPanel from "./ReferenceImagesPanel";
import ChatBox from "./ChatBox";
import InstructionsPanel from "./InstructionsPanel";
import UploadPanel from "./UploadPanel";
import ImagePreviewDialog from "./ImagePreviewDialog";
import CompletionScreen from "./CompletionScreen";

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

// Define valid conditions
const VALID_CONDITIONS = {
  G: "g", // General
  P: "p", // Personalized
  F: "f", // Personalized with explanation
};

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [searchParams] = useSearchParams();
  const responseId = searchParams.get("responseId");
  const condition = searchParams.get("condition");

  // Timer state
  const [timeLeft, setTimeLeft] = useState(1800);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Reference images state
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Mobile UI state
  const [showSidebar, setShowSidebar] = useState(!isTablet);

  // Update sidebar visibility when screen size changes
  useEffect(() => {
    setShowSidebar(!isTablet);
  }, [isTablet]);

  // Use custom hooks
  const {
    messages,
    input,
    setInput,
    sendMessage,
    handleKeyDown,
    loadingResponse,
    initialLoading,
    effectiveresponseId,
    error,
    condition: normalizedCondition,
  } = useChatMessages(responseId, condition, timeLeft);

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
  } = useLogoSubmission(responseId || effectiveresponseId);

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

  // Load personalized images if applicable (for both p and f conditions)
  useEffect(() => {
    if (
      responseId &&
      (normalizedCondition === "p" || normalizedCondition === "f")
    ) {
      setLoadingImages(true);
      axios
        .get(`/api/response/${responseId}/images`)
        .then((res) => {
          setImages(res.data.images);
          setLoadingImages(false);
        })
        .catch((err) => {
          console.error("Error fetching images:", err);
          setLoadingImages(false);
        });
    }
  }, [responseId, normalizedCondition]);

  // Toggle sidebar visibility (for mobile)
  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        padding: { xs: 1, sm: 2 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        overflowX: "hidden",
        pt: { xs: 1, sm: 3 },
      }}
    >
      {uploadSuccess ? (
        <CompletionScreen responseId={responseId || effectiveresponseId} />
      ) : (
        <ChatContainer>
          {/* Header with Timer */}
          <ChatHeader
            timeLeft={timeLeft}
            isMobile={isMobile}
            showSidebar={showSidebar}
            toggleSidebar={toggleSidebar}
          />

          {/* Reference Images (Personalized conditions only) */}
          <ReferenceImagesPanel
            condition={normalizedCondition}
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
                condition={normalizedCondition}
                error={error}
              />
            </ChatSection>

            {/* Right Side - Instructions and Upload */}
            {(showSidebar || !isTablet) && (
              <SideSection
                sx={{
                  position: { xs: "fixed", md: "relative" },
                  top: { xs: 0, md: "auto" },
                  right: { xs: showSidebar ? 0 : "-100%", md: "auto" },
                  bottom: { xs: 0, md: "auto" },
                  width: { xs: "260px", md: "auto" },
                  maxWidth: { xs: "80%", md: "320px" },
                  backgroundColor: { xs: "#f5f7fa", md: "transparent" },
                  height: { xs: "100%", md: "auto" },
                  zIndex: { xs: 1200, md: 1 },
                  boxShadow: {
                    xs: showSidebar ? "-5px 0 15px rgba(0,0,0,0.08)" : "none",
                    md: "none",
                  },
                  padding: { xs: showSidebar ? "16px 12px" : 0, md: 0 },
                  transition: "all 0.25s ease",
                  overflow: "visible",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Close Button for Mobile */}
                {isMobile && showSidebar && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mb: 1,
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <IconButton
                      onClick={toggleSidebar}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.2
                          ),
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <InstructionsPanel />
                <UploadPanel
                  finalLogoFile={finalLogoFile}
                  selectedLogoUrl={selectedLogo}
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
                  sessionEnded={sessionEnded}
                />
              </SideSection>
            )}
          </MainContentWrapper>

          {/* Image Preview Dialog */}
          <ImagePreviewDialog
            open={previewOpen}
            onClose={closePreview}
            imageUrl={previewUrl}
            handleDownloadClick={handleDownloadClick}
          />
        </ChatContainer>
      )}
    </Box>
  );
};

export default Chat;
