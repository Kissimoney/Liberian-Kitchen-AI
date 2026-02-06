import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';
import { RecipeComment } from '../types';
import { User, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommentsSectionProps {
    recipeId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ recipeId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [comments, setComments] = useState<RecipeComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [recipeId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await recipeService.getComments(recipeId);
            setComments(data);
        } catch (error) {
            console.error("Failed to load comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        try {
            setSubmitting(true);
            await recipeService.addComment(recipeId, user.id, newComment.trim());
            setNewComment('');
            await fetchComments(); // Refresh comments
        } catch (error) {
            console.error("Failed to add comment:", error);
            alert("Failed to post comment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mt-8">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Comments ({comments.length})</h3>

            <div className="space-y-6 mb-8">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-amber-600" size={24} />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-stone-500 text-center py-4 italic">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="flex-shrink-0">
                                {comment.author?.avatarUrl ? (
                                    <img
                                        src={comment.author.avatarUrl}
                                        alt={comment.author.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                        <User size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="bg-stone-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-stone-900">{comment.author?.username || 'Unknown User'}</span>
                                        <span className="text-xs text-stone-400">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-stone-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t border-stone-100 pt-6">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <div className="flex-shrink-0">
                            {/* Current User Avatar */}
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                                {user.email?.substring(0, 1).toUpperCase()}
                            </div>
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-shadow"
                                disabled={submitting}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submitting}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Post Comment"
                            >
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6 bg-stone-50 rounded-lg">
                        <p className="text-stone-600 mb-2">Join the conversation</p>
                        <button
                            onClick={() => navigate('/')} // Or trigger auth modal
                            className="text-amber-600 font-medium hover:underline"
                        >
                            Sign in to post a comment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
