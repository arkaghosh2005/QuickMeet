import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, Settings, User, Mail, Lock, Eye, EyeOff, Trash2, AlertTriangle, Check } from 'lucide-react';
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

        const token = localStorage.getItem('token');
        if (!token) {
            setUpdateError('Session expired. Please log in again.');
            return;
        }

        setUpdateLoading(true);
        try {
            const res = await apiClient.put('/v1/users/profile', {
                name: editName.trim(),
                email: editEmail.trim(),
                currentPassword: currentPasswordForUpdate,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state and localStorage
            const updatedUser = { ...userData, name: res.data.user.name, email: res.data.user.email };
            setUserData(updatedUser);
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            setUpdateSuccess('Profile updated successfully');
            setCurrentPasswordForUpdate('');
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
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-2">
                                <Video className="w-8 h-8 text-blue-600" />
                                <span className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    QuickMeet
                                </span>
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
                <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
                    {/* Container */}
                    <div className={`${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"} rounded-2xl shadow-xl p-5 sm:p-8`}>
                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/meeting-entry')}
                            className={`flex items-center space-x-2 mb-6 ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "hover:bg-gray-100"}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </Button>

                        {/* Page Title */}
                        <div className="text-center mb-6 sm:mb-8">
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${isDarkMode ? "bg-gray-700" : "bg-red-100"
                                }`}>
                                <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                            </div>
                            <h1 className={`text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Settings
                            </h1>
                            <p className={`text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Manage your account
                            </p>
                        </div>

                        <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} mb-6 sm:mb-8`}></div>

                        <div className="space-y-6">

                            {/* ── Account Info ── */}
                            <div className={`${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl p-4 sm:p-5`}>
                                <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    <User className="w-5 h-5 text-blue-500" />
                                    Account
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
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
                                </div>
                            </div>

                            {/* ── Update Profile (registered users only) ── */}
                            {!isGuest && (
                                <div className={`${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl p-4 sm:p-5`}>
                                    <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        <Lock className="w-5 h-5 text-green-500" />
                                        Update Profile
                                    </h2>

                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        {/* Name */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                                                    ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                                                    : "bg-white border-gray-300 text-gray-900"
                                                    }`}
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                                                    ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                                                    : "bg-white border-gray-300 text-gray-900"
                                                    }`}
                                                placeholder="Enter your email"
                                            />
                                        </div>

                                        {/* Current Password */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPasswordForUpdate ? "text" : "password"}
                                                    value={currentPasswordForUpdate}
                                                    onChange={(e) => setCurrentPasswordForUpdate(e.target.value)}
                                                    className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                                                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                                                        : "bg-white border-gray-300 text-gray-900"
                                                        }`}
                                                    placeholder="Required to save changes"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPasswordForUpdate(!showCurrentPasswordForUpdate)}
                                                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                                                >
                                                    {showCurrentPasswordForUpdate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className={`text-xs mt-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                Confirm your current password to save any changes
                                            </p>
                                        </div>

                                        {updateError && (
                                            <p className="text-red-500 text-sm flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                {updateError}
                                            </p>
                                        )}
                                        {updateSuccess && (
                                            <p className="text-green-500 text-sm flex items-center gap-1.5">
                                                <Check className="w-4 h-4 flex-shrink-0" />
                                                {updateSuccess}
                                            </p>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={updateLoading}
                                            className="w-full sm:w-auto"
                                        >
                                            {updateLoading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {/* ── Delete Account (registered users only) ── */}
                            {!isGuest && (
                                <div className={`${isDarkMode ? "bg-red-900/20 border border-red-800/30" : "bg-red-50 border border-red-200"} rounded-xl p-4 sm:p-5`}>
                                    <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-red-400" : "text-red-700"}`}>
                                        <Trash2 className="w-5 h-5" />
                                        Delete Account
                                    </h2>
                                    <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        This action is permanent and cannot be undone. All your data, including meeting history, will be permanently removed.
                                    </p>

                                    {!deleteUnlocked ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                    Enter your password to unlock deletion
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showDeletePassword ? "text" : "password"}
                                                        value={deletePassword}
                                                        onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                                                        className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode
                                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                                            : "bg-white border-gray-300 text-gray-900"
                                                            }`}
                                                        placeholder="Your account password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                                                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                                                    >
                                                        {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {deleteError && (
                                                <p className="text-red-500 text-sm flex items-center gap-1.5">
                                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                    {deleteError}
                                                </p>
                                            )}

                                            <Button
                                                variant="danger"
                                                onClick={handleVerifyDeletePassword}
                                                disabled={verifyingDelete || !deletePassword}
                                                className="w-full sm:w-auto"
                                            >
                                                {verifyingDelete ? 'Verifying...' : 'Verify Password'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                                                <Check className="w-4 h-4" />
                                                Password verified
                                            </div>

                                            <p className={`text-sm font-semibold ${isDarkMode ? "text-red-400" : "text-red-700"}`}>
                                                Are you absolutely sure? This will permanently delete your account and all associated data.
                                            </p>

                                            {deleteError && (
                                                <p className="text-red-500 text-sm flex items-center gap-1.5">
                                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                    {deleteError}
                                                </p>
                                            )}

                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Button
                                                    variant="danger"
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleteLoading}
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
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
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default SettingsPage;
