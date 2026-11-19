import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Video, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const OAuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUserData } = useAuth();
    const { isDarkMode } = useTheme();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            setError(errorParam);
            setTimeout(() => navigate("/login"), 3000);
            return;
        }

        if (token && userParam) {
            try {
                const user = JSON.parse(userParam);
                localStorage.setItem("token", token);
                localStorage.setItem("userData", JSON.stringify(user));
                setUserData(user);
                navigate("/meeting-entry", { replace: true });
            } catch (e) {
                setError("Failed to process login data.");
                setTimeout(() => navigate("/login"), 3000);
            }
        } else {
            setError("Invalid callback. Missing authentication data.");
            setTimeout(() => navigate("/login"), 3000);
        }
    }, [searchParams, navigate, setUserData]);

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundColor: isDarkMode ? "#111827" : "#F9FAFB",
                backgroundImage: isDarkMode
                    ? "linear-gradient(to bottom right, #1F2937, #111827)"
                    : "linear-gradient(to bottom right, #EFF6FF, #FFFFFF, #ECFDF5)",
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center"
                style={{ backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF" }}
            >
                <div className="flex items-center justify-center space-x-2 mb-6">
                    <Video className="w-8 h-8 text-blue-600" />
                    <span
                        className="text-2xl font-bold text-gray-900"
                        style={{ color: isDarkMode ? "#FFFFFF" : undefined }}
                    >
                        QuickMeet
                    </span>
                </div>

                {error ? (
                    <>
                        <div className="flex justify-center mb-4">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <p className="text-red-500 font-medium mb-2">{error}</p>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Redirecting to login...
                        </p>
                    </>
                ) : (
                    <>
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                        <p
                            className="text-lg font-medium text-gray-900 mb-1"
                            style={{ color: isDarkMode ? "#FFFFFF" : undefined }}
                        >
                            Signing you in...
                        </p>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Please wait while we complete authentication.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallbackPage;
