import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
    User, MapPin, Star, Car, Calendar, Edit3, LogOut,
    Shield, Award, TrendingUp, Clock,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div style={{
            backgroundColor: '#fff', borderRadius: 18, padding: 24,
            border: '1px solid #F3F4F6', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        }}>
            <Icon size={24} color={color} style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 24, fontWeight: 700, color: '#1B1D2A' }}>{value}</p>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{label}</p>
        </div>
    );
}

export default function ProfilePage() {
    const { user, profile, signOut, updateRole, fetchProfile } = useAuth();
    const [myRides, setMyRides] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState(profile?.role || 'rider');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ridesRes, bookingsRes, ratingsRes] = await Promise.allSettled([
                    api.get('/rides?driver_id=me').catch(() => ({ data: { data: [] } })),
                    api.get('/bookings/me').catch(() => ({ data: { data: [] } })),
                    api.get(`/ratings/user/${profile?.id}`).catch(() => ({ data: { data: [] } })),
                ]);

                setMyRides(ridesRes.value?.data?.data || []);
                setMyBookings(bookingsRes.value?.data?.data || []);
                setRatings(ratingsRes.value?.data?.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (profile) fetchData();
    }, [profile]);

    const handleRoleChange = async () => {
        try {
            await updateRole(selectedRole);
            toast.success(`Role updated to ${selectedRole}`);
            setEditingRole(false);
            await fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update role');
        }
    };

    const handleSignOut = async () => {
        await signOut();
        toast.success('Signed out');
    };

    if (!profile) return null;

    const roleColors = {
        rider: { bg: '#49CCF915', text: '#49CCF9', label: '🚶 Rider' },
        driver: { bg: '#7B68EE15', text: '#7B68EE', label: '🚗 Driver' },
        both: { bg: '#22c55e15', text: '#22c55e', label: '🔄 Both' },
    };
    const role = roleColors[profile.role] || roleColors.rider;

    return (
        <div style={{ backgroundColor: '#F7F8FC', minHeight: '100vh' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

                {/* Profile Header */}
                <div style={{
                    backgroundColor: '#fff', borderRadius: 24, padding: 32,
                    border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    marginBottom: 24,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 20,
                        flexWrap: 'wrap', marginBottom: 24,
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7B68EE, #49CCF9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 32,
                        }}>
                            {profile.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1B1D2A' }}>
                                {profile.full_name || 'User'}
                            </h1>
                            <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                                {user?.email}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '4px 14px', borderRadius: 999,
                                    backgroundColor: role.bg, color: role.text,
                                    fontSize: 13, fontWeight: 600,
                                }}>
                                    {role.label}
                                </span>
                                <span style={{
                                    padding: '4px 14px', borderRadius: 999,
                                    backgroundColor: '#7B68EE10', color: '#7B68EE',
                                    fontSize: 12, fontWeight: 600,
                                }}>
                                    <Shield size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                    Verified
                                </span>
                                {profile.rating_avg > 0 && (
                                    <span style={{ fontSize: 14, color: '#6B7280' }}>
                                        ⭐ {Number(profile.rating_avg).toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={handleSignOut} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '10px 20px', backgroundColor: '#FF6B6B10',
                            color: '#FF6B6B', fontWeight: 600, fontSize: 13,
                            borderRadius: 12, border: '1px solid #FF6B6B30',
                            cursor: 'pointer',
                        }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>

                    {/* Role Selector */}
                    <div style={{
                        paddingTop: 20, borderTop: '1px solid #F3F4F6',
                        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1B1D2A' }}>
                            Switch Role:
                        </span>
                        {['rider', 'driver', 'both'].map(r => (
                            <button key={r} onClick={() => {
                                setSelectedRole(r);
                                setEditingRole(true);
                            }} style={{
                                padding: '6px 18px', borderRadius: 12,
                                border: selectedRole === r ? `2px solid ${roleColors[r].text}` : '2px solid #E5E7EB',
                                backgroundColor: selectedRole === r ? roleColors[r].bg : '#fff',
                                color: selectedRole === r ? roleColors[r].text : '#6B7280',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                textTransform: 'capitalize',
                            }}>
                                {r}
                            </button>
                        ))}
                        {editingRole && selectedRole !== profile.role && (
                            <button onClick={handleRoleChange} style={{
                                padding: '6px 18px', borderRadius: 12,
                                backgroundColor: '#7B68EE', color: '#fff',
                                fontWeight: 600, fontSize: 13, border: 'none',
                                cursor: 'pointer',
                            }}>
                                Save
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 16, marginBottom: 24,
                }}>
                    <StatCard icon={Car} label="Total Rides" value={profile.total_rides || 0} color="#7B68EE" />
                    <StatCard icon={Star} label="Rating" value={profile.rating_avg > 0 ? Number(profile.rating_avg).toFixed(1) : '—'} color="#F59E0B" />
                    <StatCard icon={TrendingUp} label="Bookings" value={myBookings.length} color="#22c55e" />
                    <StatCard icon={Award} label="Reviews" value={ratings.length} color="#49CCF9" />
                </div>

                {/* Recent Bookings */}
                <div style={{
                    backgroundColor: '#fff', borderRadius: 24, padding: 28,
                    border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    marginBottom: 24,
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1B1D2A', marginBottom: 20 }}>
                        📅 Recent Bookings
                    </h2>
                    {myBookings.length === 0 ? (
                        <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', padding: 24 }}>
                            No bookings yet. Find a ride to get started!
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {myBookings.slice(0, 5).map(b => {
                                const statusColor = {
                                    pending: '#F59E0B', confirmed: '#22c55e',
                                    completed: '#6B7280', cancelled: '#FF6B6B',
                                }[b.status] || '#6B7280';

                                return (
                                    <div key={b.id} style={{
                                        padding: '16px 18px', backgroundColor: '#F7F8FC',
                                        borderRadius: 14, display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', flexWrap: 'wrap', gap: 8,
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: 500, color: '#1B1D2A', fontSize: 14 }}>
                                                {b.ride?.origin_address || 'Origin'} → {b.ride?.destination_address || 'Dest'}
                                            </p>
                                            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                                                <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                                {b.ride?.departure_time
                                                    ? new Date(b.ride.departure_time).toLocaleDateString()
                                                    : '—'}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: 999,
                                            backgroundColor: `${statusColor}15`, color: statusColor,
                                            fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                                        }}>
                                            {b.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Reviews */}
                <div style={{
                    backgroundColor: '#fff', borderRadius: 24, padding: 28,
                    border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1B1D2A', marginBottom: 20 }}>
                        ⭐ Reviews
                    </h2>
                    {ratings.length === 0 ? (
                        <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', padding: 24 }}>
                            No reviews yet
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {ratings.slice(0, 5).map(r => (
                                <div key={r.id} style={{
                                    padding: '16px 18px', backgroundColor: '#F7F8FC',
                                    borderRadius: 14,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #7B68EE, #49CCF9)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 700, fontSize: 12,
                                        }}>
                                            {r.from_user?.full_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 14 }}>
                                            {r.from_user?.full_name || 'User'}
                                        </p>
                                        <span style={{ fontSize: 13, color: '#F59E0B', marginLeft: 'auto' }}>
                                            {'⭐'.repeat(r.rating)}
                                        </span>
                                    </div>
                                    {r.review && (
                                        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                                            "{r.review}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
