import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, Camera, Save, User } from 'lucide-react';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', user!.id)
                .single();

            if (error) {
                console.warn(error);
            } else if (data) {
                setUsername(data.username || '');
                setAvatarUrl(data.avatar_url || '');
            }
        } catch (error) {
            console.error('Error loading user data!', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage(null);

            const updates = {
                id: user!.id,
                username,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating the data!' });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setSaving(true);
            setMessage(null);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user!.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);

            // Auto save after upload
            const updates = {
                id: user!.id,
                username,
                avatar_url: data.publicUrl,
                updated_at: new Date(),
            };
            const { error: updateError } = await supabase.from('profiles').upsert(updates);
            if (updateError) throw updateError;

            setMessage({ type: 'success', text: 'Avatar updated!' });

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-amber-600" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 min-h-screen">
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8 border-b border-stone-200 pb-4">
                Your Profile
            </h1>

            <form onSubmit={updateProfile} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-stone-100 border-4 border-white shadow-lg">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                    <User size={64} />
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-amber-700 transition-colors">
                            <Camera size={18} />
                            <input
                                type="file"
                                id="single"
                                accept="image/*"
                                onChange={uploadAvatar}
                                disabled={saving}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={user?.email}
                                disabled
                                className="w-full px-4 py-2 bg-stone-100 border border-stone-200 rounded-lg text-stone-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-stone-700 mb-1">
                                Display Name
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-shadow"
                                placeholder="Chef John Doe"
                            />
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-stone-200">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
