import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Video, ArrowLeft } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import SEO from "../components/SEO";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        retypePassword: "",
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState({});
    const { signup, loading } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        // Block back navigation
        const blockNav = (e) => {
            e.preventDefault();
            window.history.pushState(null, "", window.location.href);
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", blockNav);

        return () => {
            window.removeEventListener("popstate", blockNav);
        };
    }, []);

    const validateForm = () => {
        const newErrors = {};

        const trimmedName = formData.fullName.trim();
        if (!trimmedName) {
            newErrors.fullName = "Full name is required";
        } else if (!trimmedName.includes(" ")) {
            newErrors.fullName = "Please include both First and Last name";
        } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
            newErrors.fullName = "Full name can only contain alphabets and spaces";
        }

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one uppercase letter";
        } else if (!/[a-z]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one lowercase letter";
        } else if (!/[0-9]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one number";
        } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
            newErrors.password = "Password must contain at least one special character";
        }

        if (!formData.retypePassword) {
            newErrors.retypePassword = "Please retype your password";
        } else if (formData.password !== formData.retypePassword) {
            newErrors.retypePassword = "Passwords do not match";
        }

        setSuccessMessage({});
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const trimmedName = formData.fullName.trim();
            const response = await signup(
                trimmedName,
                formData.email,
                formData.password
            );
            setSuccessMessage({ general: response });
            await new Promise(resolve => setTimeout(resolve, 2500));
            navigate('/meeting-entry');
        } catch (error) {
            setErrors({
                general: error.message || "Something went wrong. Please try again.",
            });
        }
    };

    const handleInputChange = (field) => (event) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: event.target.value,
        }));
    };

    const navigateToHome = () => navigate("/");

    return (
        <>
            <SEO
                title="Sign Up"
                description="Create a free QuickMeet account to host and join HD video meetings with screen sharing, real-time chat, and meeting history."
                path="/signup"
            />
            <div
                className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 animate-fadeInUp"
                style={{
                    backgroundColor: isDarkMode ? "#111827" : undefined,
                    backgroundImage: isDarkMode
                        ? "linear-gradient(to bottom right, #1F2937, #111827)"
                        : undefined,
                }}
            >
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <Button variant="ghost" onClick={navigateToHome} className="mb-6 p-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>

                    {/* Signup Card */}
                    <div
                        className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 animate-scaleIn"
                        style={{ backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF" }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <Video className="w-8 h-8 text-blue-600" />
                                <span
                                    className="text-2xl font-bold text-gray-900"
                                    style={{ color: isDarkMode ? "#FFFFFF" : undefined }}
                                >
                                    QuickMeet
                                </span>
                            </div>
                            <h1
                                className="text-2xl font-bold text-gray-900 mb-2"
                                style={{ color: isDarkMode ? "#FFFFFF" : undefined }}
                            >
                                Create your account
                            </h1>
                            <p
                                className="text-gray-600"
                                style={{ color: isDarkMode ? "#D1D5DB" : undefined }}
                            >
                                Join thousands of users worldwide
                            </p>
                        </div>

                        {/* Error Message */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage.general && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                                <p className="text-green-600 text-sm">{successMessage.general}</p>
                            </div>
                        )}

                        {/* Signup Form */}
                        <form onSubmit={handleSubmit} className="space-y-6" aria-label="Sign up form">
                            <Input
                                type="text"
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleInputChange("fullName")}
                                error={errors.fullName}
                                icon={<User className="w-5 h-5 text-gray-400" />}
                            />

                            <Input
                                type="text"
                                label="Email Address"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange("email")}
                                error={errors.email}
                                icon={<Mail className="w-5 h-5 text-gray-400" />}
                            />

                            <Input
                                type="password"
                                label="Password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange("password")}
                                error={errors.password}
                                icon={<Lock className="w-5 h-5 text-gray-400" />}
                            />

                            <Input
                                type="password"
                                label="Retype Password"
                                placeholder="Retype your password"
                                value={formData.retypePassword}
                                onChange={handleInputChange("retypePassword")}
                                error={errors.retypePassword}
                                icon={<Lock className="w-5 h-5 text-gray-400" />}
                            />

                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full"
                                size="lg"
                            >
                                Create Account
                            </Button>
                        </form>

                        {/* OR Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className={`w-full border-t ${isDarkMode ? "border-gray-600" : "border-gray-200"}`} />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className={`px-4 ${isDarkMode ? "bg-[#1F2937] text-gray-400" : "bg-white text-gray-500"}`}>
                                    OR
                                </span>
                            </div>
                        </div>

                        {/* OAuth Buttons (Coming Soon) */}
                        <div className="space-y-3">
                            <button
                                disabled
                                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border font-medium transition-colors cursor-not-allowed opacity-60 ${isDarkMode
                                        ? "bg-gray-800 border-gray-600 text-gray-300"
                                        : "bg-white border-gray-300 text-gray-700"
                                    }`}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign up with Google
                            </button>

                            <button
                                disabled
                                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border font-medium transition-colors cursor-not-allowed opacity-60 ${isDarkMode
                                        ? "bg-gray-800 border-gray-600 text-gray-300"
                                        : "bg-white border-gray-300 text-gray-700"
                                    }`}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 21 21">
                                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                                </svg>
                                Sign up with Microsoft
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Login
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Guest Option */}
                    <div className="mt-6 text-center">
                        <p className={`mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Or continue without an account</p>
                        <Button variant="outline" onClick={navigateToHome} className="w-full">
                            Join as Guest
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignupPage;
