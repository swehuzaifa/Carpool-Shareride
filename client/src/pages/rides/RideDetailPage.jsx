import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    MapPin, Calendar, Users, DollarSign, Car, ArrowLeft,
    User, Star, MessageSquare, Clock, Shield, Phone,
} from 'lucide-react';

export default function RideDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, profile } = useAuth();
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRide = async () => {
            try {
                const { data } = await api.get(`/rides/${id}`);
                setRide(data.data);
            } catch (err) {
                toast.error('Ride not found');
                navigate('/rides');
            } finally {
                setLoading(false);
            }
        };
        fetchRide();
    }, [id]);

    if (loading) {
        return (
            <div style={{ backgroundColor: '#F7F8FC', minHeight: '100vh' }}>
                <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 24, padding: 32,
                        border: '1px solid #F3F4F6',
                    }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                height: 20, backgroundColor: '#F3F4F6', borderRadius: 8,
                                marginBottom: 16, width: `${80 - i * 10}%`,
                            }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!ride) return null;

    const departDate = new Date(ride.departure_time);
    const dateStr = departDate.toLocaleDateString([], {
        weekday: 'long', month: 'long', day: 'numeric',
    });
    const timeStr = departDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isOwner = profile?.id === ride.driver_id;
    const isPast = departDate < new Date();

    const statusColors = {
        active: { bg: '#22c55e15', text: '#22c55e', label: '● Active' },
        full: { bg: '#F59E0B15', text: '#F59E0B', label: '● Full' },
        in_progress: { bg: '#7B68EE15', text: '#7B68EE', label: '● In Progress' },
        completed: { bg: '#6B728015', text: '#6B7280', label: '● Completed' },
        cancelled: { bg: '#FF6B6B15', text: '#FF6B6B', label: '● Cancelled' },
    };
    const status = statusColors[ride.status] || statusColors.active;

    return (
        <div style={{ backgroundColor: '#F7F8FC', minHeight: '100vh' }}>
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

                <button onClick={() => navigate('/rides')} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 14, color: '#6B7280', background: 'none',
                    border: 'none', cursor: 'pointer', marginBottom: 24,
                }}>
                    <ArrowLeft size={18} /> Back to Rides
                </button>

                {/* Main Card */}
                <div style={{
                    backgroundColor: '#fff', borderRadius: 24, padding: 32,
                    border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    marginBottom: 24,
                }}>
                    {/* Status + Driver */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #7B68EE, #49CCF9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: 20,
                            }}>
                                {ride.driver_name?.[0]?.toUpperCase() || 'D'}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 16 }}>
                                    {ride.driver_name || 'Driver'}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    {ride.driver_rating && (
                                        <span style={{ fontSize: 13, color: '#6B7280' }}>
                                            ⭐ {Number(ride.driver_rating).toFixed(1)}
                                        </span>
                                    )}
                                    <span style={{
                                        fontSize: 11, color: '#7B68EE', fontWeight: 600,
                                        backgroundColor: '#7B68EE10', padding: '2px 8px', borderRadius: 6,
                                    }}>
                                        <Shield size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                        <span style={{
                            padding: '6px 16px', borderRadius: 999,
                            backgroundColor: status.bg, color: status.text,
                            fontSize: 13, fontWeight: 600,
                        }}>
                            {status.label}
                        </span>
                    </div>

                    {/* Route */}
                    <div style={{
                        backgroundColor: '#F7F8FC', borderRadius: 16, padding: 24,
                        marginBottom: 24,
                    }}>
                        <div style={{ display: 'flex', gap: 14 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 4 }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#7B68EE', border: '3px solid #7B68EE40' }} />
                                <div style={{ width: 2, height: 32, backgroundColor: '#E5E7EB' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF6B6B', border: '3px solid #FF6B6B40' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: 16 }}>
                                    <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Pickup</p>
                                    <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 16 }}>
                                        {ride.origin_address || 'Origin'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Drop-off</p>
                                    <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 16 }}>
                                        {ride.destination_address || 'Destination'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 16, marginBottom: 24,
                    }}>
                        <div style={{
                            backgroundColor: '#F7F8FC', borderRadius: 14, padding: 18, textAlign: 'center',
                        }}>
                            <Calendar size={20} color="#7B68EE" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Date</p>
                            <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 14 }}>{dateStr}</p>
                        </div>
                        <div style={{
                            backgroundColor: '#F7F8FC', borderRadius: 14, padding: 18, textAlign: 'center',
                        }}>
                            <Clock size={20} color="#7B68EE" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Time</p>
                            <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 14 }}>{timeStr}</p>
                        </div>
                        <div style={{
                            backgroundColor: '#F7F8FC', borderRadius: 14, padding: 18, textAlign: 'center',
                        }}>
                            <Users size={20} color="#7B68EE" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Seats Left</p>
                            <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 14 }}>
                                {ride.available_seats} / {ride.total_seats}
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: '#7B68EE10', borderRadius: 14, padding: 18, textAlign: 'center',
                        }}>
                            <DollarSign size={20} color="#7B68EE" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Price</p>
                            <p style={{ fontWeight: 700, color: '#7B68EE', fontSize: 18 }}>Rs. {ride.price_per_seat}</p>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    {ride.vehicle_info && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 18px', backgroundColor: '#F7F8FC', borderRadius: 14,
                            marginBottom: 24,
                        }}>
                            <Car size={20} color="#6B7280" />
                            <div>
                                <p style={{ fontSize: 12, color: '#6B7280' }}>Vehicle</p>
                                <p style={{ fontWeight: 500, color: '#1B1D2A', fontSize: 14 }}>{ride.vehicle_info}</p>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {ride.notes && (
                        <div style={{
                            padding: '14px 18px', backgroundColor: '#FFC14510', borderRadius: 14,
                            border: '1px solid #FFC14530', marginBottom: 24,
                        }}>
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>📝 Notes</p>
                            <p style={{ fontSize: 14, color: '#1B1D2A' }}>{ride.notes}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!isOwner && isAuthenticated && ride.status === 'active' && ride.available_seats > 0 && !isPast && (
                        <button
                            onClick={() => toast.success('Booking feature coming in Phase 7!')}
                            style={{
                                width: '100%', padding: 16,
                                backgroundColor: '#7B68EE', color: '#fff',
                                fontWeight: 600, fontSize: 16, borderRadius: 16,
                                border: 'none', cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(123,104,238,.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                        >
                            <MessageSquare size={18} /> Request to Book
                        </button>
                    )}

                    {!isAuthenticated && (
                        <Link to="/signup" style={{
                            display: 'block', textAlign: 'center', width: '100%', padding: 16,
                            backgroundColor: '#7B68EE', color: '#fff',
                            fontWeight: 600, fontSize: 16, borderRadius: 16,
                            textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(123,104,238,.3)',
                        }}>
                            Sign Up to Book This Ride
                        </Link>
                    )}

                    {isOwner && (
                        <div style={{
                            padding: '14px 18px', backgroundColor: '#7B68EE10', borderRadius: 14,
                            textAlign: 'center',
                        }}>
                            <p style={{ fontSize: 14, color: '#7B68EE', fontWeight: 500 }}>
                                🚗 This is your ride
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
