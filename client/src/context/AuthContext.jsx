import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile from our backend
    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setProfile(data.data);
        } catch {
            setProfile(null);
        }
    };

    // Sync profile after login/signup
    const syncProfile = async (fullName) => {
        try {
            const { data } = await api.post('/auth/sync', { full_name: fullName });
            setProfile(data.data);
            return data.data;
        } catch (err) {
            console.error('Profile sync failed:', err);
            return null;
        }
    };

    // Sign up with email/password
    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (error) throw error;

        if (data.user) {
            await syncProfile(fullName);
        }

        return data;
    };

    // Sign in with email/password
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        if (data.user) {
            await fetchProfile();
        }

        return data;
    };

    // Sign in with Google OAuth
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
    };

    // Sign out
    const signOut = async () => {
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setUser(null);
            setProfile(null);
            localStorage.clear();
        }
    };

    // Update user role
    const updateRole = async (role) => {
        try {
            const { data } = await api.put('/users/me/role', { role });
            setProfile(data.data);
            return data.data;
        } catch (err) {
            throw err;
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile();
            }
            setLoading(false);
        });

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);

                if (event === 'SIGNED_IN' && session?.user) {
                    await fetchProfile();
                } else if (event === 'SIGNED_OUT') {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateRole,
        syncProfile,
        fetchProfile,
        isAuthenticated: !!user,
        isDriver: profile?.role === 'driver' || profile?.role === 'both',
        isRider: profile?.role === 'rider' || profile?.role === 'both',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
