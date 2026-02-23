import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import {
    MapPin, Clock, Users, DollarSign, Search,
    Filter, Plus, Calendar, Car, ArrowRight, X, ChevronDown,
} from 'lucide-react';

function RideCard({ ride }) {
    const departDate = new Date(ride.departure_time);
    const isToday = new Date().toDateString() === departDate.toDateString();
    const timeStr = departDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = isToday
        ? `Today, ${timeStr}`
        : departDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${timeStr}`;

    const statusColors = {
        active: { bg: '#22c55e15', text: '#22c55e', label: 'Active' },
        full: { bg: '#F59E0B15', text: '#F59E0B', label: 'Full' },
        completed: { bg: '#6B728015', text: '#6B7280', label: 'Done' },
        cancelled: { bg: '#FF6B6B15', text: '#FF6B6B', label: 'Cancelled' },
    };
    const status = statusColors[ride.status] || statusColors.active;

    return (
        <Link to={`/rides/${ride.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
                backgroundColor: '#fff', borderRadius: 20, padding: 24,
                border: '1px solid #F3F4F6',
                boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                transition: 'box-shadow .2s, transform .2s',
                cursor: 'pointer',
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7B68EE, #49CCF9)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 15,
                        }}>
                            {ride.driver_name?.[0]?.toUpperCase() || 'D'}
                        </div>
                        <div>
                            <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 14 }}>
                                {ride.driver_name || 'Driver'}
                            </p>
                            {ride.driver_rating && (
                                <p style={{ fontSize: 12, color: '#6B7280' }}>
                                    ⭐ {Number(ride.driver_rating).toFixed(1)}
                                </p>
                            )}
                        </div>
                    </div>
                    <span style={{
                        padding: '4px 12px', borderRadius: 999,
                        backgroundColor: status.bg, color: status.text,
                        fontSize: 12, fontWeight: 600,
                    }}>
                        {status.label}
                    </span>
                </div>

                {/* Route */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#7B68EE' }} />
                        <div style={{ width: 2, height: 24, backgroundColor: '#E5E7EB' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 14, marginBottom: 8 }}>
                            {ride.origin_address || 'Origin'}
                        </p>
                        <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 14 }}>
                            {ride.destination_address || 'Destination'}
                        </p>
                    </div>
                </div>

                {/* Meta row */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 16,
                    paddingTop: 16, borderTop: '1px solid #F3F4F6',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="#6B7280" />
                        <span style={{ fontSize: 13, color: '#6B7280' }}>{dateStr}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} color="#6B7280" />
                        <span style={{ fontSize: 13, color: '#6B7280' }}>
                            {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                        <DollarSign size={14} color="#7B68EE" />
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#7B68EE' }}>
                            Rs. {ride.price_per_seat}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function RideFeedPage() {
    const { isAuthenticated, isDriver } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchOrigin, setSearchOrigin] = useState('');
    const [searchDest, setSearchDest] = useState('');
    const [sortBy, setSortBy] = useState('departure_time');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
    const [showFilters, setShowFilters] = useState(false);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 12, sort_by: sortBy, order: 'asc' });
            if (searchOrigin) params.append('origin', searchOrigin);
            if (searchDest) params.append('destination', searchDest);

            const { data } = await api.get(`/rides?${params}`);
            setRides(data.data || []);
            setPagination(data.pagination || {});
        } catch (err) {
            console.error('Failed to fetch rides:', err);
            setRides([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRides(); }, [page, sortBy]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchRides();
    };

    return (
        <div style={{ backgroundColor: '#F7F8FC', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

                {/* Page Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 32, flexWrap: 'wrap', gap: 16,
                }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1D2A' }}>
                            🚗 Available Rides
                        </h1>
                        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                            {pagination.total || 0} ride{pagination.total !== 1 ? 's' : ''} available
                        </p>
                    </div>
                    {isAuthenticated && isDriver && (
                        <Link to="/rides/create" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '12px 24px', backgroundColor: '#7B68EE', color: '#fff',
                            fontWeight: 600, fontSize: 14, borderRadius: 14, textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(123,104,238,.3)',
                        }}>
                            <Plus size={18} /> Create Ride
                        </Link>
                    )}
                </div>

                {/* Search & Filter Bar */}
                <form onSubmit={handleSearch} style={{
                    backgroundColor: '#fff', borderRadius: 20, padding: 20,
                    marginBottom: 32, border: '1px solid #F3F4F6',
                    boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: '1 1 200px', position: 'relative' }}>
                            <MapPin size={16} color="#6B7280" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text" placeholder="From where?"
                                value={searchOrigin} onChange={e => setSearchOrigin(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px',
                                    border: '2px solid #E5E7EB', borderRadius: 14,
                                    outline: 'none', fontSize: 14, color: '#1B1D2A',
                                    transition: 'border-color .2s',
                                }}
                                onFocus={e => e.target.style.borderColor = '#7B68EE'}
                                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>
                        <div style={{ flex: '1 1 200px', position: 'relative' }}>
                            <MapPin size={16} color="#FF6B6B" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text" placeholder="Where to?"
                                value={searchDest} onChange={e => setSearchDest(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px',
                                    border: '2px solid #E5E7EB', borderRadius: 14,
                                    outline: 'none', fontSize: 14, color: '#1B1D2A',
                                    transition: 'border-color .2s',
                                }}
                                onFocus={e => e.target.style.borderColor = '#7B68EE'}
                                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>
                        <button type="submit" style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '12px 24px', backgroundColor: '#7B68EE', color: '#fff',
                            fontWeight: 600, fontSize: 14, borderRadius: 14, border: 'none',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                        }}>
                            <Search size={16} /> Search
                        </button>
                        <button type="button" onClick={() => setShowFilters(!showFilters)} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '12px 16px', backgroundColor: showFilters ? '#7B68EE10' : '#F7F8FC',
                            color: showFilters ? '#7B68EE' : '#6B7280',
                            fontWeight: 500, fontSize: 14, borderRadius: 14,
                            border: showFilters ? '2px solid #7B68EE40' : '2px solid #E5E7EB',
                            cursor: 'pointer',
                        }}>
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div style={{
                            marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6',
                            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Sort by:</span>
                            {[
                                { id: 'departure_time', label: 'Departure' },
                                { id: 'price_per_seat', label: 'Price' },
                                { id: 'created_at', label: 'Newest' },
                            ].map(s => (
                                <button key={s.id} type="button" onClick={() => setSortBy(s.id)} style={{
                                    padding: '6px 16px', borderRadius: 10,
                                    border: sortBy === s.id ? '2px solid #7B68EE' : '2px solid #E5E7EB',
                                    backgroundColor: sortBy === s.id ? '#7B68EE10' : '#fff',
                                    color: sortBy === s.id ? '#7B68EE' : '#6B7280',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                }}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    )}
                </form>

                {/* Ride Grid */}
                {loading ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: 20,
                    }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{
                                backgroundColor: '#fff', borderRadius: 20, padding: 24,
                                border: '1px solid #F3F4F6', height: 220,
                            }}>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F3F4F6' }} />
                                    <div>
                                        <div style={{ width: 100, height: 14, backgroundColor: '#F3F4F6', borderRadius: 6, marginBottom: 6 }} />
                                        <div style={{ width: 60, height: 10, backgroundColor: '#F3F4F6', borderRadius: 6 }} />
                                    </div>
                                </div>
                                <div style={{ width: '80%', height: 14, backgroundColor: '#F3F4F6', borderRadius: 6, marginBottom: 10 }} />
                                <div style={{ width: '60%', height: 14, backgroundColor: '#F3F4F6', borderRadius: 6 }} />
                            </div>
                        ))}
                    </div>
                ) : rides.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px',
                        backgroundColor: '#fff', borderRadius: 24,
                        border: '1px solid #F3F4F6',
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🛣️</div>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1B1D2A', marginBottom: 8 }}>
                            No rides available yet
                        </h3>
                        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                            {searchOrigin || searchDest
                                ? 'Try adjusting your search criteria'
                                : 'Be the first to offer a ride!'}
                        </p>
                        {isAuthenticated && isDriver && (
                            <Link to="/rides/create" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '12px 28px', backgroundColor: '#7B68EE', color: '#fff',
                                fontWeight: 600, fontSize: 14, borderRadius: 14, textDecoration: 'none',
                            }}>
                                <Plus size={16} /> Create First Ride
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: 20,
                        }}>
                            {rides.map(ride => <RideCard key={ride.id} ride={ride} />)}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div style={{
                                display: 'flex', justifyContent: 'center', gap: 8,
                                marginTop: 40,
                            }}>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)} style={{
                                        width: 40, height: 40, borderRadius: 12,
                                        border: p === page ? '2px solid #7B68EE' : '2px solid #E5E7EB',
                                        backgroundColor: p === page ? '#7B68EE' : '#fff',
                                        color: p === page ? '#fff' : '#6B7280',
                                        fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                    }}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
