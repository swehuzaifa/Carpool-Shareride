import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Search, Plus, MapPin, Clock, Shield, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
    const { isAuthenticated, isDriver } = useAuth();

    const features = [
        {
            icon: MapPin,
            title: 'Smart Matching',
            desc: 'Route-overlap algorithm finds rides that match your path',
            iconBg: 'bg-[#7B68EE]/10',
            iconColor: 'text-[#7B68EE]',
        },
        {
            icon: Shield,
            title: 'Verified Users',
            desc: 'All users are verified through Supabase authentication',
            iconBg: 'bg-[#22c55e]/10',
            iconColor: 'text-[#22c55e]',
        },
        {
            icon: Clock,
            title: 'Real-time Updates',
            desc: 'Live tracking and instant notifications for your rides',
            iconBg: 'bg-[#49CCF9]/10',
            iconColor: 'text-[#49CCF9]',
        },
        {
            icon: Users,
            title: 'Dual Confirmation',
            desc: 'Both driver and rider confirm for safe ride completion',
            iconBg: 'bg-[#FF6B6B]/10',
            iconColor: 'text-[#FF6B6B]',
        },
    ];

    const steps = [
        { emoji: '🔍', title: 'Search or Post', desc: 'Browse available rides or create your own offer as a driver' },
        { emoji: '🤝', title: 'Match & Book', desc: 'Find rides matching your route, negotiate price, and book' },
        { emoji: '🚗', title: 'Ride Together', desc: 'Meet at the pickup point, confirm, and enjoy the journey' },
    ];

    const stats = [
        { label: 'Rides Shared', value: '5,000+' },
        { label: 'Active Users', value: '2,000+' },
        { label: 'Cities', value: '15+' },
        { label: 'User Rating', value: '4.8 ★' },
    ];

    return (
        <div style={{ backgroundColor: '#F7F8FC', minHeight: '100vh' }}>

            {/* ── Hero ── */}
            <section style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(123,104,238,.06) 0%, transparent 50%, rgba(73,204,249,.06) 100%)',
                }} />
                <div style={{
                    maxWidth: 1200, margin: '0 auto', padding: '80px 24px 64px',
                    position: 'relative', textAlign: 'center',
                }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 20px', backgroundColor: 'rgba(123,104,238,.1)',
                        color: '#7B68EE', borderRadius: 999, fontSize: 14, fontWeight: 600,
                        marginBottom: 24,
                    }}>
                        <Car size={16} />
                        Pakistan's Carpool Marketplace
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 800,
                        color: '#1B1D2A', lineHeight: 1.15, marginBottom: 20,
                    }}>
                        Share Rides,{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #7B68EE, #49CCF9)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Save More
                        </span>
                    </h1>

                    <p style={{
                        fontSize: 18, color: '#6B7280', maxWidth: 540,
                        margin: '0 auto 32px', lineHeight: 1.7,
                    }}>
                        Find affordable rides or offer your empty seats. Smart matching connects drivers and riders heading the same way.
                    </p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/rides" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '14px 32px', backgroundColor: '#7B68EE', color: '#fff',
                            fontWeight: 600, fontSize: 15, borderRadius: 16,
                            textDecoration: 'none',
                            boxShadow: '0 8px 24px rgba(123,104,238,.3)',
                            transition: 'all .2s',
                        }}>
                            <Search size={18} />
                            Find a Ride
                        </Link>
                        {(!isAuthenticated || isDriver) && (
                            <Link to={isAuthenticated ? '/rides/create' : '/signup'} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '14px 32px', backgroundColor: '#fff', color: '#1B1D2A',
                                fontWeight: 600, fontSize: 15, borderRadius: 16,
                                border: '2px solid #E5E7EB', textDecoration: 'none',
                                transition: 'all .2s',
                            }}>
                                <Plus size={18} />
                                Offer a Ride
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1B1D2A' }}>Why ShareRide?</h2>
                    <p style={{ color: '#6B7280', marginTop: 8, fontSize: 16 }}>
                        Built with safety, convenience, and affordability in mind
                    </p>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 24,
                }}>
                    {features.map((f, i) => (
                        <div key={i} style={{
                            backgroundColor: '#fff', borderRadius: 20, padding: 28,
                            boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
                            border: '1px solid #F3F4F6',
                            transition: 'box-shadow .2s, transform .2s',
                            cursor: 'default',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div className={`${f.iconBg}`} style={{
                                width: 52, height: 52, borderRadius: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 18,
                            }}>
                                <f.icon size={24} className={f.iconColor} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1B1D2A', marginBottom: 8 }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section style={{ backgroundColor: '#fff', borderTop: '1px solid #F3F4F6' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1B1D2A' }}>How It Works</h2>
                        <p style={{ color: '#6B7280', marginTop: 8, fontSize: 16 }}>
                            Three simple steps to get started
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 40,
                    }}>
                        {steps.map((item, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 80, height: 80, margin: '0 auto 20px',
                                    background: 'linear-gradient(135deg, rgba(123,104,238,.08), rgba(73,204,249,.08))',
                                    borderRadius: 24, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: 36,
                                }}>
                                    {item.emoji}
                                </div>
                                <div style={{
                                    display: 'inline-block', padding: '2px 12px', backgroundColor: 'rgba(123,104,238,.08)',
                                    color: '#7B68EE', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                    marginBottom: 12,
                                }}>
                                    Step {i + 1}
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1B1D2A', marginBottom: 8 }}>
                                    {item.title}
                                </h3>
                                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section style={{
                background: 'linear-gradient(135deg, #7B68EE 0%, #49CCF9 100%)',
                padding: '56px 24px',
            }}>
                <div style={{
                    maxWidth: 1200, margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 32, textAlign: 'center',
                }}>
                    {stats.map((stat, i) => (
                        <div key={i}>
                            <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{stat.value}</p>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', marginTop: 4 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Footer ── */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1B1D2A', marginBottom: 12 }}>
                    Ready to start sharing rides?
                </h2>
                <p style={{ color: '#6B7280', marginBottom: 28, fontSize: 16 }}>
                    Join thousands of commuters saving money every day
                </p>
                <Link to={isAuthenticated ? '/rides' : '/signup'} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 36px', backgroundColor: '#7B68EE', color: '#fff',
                    fontWeight: 600, fontSize: 15, borderRadius: 16, textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(123,104,238,.3)',
                }}>
                    Get Started <ArrowRight size={18} />
                </Link>
            </section>
        </div>
    );
}
