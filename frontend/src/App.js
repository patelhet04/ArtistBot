import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./themes/theme";
import Chat from "./components";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* ✅ Load Chat Component with URL-based responseId and condition */}
          <Route path="/chat" element={<Chat />} />

          {/* ✅ Redirect unknown routes to chat */}
          <Route path="*" element={<Navigate to="/chat" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
