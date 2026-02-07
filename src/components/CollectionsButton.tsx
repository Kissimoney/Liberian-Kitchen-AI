import React, { useState, useEffect } from 'react';
import { Folder, Plus, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { recipeService } from '../services/recipeService';
import { Collection } from '../types';

interface CollectionsButtonProps {
    recipeId: string;
}

export const CollectionsButton: React.FC<CollectionsButtonProps> = ({ recipeId }) => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (showModal && user) {
            loadCollections();
        }
    }, [showModal, user]);

    const loadCollections = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const [allCollections, recipeCollections] = await Promise.all([
                recipeService.getCollections(user.id),
                recipeService.getRecipeCollections(recipeId, user.id)
            ]);

            setCollections(allCollections);
            setSelectedCollections(new Set(recipeCollections.map(c => c.id)));
        } catch (error) {
            console.error('Failed to load collections:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCollection = async (collectionId: string) => {
        if (!user) return;

        try {
            setSaving(true);
            const isSelected = selectedCollections.has(collectionId);

            if (isSelected) {
                await recipeService.removeRecipeFromCollection(collectionId, recipeId);
                setSelectedCollections(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(collectionId);
                    return newSet;
                });
            } else {
                await recipeService.addRecipeToCollection(collectionId, recipeId);
                setSelectedCollections(prev => new Set(prev).add(collectionId));
            }
        } catch (error) {
            console.error('Failed to update collection:', error);
            alert('Failed to update collection');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-stone-700"
                title="Add to collection"
            >
                <Folder size={18} />
                <span className="hidden sm:inline">Collections</span>
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-serif font-bold text-stone-900">Add to Collection</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-stone-400 hover:text-stone-600"
                            >
                                ✕
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin text-amber-600" size={32} />
                            </div>
                        ) : collections.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-stone-600 mb-4">You don't have any collections yet.</p>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        window.location.hash = '/collections';
                                    }}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                                >
                                    Create Collection
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {collections.map(collection => {
                                    const isSelected = selectedCollections.has(collection.id);
                                    return (
                                        <button
                                            key={collection.id}
                                            onClick={() => toggleCollection(collection.id)}
                                            disabled={saving}
                                            className="w-full flex items-center justify-between p-3 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <Folder className="text-amber-600" size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-stone-900">{collection.name}</p>
                                                    {collection.description && (
                                                        <p className="text-xs text-stone-500 truncate">{collection.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-amber-600 border-amber-600' : 'border-stone-300'}`}>
                                                {isSelected && <Check className="text-white" size={14} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
