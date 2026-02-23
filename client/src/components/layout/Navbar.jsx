import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Car, User, LogOut, Plus, Search, Bell } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, profile, signOut, isDriver } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navLinks = [
        { to: '/', label: 'Ride Feed', icon: Search },
        ...(isDriver
            ? [{ to: '/rides/create', label: 'Offer Ride', icon: Plus }]
            : []),
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ShareRide
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive(link.to)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications */}
                                <button className="relative p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full"></span>
                                </button>

                                {/* Profile dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                            {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[120px] truncate">
                                            {profile?.full_name || 'User'}
                                        </span>
                                    </button>

                                    {profileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                                                <div className="px-4 py-3 border-b border-gray-50">
                                                    <p className="text-sm font-semibold text-text-primary">{profile?.full_name}</p>
                                                    <p className="text-xs text-text-secondary mt-0.5">{profile?.email}</p>
                                                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">
                                                        {profile?.role || 'rider'}
                                                    </span>
                                                </div>
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                                                    onClick={() => setProfileOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    My Profile
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-coral hover:bg-coral/5 w-full transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-text-primary hover:text-primary transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 shadow-sm hover:shadow-md transition-all"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu toggle */}
                        <button
                            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-xl"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white pb-4 px-4 animate-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mt-1 ${isActive(link.to)
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-secondary hover:bg-gray-50'
                                }`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
