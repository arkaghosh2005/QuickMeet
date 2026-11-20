import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, Calendar, CalendarClock } from 'lucide-react';
import Button from '../components/Button';
import DarkModeToggle from '../components/DarkModeToggle';
import SEO from '../components/SEO';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ScheduleMeetingPage = () => {
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const { userData } = useAuth();
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

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token && userData?.id?.startsWith('guest-')) {
            setIsGuest(true);
        }

        setLoading(false);
    }, [userData]);

    return (
        <>
        <SEO
            title="Schedule Meeting"
            description="Schedule a QuickMeet video meeting for later. Plan ahead and invite participants."
            path="/schedule-meeting"
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
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
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
                        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${isDarkMode ? "bg-gray-700" : "bg-purple-100"
                            }`}>
                            <Calendar className="w-7 h-7 sm:w-10 sm:h-10 text-purple-600" />
                        </div>
                        <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Schedule Meeting
                        </h1>
                        <p className={`text-lg sm:text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Plan and schedule your meetings ahead
                        </p>
                    </div>

                    {/* Divider */}
                    <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} mb-8`}></div>

                    {/* Guest User Message */}
                    {!loading && isGuest && (
                        <div className={`text-center py-12 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl`}>
                            <p className="text-red-500 text-lg">Schedule Meeting is not available for Guest Users. Please Signup and then Login to schedule your meetings.</p>
                        </div>
                    )}

                    {/* Logged In User — Coming Soon */}
                    {!loading && !isGuest && (
                        <div className={`text-center py-12 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl`}>
                            <CalendarClock className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Coming soon!
                            </h3>
                            <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                The ability to schedule meetings is on its way
                            </p>
                            <Button onClick={() => navigate('/meeting-entry')}>
                                Back to Dashboard
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
        </>
    );
};

export default ScheduleMeetingPage;
