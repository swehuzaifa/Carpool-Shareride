import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { PublicOnlyRoute, ProtectedRoute } from '../components/auth/ProtectedRoute';
import Navbar from '../components/layout/Navbar';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import AuthCallback from '../pages/auth/AuthCallback';

// Ride pages (Phase 6)
import RideFeedPage from '../pages/rides/RideFeedPage';
import CreateRidePage from '../pages/rides/CreateRidePage';
import RideDetailPage from '../pages/rides/RideDetailPage';

// Profile
import ProfilePage from '../pages/ProfilePage';

function AppLayout({ children }) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#ffffff',
                            color: '#1a1a2e',
                            borderRadius: '16px',
                            padding: '12px 16px',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                            border: '1px solid #f0f0f5',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: { primary: '#22c55e', secondary: '#fff' },
                        },
                        error: {
                            iconTheme: { primary: '#FF6B6B', secondary: '#fff' },
                        },
                    }}
                />

                <Routes>
                    {/* Public routes (no navbar on auth pages) */}
                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <LoginPage />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <PublicOnlyRoute>
                                <SignupPage />
                            </PublicOnlyRoute>
                        }
                    />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Public routes with navbar */}
                    <Route
                        path="/"
                        element={
                            <AppLayout>
                                <HomePage />
                            </AppLayout>
                        }
                    />
                    <Route
                        path="/rides"
                        element={
                            <AppLayout>
                                <RideFeedPage />
                            </AppLayout>
                        }
                    />
                    <Route
                        path="/rides/:id"
                        element={
                            <AppLayout>
                                <RideDetailPage />
                            </AppLayout>
                        }
                    />

                    {/* Protected routes */}
                    <Route
                        path="/rides/create"
                        element={
                            <AppLayout>
                                <ProtectedRoute requiredRole="driver">
                                    <CreateRidePage />
                                </ProtectedRoute>
                            </AppLayout>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <AppLayout>
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            </AppLayout>
                        }
                    />

                    {/* 404 */}
                    <Route
                        path="*"
                        element={
                            <AppLayout>
                                <div style={{
                                    minHeight: '60vh', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', textAlign: 'center',
                                }}>
                                    <div>
                                        <p style={{ fontSize: 64, fontWeight: 800, color: 'rgba(123,104,238,.15)' }}>404</p>
                                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1B1D2A' }}>Page not found</h1>
                                        <p style={{ color: '#6B7280', marginTop: 8 }}>
                                            The page you're looking for doesn't exist.
                                        </p>
                                    </div>
                                </div>
                            </AppLayout>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
