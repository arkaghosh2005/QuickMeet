import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Video, ArrowLeft } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import DarkModeToggle from "../components/DarkModeToggle";
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
            let response = await signup(
                trimmedName,
                formData.email,
                formData.password
            );
            setSuccessMessage({ general: response });
            setFormData({
                fullName: "",
                email: "",
                password: "",
                retypePassword: "",
            });
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
                    className="bg-white rounded-2xl shadow-xl p-8 animate-scaleIn"
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
                    <form onSubmit={handleSubmit} className="space-y-6">
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
    );
};

export default SignupPage;
