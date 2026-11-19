import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, Settings, User, Mail, Lock, Eye, EyeOff, Trash2, AlertTriangle, Check, Moon, Sun, Camera, Mic } from 'lucide-react';
import Button from '../components/Button';
import DarkModeToggle from '../components/DarkModeToggle';
import SEO from '../components/SEO';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../context/AuthContext';

const SettingsPage = () => {
    const { userData, setUserData, logout, isGuest } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    // Profile update state
    const [editName, setEditName] = useState(userData?.name || '');
    const [editEmail, setEditEmail] = useState(userData?.email || '');
    const [currentPasswordForUpdate, setCurrentPasswordForUpdate] = useState('');
    const [showCurrentPasswordForUpdate, setShowCurrentPasswordForUpdate] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    // Delete account state
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [deleteUnlocked, setDeleteUnlocked] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [verifyingDelete, setVerifyingDelete] = useState(false);

    // Default media preferences
    const [defaultVideo, setDefaultVideo] = useState(() => {
        const saved = localStorage.getItem('quickmeet_default_video');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [defaultAudio, setDefaultAudio] = useState(() => {
        const saved = localStorage.getItem('quickmeet_default_audio');
        return saved !== null ? JSON.parse(saved) : true;
    });

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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateError('');
        setUpdateSuccess('');

        if (!editName.trim()) {
            setUpdateError('Name is required');
            return;
        }
        if (!editEmail.trim()) {
            setUpdateError('Email is required');
            return;
        }
        if (!currentPasswordForUpdate) {
            setUpdateError('Current password is required to make changes');
            return;
        }

        // Validate new password if provided
        if (newPassword) {
            if (newPassword.length < 8) {
                setUpdateError('New password must be at least 8 characters');
                return;
            }
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setUpdateError('Session expired. Please log in again.');
            return;
        }

        setUpdateLoading(true);
        try {
            const payload = {
                name: editName.trim(),
                email: editEmail.trim(),
                currentPassword: currentPasswordForUpdate,
            };
            if (newPassword) {
                payload.newPassword = newPassword;
            }

            const res = await apiClient.put('/v1/users/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state and localStorage
            const updatedUser = { ...userData, name: res.data.user.name, email: res.data.user.email };
            setUserData(updatedUser);
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            setUpdateSuccess(res.data.message || 'Profile updated successfully');
            setCurrentPasswordForUpdate('');
            setNewPassword('');
        } catch (err) {
            setUpdateError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleVerifyDeletePassword = async () => {
        setDeleteError('');

        if (!deletePassword) {
            setDeleteError('Enter your password to continue');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setDeleteError('Session expired. Please log in again.');
            return;
        }

        setVerifyingDelete(true);
        try {
            await apiClient.post('/v1/users/verify-password', {
                password: deletePassword,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeleteUnlocked(true);
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Incorrect password');
        } finally {
            setVerifyingDelete(false);
        }
    };

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setDeleteLoading(true);
        setDeleteError('');
        try {
            await apiClient.delete('/v1/users/account', {
                headers: { Authorization: `Bearer ${token}` },
                data: { password: deletePassword },
            });
            logout();
            navigate('/', { state: { fromLogout: true } });
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Failed to delete account');
            setDeleteUnlocked(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    const toggleDefaultVideo = () => {
        const newVal = !defaultVideo;
        setDefaultVideo(newVal);
        localStorage.setItem('quickmeet_default_video', JSON.stringify(newVal));
    };

    const toggleDefaultAudio = () => {
        const newVal = !defaultAudio;
        setDefaultAudio(newVal);
        localStorage.setItem('quickmeet_default_audio', JSON.stringify(newVal));
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.charAt(0).toUpperCase();
    };

    // Shared input classes
    const inputClasses = `w-full px-3.5 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode
        ? "bg-gray-700/80 border-gray-600 text-white placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
        }`;

    return (
        <>
            <SEO
                title="Settings"
                description="Manage your QuickMeet account settings."
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
                        <div className="flex justify-between items-center h-14 sm:h-16">
                            <div className="flex items-center space-x-2">
                                <Video className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                                <span className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    QuickMeet
                                </span>
                            </div>

                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <DarkModeToggle />
                                <span className={`hidden sm:inline text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Welcome, <strong>{userData?.name}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-10">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/meeting-entry')}
                        className={`flex items-center space-x-1.5 mb-4 sm:mb-6 text-sm ${isDarkMode ? "text-gray-300 hover:bg-gray-800" : "hover:bg-gray-100"}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Button>

                    {/* Profile Card */}
                    <div className={`${isDarkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white"} rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6`}>
                        {/* Profile Header with Avatar */}
                        <div className={`relative px-4 sm:px-6 pt-5 sm:pt-8 pb-4 sm:pb-6 ${isDarkMode ? "bg-gradient-to-r from-blue-900/40 to-purple-900/40" : "bg-gradient-to-r from-blue-50 to-indigo-50"}`}>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5">
                                {/* Avatar */}
                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0 ${isDarkMode ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
                                    {getInitials(userData?.name)}
                                </div>
                                {/* Info */}
                                <div className="text-center sm:text-left min-w-0">
                                    <h1 className={`text-xl sm:text-2xl font-bold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        {userData?.name || 'User'}
                                    </h1>
                                    {userData?.email && (
                                        <p className={`text-sm truncate mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            {userData.email}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                        {isGuest ? (
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "bg-yellow-100 text-yellow-700"}`}>
                                                Guest Account
                                            </span>
                                        ) : (
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-green-100 text-green-700"}`}>
                                                Registered
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="px-4 sm:px-6 py-4 sm:py-5">
                            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Account Details
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDarkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                                        <User className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Name</p>
                                        <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                            {userData?.name || 'Unknown'}
                                        </p>
                                    </div>
                                </div>

                                {userData?.email && (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDarkMode ? "bg-gray-700" : "bg-purple-50"}`}>
                                            <Mail className="w-4 h-4 text-purple-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Email</p>
                                            <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                {userData.email}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preferences Card */}
                    <div className={`${isDarkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white"} rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6`}>
                        <div className="px-4 sm:px-6 py-4 sm:py-5">
                            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                <Settings className="w-4 h-4" />
                                Preferences
                            </h2>

                            <div className="space-y-1">
                                {/* Appearance */}
                                <div className={`flex items-center justify-between py-3 px-3 rounded-xl ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} transition-colors`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-amber-50"}`}>
                                            {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Appearance</p>
                                            <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{isDarkMode ? 'Dark mode' : 'Light mode'}</p>
                                        </div>
                                    </div>
                                    <DarkModeToggle />
                                </div>

                                {/* Default Camera */}
                                <div className={`flex items-center justify-between py-3 px-3 rounded-xl ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} transition-colors`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                                            <Camera className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Camera on join</p>
                                            <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Start with camera {defaultVideo ? 'on' : 'off'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleDefaultVideo}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${defaultVideo
                                            ? "bg-blue-500"
                                            : isDarkMode ? "bg-gray-600" : "bg-gray-300"
                                            }`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${defaultVideo ? "translate-x-5" : "translate-x-0"
                                            }`} />
                                    </button>
                                </div>

                                {/* Default Mic */}
                                <div className={`flex items-center justify-between py-3 px-3 rounded-xl ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} transition-colors`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-green-50"}`}>
                                            <Mic className="w-4 h-4 text-green-500" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Microphone on join</p>
                                            <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Start with mic {defaultAudio ? 'on' : 'off'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleDefaultAudio}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${defaultAudio
                                            ? "bg-blue-500"
                                            : isDarkMode ? "bg-gray-600" : "bg-gray-300"
                                            }`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${defaultAudio ? "translate-x-5" : "translate-x-0"
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update Profile Card (registered users only) */}
                    {!isGuest && (
                        <div className={`${isDarkMode ? "bg-gray-800/80 border border-gray-700" : "bg-white"} rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6`}>
                            <div className="px-4 sm:px-6 py-4 sm:py-5">
                                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    <Lock className="w-4 h-4 text-green-500" />
                                    Update Profile
                                </h2>

                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className={inputClasses}
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className={inputClasses}
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    {/* Current Password */}
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPasswordForUpdate ? "text" : "password"}
                                                value={currentPasswordForUpdate}
                                                onChange={(e) => setCurrentPasswordForUpdate(e.target.value)}
                                                className={`${inputClasses} pr-10`}
                                                placeholder="Required to save changes"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPasswordForUpdate(!showCurrentPasswordForUpdate)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                                            >
                                                {showCurrentPasswordForUpdate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className={`text-xs mt-1.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            Confirm your current password to save any changes
                                        </p>
                                    </div>

                                    {/* New Password (optional) */}
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            New Password <span className={`font-normal ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className={`${inputClasses} pr-10`}
                                                placeholder="Leave blank to keep current"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className={`text-xs mt-1.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                            Minimum 8 characters
                                        </p>
                                    </div>

                                    {updateError && (
                                        <div className={`flex items-start gap-2 text-sm p-3 rounded-xl ${isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"}`}>
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {updateError}
                                        </div>
                                    )}
                                    {updateSuccess && (
                                        <div className={`flex items-start gap-2 text-sm p-3 rounded-xl ${isDarkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"}`}>
                                            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {updateSuccess}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="w-full"
                                    >
                                        {updateLoading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone — Delete Account (registered users only) */}
                    {!isGuest && (
                        <div className={`${isDarkMode ? "bg-gray-800/80 border border-red-900/40" : "bg-white border border-red-200"} rounded-2xl shadow-lg overflow-hidden`}>
                            <div className="px-4 sm:px-6 py-4 sm:py-5">
                                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-1 flex items-center gap-2 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                                    <Trash2 className="w-4 h-4" />
                                    Danger Zone
                                </h2>
                                <p className={`text-xs mb-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    Permanent and irreversible. All data will be lost.
                                </p>

                                {!deleteUnlocked ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                Enter your password to unlock deletion
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showDeletePassword ? "text" : "password"}
                                                    value={deletePassword}
                                                    onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                                                    className={`w-full px-3.5 py-2.5 pr-10 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${isDarkMode
                                                        ? "bg-gray-700/80 border-gray-600 text-white placeholder-gray-400"
                                                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                                        }`}
                                                    placeholder="Your account password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                                                >
                                                    {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {deleteError && (
                                            <div className={`flex items-start gap-2 text-sm p-3 rounded-xl ${isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"}`}>
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                {deleteError}
                                            </div>
                                        )}

                                        <Button
                                            variant="danger"
                                            onClick={handleVerifyDeletePassword}
                                            disabled={verifyingDelete || !deletePassword}
                                            className="w-full"
                                        >
                                            {verifyingDelete ? 'Verifying...' : 'Verify Password'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className={`flex items-center gap-2 text-sm font-medium p-3 rounded-xl ${isDarkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"}`}>
                                            <Check className="w-4 h-4" />
                                            Password verified
                                        </div>

                                        <p className={`text-sm font-semibold ${isDarkMode ? "text-red-400" : "text-red-700"}`}>
                                            Are you absolutely sure? This will permanently delete your account and all associated data.
                                        </p>

                                        {deleteError && (
                                            <div className={`flex items-start gap-2 text-sm p-3 rounded-xl ${isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"}`}>
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                {deleteError}
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Button
                                                variant="danger"
                                                onClick={handleDeleteAccount}
                                                disabled={deleteLoading}
                                                className="w-full sm:w-auto"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5" />
                                                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setDeleteUnlocked(false);
                                                    setDeletePassword('');
                                                    setDeleteError('');
                                                }}
                                                className={`w-full sm:w-auto ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : ""}`}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom Spacer */}
                    <div className="h-6 sm:h-10" />
                </main>
            </div>
        </>
    );
};

export default SettingsPage;
