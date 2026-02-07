import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';
import { Collection } from '../types';
import { FolderPlus, Loader2, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Collections: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (user) {
            loadCollections();
        }
    }, [user]);

    const loadCollections = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await recipeService.getCollections(user.id);
            setCollections(data);
        } catch (error) {
            console.error('Failed to load collections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!user || !newName.trim()) return;

        try {
            setCreating(true);
            await recipeService.createCollection(user.id, newName.trim(), newDescription.trim() || undefined);
            setNewName('');
            setNewDescription('');
            setShowCreateModal(false);
            await loadCollections();
        } catch (error) {
            console.error('Failed to create collection:', error);
            alert('Failed to create collection');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (collectionId: string) => {
        if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) return;

        try {
            await recipeService.deleteCollection(collectionId);
            setCollections(prev => prev.filter(c => c.id !== collectionId));
        } catch (error) {
            console.error('Failed to delete collection:', error);
            alert('Failed to delete collection');
        }
    };

    if (!user) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="text-center">
                    <p className="text-stone-600 mb-4">Please sign in to view your collections</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">My Collections</h1>
                    <p className="text-stone-600 mt-2">Organize your favorite recipes into custom collections</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                    <FolderPlus size={20} />
                    New Collection
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-amber-600" size={32} />
                </div>
            ) : collections.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-xl">
                    <FolderOpen size={64} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-xl font-semibold text-stone-900 mb-2">No Collections Yet</h3>
                    <p className="text-stone-600 mb-6">Create your first collection to organize your recipes</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                        Create Collection
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map(collection => (
                        <div
                            key={collection.id}
                            className="bg-white border border-stone-200 rounded-xl p-6 hover:shadow-lg transition-shadow group cursor-pointer"
                            onClick={() => navigate(`/collections/${collection.id}`)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <FolderOpen className="text-amber-600" size={24} />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(collection.id);
                                    }}
                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{collection.name}</h3>
                            {collection.description && (
                                <p className="text-stone-600 text-sm mb-3 line-clamp-2">{collection.description}</p>
                            )}
                            <div className="text-sm text-stone-500">
                                {collection.recipeCount || 0} recipe{collection.recipeCount !== 1 ? 's' : ''}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">New Collection</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Sunday Dinners"
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Optional description..."
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                                    rows={3}
                                    maxLength={200}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewName('');
                                    setNewDescription('');
                                }}
                                className="flex-1 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50"
                                disabled={creating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newName.trim() || creating}
                                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {creating ? <Loader2 size={16} className="animate-spin" /> : null}
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
