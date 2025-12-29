import { useState, useEffect } from "react";
import { Video, Users, Shield, Smartphone } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import DarkModeToggle from "../components/DarkModeToggle";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
    const [guestName, setGuestName] = useState("");
    const { loginAsGuest } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    const handleGuestJoin = () => {
        const trimmedName = guestName.trim();
        if (trimmedName) {
            loginAsGuest(trimmedName);
            navigate("/meeting-entry");
        }
    };

    const handleGuestNameChange = (event) => {
        setGuestName(event.target.value);
    };

    const navigateToLogin = () => navigate("/login");
    const navigateToSignup = () => navigate("/signup");

    const features = [
        {
            icon: <Video className="w-8 h-8 text-blue-600" />,
            title: "HD Video Calls",
            description: "Crystal clear video quality for seamless communication",
        },
        {
            icon: <Users className="w-8 h-8 text-green-600" />,
            title: "Group Meetings",
            description: "Connect with multiple participants in one call",
        },
        {
            icon: <Shield className="w-8 h-8 text-purple-600" />,
            title: "Secure & Private",
            description: "End-to-end encryption keeps your conversations safe",
        },
        {
            icon: <Smartphone className="w-8 h-8 text-orange-600" />,
            title: "Mobile Ready",
            description: "Join meetings from any device, anywhere",
        },
    ];

    const isGuestNameValid = guestName.trim().length > 0;

    return (
        <div
            className={`min-h-screen ${isDarkMode
                    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                    : "bg-gradient-to-br from-blue-50 via-white to-green-50"
                } animate-fadeInUp`}
        >
            {/* Header */}
            <header
                className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
                    } shadow-sm border-b`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Video className="w-8 h-8 text-blue-600" />
                            <span
                                className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"
                                    }`}
                            >
                                QuickMeet
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <DarkModeToggle />
                            <Button
                                variant="ghost"
                                onClick={navigateToLogin}
                                className={`hidden sm:inline-flex ${isDarkMode
                                        ? "text-gray-300 hover:bg-gray-700"
                                        : ""
                                    }`}
                            >
                                Log In
                            </Button>
                            <Button onClick={navigateToSignup} className="hidden xs:inline-flex">
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1
                        className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                    >
                        Connect with anyone,
                        <span className="text-blue-600 block">anywhere</span>
                    </h1>
                    <p
                        className={`text-xl mb-8 max-w-3xl mx-auto ${isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                    >
                        Professional video meetings made simple. Join or host meetings with
                        crystal clear video and audio quality.
                    </p>

                    {/* Quick Join Section */}
                    <div
                        className={`${isDarkMode
                                ? "bg-gray-800 border border-gray-700"
                                : "bg-white"
                            } rounded-2xl shadow-xl p-8 max-w-md mx-auto mb-12`}
                    >
                        <h2
                            className={`text-2xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Join as Guest
                        </h2>

                        <div className="space-y-4">
                            <div className="w-full">
                                <Input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={guestName}
                                    onChange={handleGuestNameChange}
                                    className={`w-full px-4 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                            : "bg-white border-gray-300 text-gray-900"
                                        }`}
                                />
                            </div>
                            <Button
                                onClick={handleGuestJoin}
                                disabled={!isGuestNameValid}
                                className="w-full"
                                size="lg"
                            >
                                Continue as Guest
                            </Button>
                        </div>

                        <div
                            className={`mt-6 pt-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"
                                } border-t`}
                        >
                            <p
                                className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                                    }`}
                            >
                                Already have an account?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onClick={navigateToLogin}
                                    className={`flex-1 ${isDarkMode
                                            ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    Log In
                                </Button>
                                <Button onClick={navigateToSignup} className="flex-1">
                                    Sign Up
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`${isDarkMode
                                    ? "bg-gray-800 border border-gray-700"
                                    : "bg-white"
                                } rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className={`mb-4 p-3 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-50"
                                        }`}
                                >
                                    {feature.icon}
                                </div>
                                <h3
                                    className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    {feature.title}
                                </h3>
                                <p
                                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"
                                        }`}
                                >
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action Section */}
                <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                    <p className="text-xl mb-6 opacity-90">
                        Create your account and start hosting meetings today
                    </p>
                    <Button
                        variant="outline"
                        onClick={navigateToSignup}
                        className={`${isDarkMode
                                ? "bg-gray-800 text-white hover:bg-gray-700 border-gray-600"
                                : "bg-white text-blue-600 hover:bg-gray-100 border-white"
                            }`}
                        size="lg"
                    >
                        Create Free Account
                    </Button>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <Video className="w-6 h-6" />
                        <span className="text-lg font-semibold">QuickMeet</span>
                    </div>
                    <p className="text-gray-400">
                        © {new Date().getFullYear()} QuickMeet by Arka Ghosh. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;