import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:3000/v1';

function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const res = await fetch(`${API_URL}/notifications/unread-count`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            } else if (res.status === 401) {
                // Token expired or invalid - silently ignore
                return;
            }
        } catch (error) {
            // Network errors - silently ignore
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            setLoading(true);
            const res = await fetch(`${API_URL}/notifications?limit=10`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.results || []);
            } else if (res.status === 401) {
                // Token expired or invalid - silently ignore
                return;
            }
        } catch (error) {
            // Network errors - silently ignore
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'crop_survey_verified':
                return '✅';
            case 'loss_report_verified':
                return '📋';
            case 'payment_status':
                return '💰';
            case 'system':
                return '🔔';
            default:
                return '📬';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Notifications"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600 hover:text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-green-50 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">
                            Notifications / सूचना
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <div className="text-3xl mb-2">🔔</div>
                                <p>No notifications yet</p>
                                <p className="text-sm text-gray-400">अद्याप कोणतीही सूचना नाही</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${!notification.isRead ? 'bg-green-50/50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''} text-gray-800`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
                            <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
