import { useNavigate } from "react-router-dom";
import { Video, Home, ArrowLeft } from "lucide-react";
import Button from "../components/Button";
import SEO from "../components/SEO";
import { useTheme } from "../context/ThemeContext";

const NotFoundPage = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    return (
        <>
            <SEO
                title="Page Not Found"
                description="The page you're looking for doesn't exist. Return to QuickMeet to start or join a video meeting."
                path="/404"
                noIndex={true}
            />
            <div
                className={`min-h-screen flex items-center justify-center p-4 ${
                    isDarkMode
                        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                        : "bg-gradient-to-br from-blue-50 via-white to-green-50"
                }`}
            >
                <div className="text-center max-w-md">
                    <div className="flex items-center justify-center space-x-2 mb-8">
                        <Video className="w-10 h-10 text-blue-600" />
                        <span
                            className={`text-2xl font-bold ${
                                isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        >
                            QuickMeet
                        </span>
                    </div>

                    <h1
                        className={`text-7xl font-extrabold mb-4 ${
                            isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                    >
                        404
                    </h1>
                    <h2
                        className={`text-2xl font-semibold mb-4 ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                    >
                        Page Not Found
                    </h2>
                    <p
                        className={`mb-8 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                        The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => navigate(-1)} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                        <Button onClick={() => navigate("/")}>
                            <Home className="w-4 h-4 mr-2" />
                            Home
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;
