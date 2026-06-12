import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MeetingEntryPage from "./pages/MeetingEntryPage";
import MeetingHistoryPage from "./pages/MeetingHistoryPage";
import PreCallPage from "./pages/PreCallPage";
import VideoCallPage from "./pages/VideoCallPage";
import NotFoundPage from "./pages/NotFoundPage";

// Meeting code format: ABC-1234-XYZ (3 alphanum - 4 alphanum - 3 alphanum)
const MEETING_CODE_REGEX = /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{3}$/;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { userData } = useAuth();
  if (userData) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
};

// Validates meetingCode param format, renders 404 if invalid
const ValidMeetingRoute = ({ children }) => {
  const { meetingCode } = useParams();
  if (!MEETING_CODE_REGEX.test(meetingCode)) {
    return <NotFoundPage />;
  }
  return <>{children}</>;
};



// App Routes Component
const AppRoutes = () => {
  const { userData } = useAuth();

  return (
    <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            userData ? <Navigate to="/meeting-entry" replace /> : <LandingPage />
          }
        />
        <Route
          path="/login"
          element={
            userData ? <Navigate to="/meeting-entry" replace /> : <LoginPage />
          }
        />
        <Route
          path="/signup"
          element={
            userData ? <Navigate to="/meeting-entry" replace /> : <SignupPage />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/meeting-entry"
          element={
            <ProtectedRoute>
              <MeetingEntryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting-history"
          element={
            <ProtectedRoute>
              <MeetingHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pre-call/:meetingCode"
          element={
            <ProtectedRoute>
              <PreCallPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:meetingCode"
          element={
            <ValidMeetingRoute>
              <ProtectedRoute>
                <VideoCallPage />
              </ProtectedRoute>
            </ValidMeetingRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
