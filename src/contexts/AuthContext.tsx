import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    showAuthModal: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
    showAuthModal: false,
    openAuthModal: () => { },
    closeAuthModal: () => { },
});

import { recipeService } from '../services/recipeService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const openAuthModal = () => setShowAuthModal(true);
    const closeAuthModal = () => setShowAuthModal(false);

    // Helper to sync local recipes to cloud
    const syncLocalRecipes = async (userId: string) => {
        try {
            const localRecipes = JSON.parse(localStorage.getItem('liberian_recipes') || '[]');
            if (localRecipes.length > 0) {
                console.log(`Syncing ${localRecipes.length} recipes to Supabase...`);
                // Upload all local recipes
                await Promise.all(localRecipes.map((r: any) => recipeService.saveRecipe(r, userId)));

                // Clear local storage after successful sync to avoid duplicates/confusion
                // Or keep it? Clearing is safer to ensure source of truth is DB.
                localStorage.removeItem('liberian_recipes');
                console.log('Sync complete, local storage cleared.');
            }
        } catch (error) {
            console.error('Error syncing local recipes:', error);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            if (session?.user) {
                syncLocalRecipes(session.user.id);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (event === 'SIGNED_IN') {
                closeAuthModal(); // Close modal on successful sign in
                if (session?.user) {
                    syncLocalRecipes(session.user.id);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, showAuthModal, openAuthModal, closeAuthModal }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
