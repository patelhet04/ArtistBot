import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Chat from "./components";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Load Chat Component with URL-based userId and condition */}
        <Route path="/chat" element={<Chat />} />

        {/* ✅ Redirect unknown routes to chat */}
        <Route path="*" element={<Navigate to="/chat" />} />
      </Routes>
    </Router>
  );
}

export default App;
