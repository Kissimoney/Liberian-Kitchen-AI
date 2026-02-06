import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';
import { Notification } from '../types';
import { Bell, Heart, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Notifications: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const data = await recipeService.getNotifications(user.id);
                setNotifications(data);
                // Mark as read after fetching
                if (data.some(n => !n.read)) {
                    await recipeService.markNotificationsAsRead(user.id);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    if (!user) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <p>Please sign in to view notifications.</p>
                <button onClick={() => navigate('/')} className="text-amber-600 mt-4 hover:underline">Go Home</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <Bell className="text-amber-600" size={28} />
                <h1 className="text-3xl font-serif font-bold text-stone-900">Notifications</h1>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                        <Bell size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-700">No notifications yet</h3>
                    <p className="text-stone-500">When people like or comment on your recipes, you'll see it here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => notification.recipeId && navigate(`/recipe/${notification.recipeId}`)}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${notification.read ? 'bg-white border-stone-100' : 'bg-amber-50 border-amber-100'
                                } hover:border-amber-200`}
                        >
                            <div className="flex-shrink-0">
                                {notification.actor?.avatarUrl ? (
                                    <img src={notification.actor.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                        <User size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-stone-900">
                                    <span className="font-semibold">{notification.actor?.username || 'Someone'}</span>
                                    {' '}
                                    {notification.type === 'like' && 'liked your recipe'}
                                    {notification.type === 'comment' && 'commented on your recipe'}
                                    {' '}
                                    {notification.recipe && (
                                        <span className="font-medium text-amber-700">"{notification.recipe.title}"</span>
                                    )}
                                </p>
                                <p className="text-xs text-stone-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            <div className={`p-2 rounded-full ${notification.type === 'like' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                }`}>
                                {notification.type === 'like' ? <Heart size={16} fill="currentColor" /> : <MessageCircle size={16} />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
