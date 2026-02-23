import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Car, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const { signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('rider');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        setLoading(true);

        try {
            await signUp(email, password, fullName);
            toast.success('Account created! Check your email to verify.');
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            const msg = err.message || 'Google signup failed';
            if (msg.includes('provider') || err.status === 404) {
                toast.error('Google login is not yet enabled. Please enable it in your Supabase Dashboard under Authentication > Providers.');
            } else {
                toast.error(msg);
            }
        }
    };

    const roles = [
        { id: 'rider', label: '🚶 Rider', desc: 'Find & book rides' },
        { id: 'driver', label: '🚗 Driver', desc: 'Offer rides' },
        { id: 'both', label: '🔄 Both', desc: 'Ride & drive' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left — Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-primary to-primary/90 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-40 right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-coral rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Car className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">ShareRide</span>
                    </div>
                </div>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Start sharing rides<br />today.
                    </h2>
                    <p className="text-white/80 text-lg max-w-md">
                        Whether you're driving or riding, join a community that makes commuting affordable, social, and sustainable.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {['Save Money', 'Go Green', 'Meet People'].map((item, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                                <p className="text-white font-semibold text-sm">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative z-10 text-white/40 text-sm">
                    © 2026 ShareRide. All rights reserved.
                </div>
            </div>

            {/* Right — Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-bg-page">
                <div className="w-full max-w-md space-y-6">
                    <div className="lg:hidden flex items-center gap-2 justify-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ShareRide
                        </span>
                    </div>

                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-text-primary">Create account</h1>
                        <p className="text-text-secondary mt-2">Join ShareRide and start your journey</p>
                    </div>

                    {/* Google signup */}
                    <button
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-2xl text-text-primary font-medium hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-sm text-text-secondary">or</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Role selector */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">I want to</label>
                            <div className="grid grid-cols-3 gap-2">
                                {roles.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setRole(r.id)}
                                        className={`p-3 rounded-2xl border-2 text-center transition-all ${role === r.id
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-gray-200 hover:border-gray-300 text-text-secondary'
                                            }`}
                                    >
                                        <p className="text-lg">{r.label.split(' ')[0]}</p>
                                        <p className="text-xs mt-1 font-medium">{r.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
