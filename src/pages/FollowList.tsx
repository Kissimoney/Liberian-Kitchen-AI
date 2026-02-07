import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';
import { Loader2, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { FollowButton } from '../components/FollowButton';

type TabType = 'followers' | 'following';

export const FollowList: React.FC = () => {
    const { userId, tab } = useParams<{ userId: string; tab: TabType }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>(tab || 'followers');
    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadData();
        }
    }, [userId, activeTab]);

    const loadData = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            if (activeTab === 'followers') {
                const data = await recipeService.getFollowers(userId);
                setFollowers(data);
            } else {
                const data = await recipeService.getFollowing(userId);
                setFollowing(data);
            }
        } catch (error) {
            console.error('Failed to load follow data:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentList = activeTab === 'followers' ? followers : following;

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-stone-200">
                    <button
                        onClick={() => setActiveTab('followers')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'followers'
                                ? 'text-amber-600 border-b-2 border-amber-600'
                                : 'text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        Followers
                    </button>
                    <button
                        onClick={() => setActiveTab('following')}
                        className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'following'
                                ? 'text-amber-600 border-b-2 border-amber-600'
                                : 'text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        Following
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-amber-600" size={32} />
                        </div>
                    ) : currentList.length === 0 ? (
                        <div className="text-center py-12">
                            <UsersIcon size={48} className="mx-auto text-stone-300 mb-4" />
                            <p className="text-stone-600">
                                {activeTab === 'followers'
                                    ? 'No followers yet'
                                    : 'Not following anyone yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentList.map((item) => {
                                const profile = activeTab === 'followers' ? item.profiles : item.profiles;
                                if (!profile) return null;

                                const profileUserId = profile.user_id;
                                const displayName = profile.display_name || `User ${profileUserId.substring(0, 8)}`;
                                const bio = profile.bio || '';
                                const followerCount = profile.follower_count || 0;
                                const followingCount = profile.following_count || 0;

                                return (
                                    <div
                                        key={profileUserId}
                                        className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold flex-shrink-0">
                                                {displayName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-stone-900 truncate">{displayName}</p>
                                                {bio && <p className="text-sm text-stone-500 truncate">{bio}</p>}
                                                <div className="flex gap-3 text-xs text-stone-400 mt-1">
                                                    <span>{followerCount} followers</span>
                                                    <span>{followingCount} following</span>
                                                </div>
                                            </div>
                                        </div>
                                        <FollowButton userId={profileUserId} size="sm" variant="outline" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
