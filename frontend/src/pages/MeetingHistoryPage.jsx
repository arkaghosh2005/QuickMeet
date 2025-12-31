import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, ArrowLeft, Clock, Calendar, Loader2, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import DarkModeToggle from '../components/DarkModeToggle';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MeetingHistoryPage = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
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
        const fetchMeetingHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token && userData?.id?.startsWith('guest-')) {
                    setError('Meeting history is not available for guest users. Please sign up to track your meetings.');
                    setLoading(false);
                    return;
                }
                
                if (!token) {
                    setError('Please login to view meeting history');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/v1/users/history`,
                    { params: { token } }
                );
                setMeetings(response.data);
            } catch (e) {
                setError('Failed to fetch meeting history');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetingHistory();
    }, [userData]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleJoinMeeting = (meetingCode) => {
        navigate(`/pre-call/${meetingCode}`);
    };

    const handleDeleteMeeting = async (meetingId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setDeletingId(meetingId);
        try {
            await axios.delete(
                `${import.meta.env.VITE_SERVER_URL}/v1/users/history`,
                { data: { token, meeting_id: meetingId } }
            );
            setMeetings(prev => prev.filter(m => m._id !== meetingId));
        } catch (e) {
            console.error('Failed to delete meeting:', e);
        } finally {
            setDeletingId(null);
        }
    };

    return (
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
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? "bg-gray-700" : "bg-orange-100"
                            }`}>
                            <Users className="w-10 h-10 text-orange-600" />
                        </div>
                        <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Meeting History
                        </h1>
                        <p className={`text-lg sm:text-xl ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            View and rejoin your past meetings
                        </p>
                    </div>

                    {/* Divider */}
                    <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} mb-8`}></div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className={`w-12 h-12 animate-spin ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                            <p className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Loading your meeting history...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className={`text-center py-12 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl`}>
                            <p className="text-red-500 text-lg">{error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && meetings.length === 0 && (
                        <div className={`text-center py-12 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"} rounded-xl`}>
                            <Calendar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                No meetings yet
                            </h3>
                            <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                Start or join a meeting to see it here
                            </p>
                            <Button onClick={() => navigate('/meeting-entry')}>
                                Start a Meeting
                            </Button>
                        </div>
                    )}

                    {/* Meeting List */}
                    {!loading && !error && meetings.length > 0 && (
                        <div className="space-y-4">
                            {meetings.map((meeting, index) => {
                                const isActive = meeting.isActive;
                                
                                return (
                                    <div
                                        key={meeting._id || index}
                                        className={`${isDarkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                                            } rounded-xl p-5 transition-colors`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-start space-x-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-gray-600" : "bg-blue-100"
                                                    }`}>
                                                    <Video className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className={`text-lg font-semibold font-mono ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                        {meeting.meetingCode}
                                                    </h3>
                                                    <div className={`flex flex-wrap items-center gap-3 mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                        <span className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {formatDate(meeting.date)}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            {formatTime(meeting.date)}
                                                        </span>
                                                        {isActive ? (
                                                            <span className="text-xs text-green-500 font-medium flex items-center">
                                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-amber-500 font-medium">
                                                                (Room Closed)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleJoinMeeting(meeting.meetingCode)}
                                                    disabled={!isActive}
                                                    className={`flex-1 sm:flex-none ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={!isActive ? 'Room no longer exists' : 'Rejoin this meeting'}
                                                >
                                                    Rejoin Meeting
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleDeleteMeeting(meeting._id)}
                                                    disabled={deletingId === meeting._id}
                                                    className={`p-2 ${isDarkMode 
                                                        ? "text-red-400 hover:bg-red-500/20 hover:text-red-300" 
                                                        : "text-red-500 hover:bg-red-50 hover:text-red-600"
                                                    }`}
                                                    title="Delete from history"
                                                >
                                                    {deletingId === meeting._id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-5 h-5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MeetingHistoryPage;