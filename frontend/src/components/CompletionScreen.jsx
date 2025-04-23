import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Link,
  Card,
  CardContent,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 600,
  margin: "0 auto",
  padding: theme.spacing(3),
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  borderRadius: theme.spacing(2),
  backgroundColor: "#fff",
  textAlign: "center",
}));

const CompletionScreen = ({ responseId }) => {
  // Construct the Qualtrics URL with the responseId and environment variables
  const qualtricsUrl = `https://${
    process.env.REACT_APP_QUALTRICS_DATACENTER || "ca1"
  }.qualtrics.com/survey=${
    process.env.REACT_APP_QUALTRICS_SURVEY_ID || "default"
  }&userID=${encodeURIComponent(responseId)}`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: 3,
        backgroundColor: "#f5f7fa",
      }}
    >
      <StyledCard>
        <CardContent>
          <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 70, color: "success.main" }} />
          </Box>

          <Typography variant="h4" component="h1" gutterBottom>
            Thank You!
          </Typography>

          <Typography variant="h6" gutterBottom>
            You have now completed part 2/3 of the experiment.
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            To complete the final part, click on the link below to return to
            Qualtrics to complete a short survey.
          </Typography>

          <Paper
            elevation={2}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: "#fff9c4",
              border: "1px solid #ffd54f",
            }}
          >
            <Typography
              variant="body1"
              fontWeight="medium"
              color="warning.dark"
            >
              Remember: you need to complete this part to get paid for your
              participation.
            </Typography>
          </Paper>

          <Button
            component={Link}
            href={qualtricsUrl}
            variant="contained"
            color="primary"
            size="large"
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontSize: "1.1rem",
              fontWeight: "medium",
            }}
          >
            Go to Qualtrics Survey
          </Button>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default CompletionScreen;
