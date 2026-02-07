import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';

interface FollowButtonProps {
    userId: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline';
    showText?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
    userId,
    size = 'md',
    variant = 'default',
    showText = true
}) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkFollowStatus();
    }, [user, userId]);

    const checkFollowStatus = async () => {
        if (!user || user.id === userId) {
            setChecking(false);
            return;
        }

        try {
            setChecking(true);
            const following = await recipeService.isFollowing(user.id, userId);
            setIsFollowing(following);
        } catch (error) {
            console.error('Failed to check follow status:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleToggleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent click handlers

        if (!user) {
            alert('Please sign in to follow users');
            return;
        }

        if (user.id === userId) return; // Can't follow yourself

        try {
            setLoading(true);

            if (isFollowing) {
                await recipeService.unfollowUser(user.id, userId);
                setIsFollowing(false);
            } else {
                await recipeService.followUser(user.id, userId);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
            alert('Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    // Don't show button for own profile
    if (!user || user.id === userId) return null;

    if (checking) {
        return (
            <button
                disabled
                className={`inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed ${getSizeClasses(size)}`}
            >
                <Loader2 size={getIconSize(size)} className="animate-spin" />
            </button>
        );
    }

    const sizeClasses = getSizeClasses(size);
    const iconSize = getIconSize(size);

    if (variant === 'outline') {
        return (
            <button
                onClick={handleToggleFollow}
                disabled={loading}
                className={`inline-flex items-center justify-center gap-2 border-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing
                        ? 'border-stone-300 text-stone-700 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                        : 'border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white'
                    } ${sizeClasses}`}
            >
                {loading ? (
                    <Loader2 size={iconSize} className="animate-spin" />
                ) : isFollowing ? (
                    <>
                        <UserMinus size={iconSize} />
                        {showText && 'Following'}
                    </>
                ) : (
                    <>
                        <UserPlus size={iconSize} />
                        {showText && 'Follow'}
                    </>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleFollow}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isFollowing
                    ? 'bg-stone-200 text-stone-700 hover:bg-red-500 hover:text-white'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                } ${sizeClasses}`}
        >
            {loading ? (
                <Loader2 size={iconSize} className="animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus size={iconSize} />
                    {showText && 'Following'}
                </>
            ) : (
                <>
                    <UserPlus size={iconSize} />
                    {showText && 'Follow'}
                </>
            )}
        </button>
    );
};

function getSizeClasses(size: 'sm' | 'md' | 'lg'): string {
    switch (size) {
        case 'sm':
            return 'px-3 py-1.5 text-xs';
        case 'lg':
            return 'px-6 py-3 text-base';
        case 'md':
        default:
            return 'px-4 py-2 text-sm';
    }
}

function getIconSize(size: 'sm' | 'md' | 'lg'): number {
    switch (size) {
        case 'sm':
            return 14;
        case 'lg':
            return 20;
        case 'md':
        default:
            return 16;
    }
}
