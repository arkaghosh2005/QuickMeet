import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, Settings, User, Mail, Lock, Eye, EyeOff, LogOut, Shield, Palette, Monitor } from 'lucide-react';
import Button from '../components/Button';
import DarkModeToggle from '../components/DarkModeToggle';
import SEO from '../components/SEO';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
    const { userData, logout, isGuest } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();

    // Password change state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Default media preferences (stored in localStorage)
    const [defaultVideo, setDefaultVideo] = useState(() => {
        const saved = localStorage.getItem('quickmeet_default_video');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [defaultAudio, setDefaultAudio] = useState(() => {
        const saved = localStorage.getItem('quickmeet_default_audio');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const handleLogout = () => {
        logout();
        navigate("/", { state: { fromLogout: true } });
    };

    const handleToggleDefaultVideo = () => {
        const newValue = !defaultVideo;
        setDefaultVideo(newValue);
        localStorage.setItem('quickmeet_default_video', JSON.stringify(newValue));
    };

    const handleToggleDefaultAudio = () => {
        const newValue = !defaultAudio;
        setDefaultAudio(newValue);
        localStorage.setItem('quickmeet_default_audio', JSON.stringify(newValue));
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setPasswordError('New password must contain at least one uppercase letter');
            return;
        }
        if (!/[a-z]/.test(newPassword)) {
            setPasswordError('New password must contain at least one lowercase letter');
            return;
        }
        if (!/[0-9]/.test(newPassword)) {
            setPasswordError('New password must contain at least one number');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            setPasswordError('New password must contain at least one special character');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        // TODO: Integrate with backend API when password change endpoint is available
        setPasswordSuccess('Password change feature coming soon');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const ToggleSwitch = ({ checked, onChange, label }) => (
        <button
            onClick={onChange}
            role="switch"
            aria-checked={checked}
            aria-label={label}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-blue-600' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );

    return (
        <>
            <SEO
                title="Settings"
                description="Manage your QuickMeet account settings, preferences, and appearance."
                path="/settings"
                noIndex={true}
            />
            <div className={`min-h-screen ${isDarkMode
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                : "bg-gradient-to-br from-blue-50 via-white to-green-50"
                }`}>
                {/* Header */}
                <header className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"} shadow-sm border-b`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Video className="w-8 h-8 text-blue-600" />
                                    <span className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        QuickMeet
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <DarkModeToggle />
                                <span className={`hidden sm:inline ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Welcome, <strong>{userData?.name}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Common Big Background Container */}
                    <div className={`${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"} rounded-2xl shadow-xl p-6 sm:p-8`}>
                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/meeting-entry')}
                            className={`flex items-center space-x-2 mb-6 ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "hover:bg-gray-100"}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </Button>

                        {/* Header Section */}
                        <div className="text-center mb-8">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? "bg-gray-700" : "bg-red-100"
                                }`}>
                                <Settings className="w-10 h-10 text-red-600" />
                            </div>
                            <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Settings
                            </h1>
                            <p className={`text-lg sm:text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Manage your account and preferences
                            </p>
                        </div>

                        {/* Divider */}
                        <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} mb-8`}></div>

                        {/* Settings Sections */}
                        <div className="space-y-6">

                            {/* Profile Section */}
                            <div className={`${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl p-5`}>
                                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    <User className="w-5 h-5 text-blue-500" />
                                    Profile
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                Name
                                            </p>
                                            <p className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                {userData?.name || 'Unknown'}
                                            </p>
                                        </div>
                                        {isGuest && (
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${isDarkMode ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                Guest Account
                                            </span>
                                        )}
                                    </div>

                                    {userData?.email && (
                                        <div>
                                            <p className={`text-sm font-medium flex items-center gap-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                <Mail className="w-3.5 h-3.5" />
                                                Email
                                            </p>
                                            <p className={`text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                {userData.email}
                                            </p>
                                        </div>
                                    )}

                                    {userData?.id && (
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                User ID
                                            </p>
                                            <p className={`text-sm font-mono ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                {userData.id}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Appearance Section */}
                            <div className={`${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl p-5`}>
                                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    <Palette className="w-5 h-5 text-purple-500" />
                                    Appearance
                                </h2>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                            Dark Mode
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            Toggle between light and dark themes
                                        </p>
                                    </div>
                                    <ToggleSwitch
                                        checked={isDarkMode}
                                        onChange={toggleDarkMode}
                                        label="Dark Mode"
                                    />
                                </div>
                            </div>

                            {/* Meeting Defaults Section */}
                            <div className={`${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl p-5`}>
                                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    <Monitor className="w-5 h-5 text-green-500" />
                                    Meeting Defaults
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                Camera on by default
                                            </p>
                                            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                Start meetings with your camera enabled
                                            </p>
                                        </div>
                                        <ToggleSwitch
                                            checked={defaultVideo}
                                            onChange={handleToggleDefaultVideo}
                                            label="Default camera"
                                        />
                                    </div>
                                    <div className={`border-t ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}></div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                Microphone on by default
                                            </p>
                                            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                Start meetings with your microphone enabled
                                            </p>
                                        </div>
                                        <ToggleSwitch
                                            checked={defaultAudio}
                                            onChange={handleToggleDefaultAudio}
                                            label="Default microphone"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Security Section (registered users only) */}
                            {!isGuest && (
                                <div className={`${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl p-5`}>
                                    <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        <Shield className="w-5 h-5 text-amber-500" />
                                        Security
                                    </h2>

                                    {!showPasswordSection ? (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowPasswordSection(true)}
                                            className={`flex items-center gap-2 ${isDarkMode ? "text-gray-300 hover:bg-gray-600" : "hover:bg-gray-200"}`}
                                        >
                                            <Lock className="w-4 h-4" />
                                            Change Password
                                        </Button>
                                    ) : (
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            {/* Current Password */}
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                                                            ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                                                            : "bg-white border-gray-300 text-gray-900"
                                                            }`}
                                                        placeholder="Enter current password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* New Password */}
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                                                            ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                                                            : "bg-white border-gray-300 text-gray-900"
                                                            }`}
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    Min 8 chars, uppercase, lowercase, number, special character
                                                </p>
                                            </div>

                                            {/* Confirm New Password */}
                                            <div>
                                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                                                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                                                        : "bg-white border-gray-300 text-gray-900"
                                                        }`}
                                                    placeholder="Re-enter new password"
                                                />
                                            </div>

                                            {passwordError && (
                                                <p className="text-red-500 text-sm">{passwordError}</p>
                                            )}
                                            {passwordSuccess && (
                                                <p className="text-green-500 text-sm">{passwordSuccess}</p>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <Button type="submit" size="sm">
                                                    Update Password
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowPasswordSection(false);
                                                        setPasswordError('');
                                                        setPasswordSuccess('');
                                                        setCurrentPassword('');
                                                        setNewPassword('');
                                                        setConfirmPassword('');
                                                    }}
                                                    className={isDarkMode ? "text-gray-300 hover:bg-gray-600" : ""}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Divider */}
                            <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}></div>

                            {/* Sign Out */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        Sign Out
                                    </p>
                                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Sign out of your QuickMeet account on this device
                                    </p>
                                </div>
                                <Button
                                    variant="danger"
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default SettingsPage;

