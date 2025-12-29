import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Calendar, ArrowRight, LogOut } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import DarkModeToggle from '../components/DarkModeToggle';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MeetingEntryPage = () => {
    const [meetingCode, setMeetingCode] = useState('');
    const [error, setError] = useState('');
    const { userData, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
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

    const generateMeetingCode = () => {
        const randomString = Math.random().toString(36).substr(2, 10).toUpperCase();
        const formattedCode = randomString.slice(0, 3) + '-' + randomString.slice(3, 7) + '-' + randomString.slice(7);
        return formattedCode;
    };

    const handleJoinMeeting = () => {
        const trimmedCode = meetingCode.trim();
        if (!trimmedCode) {
            setError('Please enter a meeting code');
            return;
        }
        if (!/^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{3}$/.test(trimmedCode)) {
            setError('Code must be in the correct format (A1B-C23D-4E5)');
            return;
        }
        setError('');
        navigate(`/pre-call/${trimmedCode}`);
    };

    const handleStartNewMeeting = () => {
        const newCode = generateMeetingCode();
        sessionStorage.setItem(`created_${newCode}`, 'true');
        navigate(`/pre-call/${newCode}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleMeetingCodeChange = (event) => {
        setMeetingCode(event.target.value.toUpperCase());
    };

    const quickActions = [
        {
            icon: <Calendar className="w-8 h-8 text-purple-600" />,
            title: 'Schedule Meeting',
            description: 'Plan a meeting for later',
        },
        {
            icon: <Users className="w-8 h-8 text-orange-600" />,
            title: 'Meeting History',
            description: 'View past meetings',
        },
        {
            icon: <Video className="w-8 h-8 text-red-600" />,
            title: 'Settings',
            description: 'Configure preferences',
        },
    ];

    return (
        <div className={`min-h-screen ${isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-blue-50 via-white to-green-50"
            } animate-fadeInUp`}>
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
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className={`flex items-center space-x-2 ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : ""}`}
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="hidden xs:inline">Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Ready to connect?
                    </h1>
                    <p className={`text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Start a new meeting or join an existing one
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Join Meeting */}
                    <div className={`${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"} rounded-2xl shadow-xl p-8`}>
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-gray-700" : "bg-blue-100"
                                }`}>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Join a Meeting
                            </h2>
                            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                                Enter a meeting code to join an existing meeting
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Enter Meeting Code"
                                value={meetingCode}
                                onChange={handleMeetingCodeChange}
                                className={`w-full px-4 py-2 border rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900"
                                    }`}
                            />
                            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                            <Button onClick={handleJoinMeeting} className="w-full" size="lg">
                                Join Meeting
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Start New Meeting */}
                    <div className={`${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"} rounded-2xl shadow-xl p-8`}>
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-gray-700" : "bg-green-100"
                                }`}>
                                <Video className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                Start New Meeting
                            </h2>
                            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                                Create a new meeting room and invite others
                            </p>
                        </div>

                        <Button
                            onClick={handleStartNewMeeting}
                            variant="secondary"
                            className="w-full"
                            size="lg"
                        >
                            Start Meeting Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-12">
                    <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <div
                                key={index}
                                className={`${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
                                    } rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}
                            >
                                <div className="mb-3">{action.icon}</div>
                                <h4 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {action.title}
                                </h4>
                                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    {action.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MeetingEntryPage;