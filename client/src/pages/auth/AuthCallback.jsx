import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Handles OAuth redirect callback from Supabase
 * Supabase redirects to /auth/callback after OAuth sign-in
 */
export default function AuthCallback() {
    const { syncProfile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            // Supabase handles the token exchange via URL hash automatically
            // Just wait a moment for session to be set, then sync profile
            setTimeout(async () => {
                try {
                    await syncProfile();
                } catch (err) {
                    console.error('OAuth callback error:', err);
                }
                navigate('/', { replace: true });
            }, 1000);
        };

        handleCallback();
    }, [navigate, syncProfile]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-page">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="text-text-secondary font-medium">Completing sign in...</p>
            </div>
        </div>
    );
}
