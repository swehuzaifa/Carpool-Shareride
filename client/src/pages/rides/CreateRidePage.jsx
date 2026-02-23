import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
    MapPin, Calendar, Clock, Users, DollarSign, Car,
    ArrowLeft, CheckCircle, AlertCircle
} from 'lucide-react';

export default function CreateRidePage() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = route, 2 = details, 3 = confirm

    const [form, setForm] = useState({
        origin_address: '',
        destination_address: '',
        origin_lat: '',
        origin_lng: '',
        destination_lat: '',
        destination_lng: '',
        departure_time: '',
        total_seats: '3',
        price_per_seat: '',
        vehicle_info: '',
        notes: '',
    });

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                origin_address: form.origin_address,
                destination_address: form.destination_address,
                origin_lat: parseFloat(form.origin_lat) || 24.8607,
                origin_lng: parseFloat(form.origin_lng) || 67.0011,
                destination_lat: parseFloat(form.destination_lat) || 25.3960,
                destination_lng: parseFloat(form.destination_lng) || 68.3578,
                departure_time: new Date(form.departure_time).toISOString(),
                total_seats: parseInt(form.total_seats),
                price_per_seat: parseInt(form.price_per_seat),
                vehicle_info: form.vehicle_info || null,
                notes: form.notes || null,
            };

            await api.post('/rides', payload);
            toast.success('Ride created successfully!');
            navigate('/rides');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create ride');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '14px 14px 14px 44px',
        border: '2px solid #E5E7EB', borderRadius: 14,
        outline: 'none', fontSize: 14, color: '#1B1D2A',
        transition: 'border-color .2s', backgroundColor: '#fff',
    };

    const labelStyle = {
        display: 'block', fontSize: 13, fontWeight: 600,
        color: '#1B1D2A', marginBottom: 8,
    };

    const canNext1 = form.origin_address && form.destination_address;
    const canNext2 = form.departure_time && form.price_per_seat && form.total_seats;

    return (
        <div style={{ backgroundColor: '#F7F8FC', minHeight: '100vh' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 80px' }}>

                {/* Back + Title */}
                <button onClick={() => navigate(-1)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 14, color: '#6B7280', background: 'none',
                    border: 'none', cursor: 'pointer', marginBottom: 24,
                }}>
                    <ArrowLeft size={18} /> Back
                </button>

                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B1D2A', marginBottom: 8 }}>
                    🚗 Create a Ride
                </h1>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 40 }}>
                    Fill in the details to offer a ride to others
                </p>

                {/* Steps indicator */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
                    {[
                        { num: 1, label: 'Route' },
                        { num: 2, label: 'Details' },
                        { num: 3, label: 'Confirm' },
                    ].map(s => (
                        <div key={s.num} style={{
                            flex: 1, textAlign: 'center',
                        }}>
                            <div style={{
                                height: 4, borderRadius: 4, marginBottom: 8,
                                backgroundColor: step >= s.num ? '#7B68EE' : '#E5E7EB',
                                transition: 'background-color .3s',
                            }} />
                            <span style={{
                                fontSize: 12, fontWeight: 600,
                                color: step >= s.num ? '#7B68EE' : '#9CA3AF',
                            }}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Step 1: Route */}
                {step === 1 && (
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 24, padding: 32,
                        border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1B1D2A', marginBottom: 24 }}>
                            Where are you going?
                        </h2>

                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Pickup Location</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={16} color="#7B68EE" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text" placeholder="e.g. Gulshan-e-Iqbal, Karachi"
                                    value={form.origin_address}
                                    onChange={e => update('origin_address', e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#7B68EE'}
                                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Drop-off Location</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={16} color="#FF6B6B" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text" placeholder="e.g. Hyderabad, Sindh"
                                    value={form.destination_address}
                                    onChange={e => update('destination_address', e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#7B68EE'}
                                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        {/* Optional coords */}
                        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                            💡 Coordinates are auto-set. You can override them for precise matching.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                            <input
                                type="number" step="any" placeholder="Origin Lat"
                                value={form.origin_lat} onChange={e => update('origin_lat', e.target.value)}
                                style={{ ...inputStyle, paddingLeft: 14, fontSize: 13 }}
                            />
                            <input
                                type="number" step="any" placeholder="Origin Lng"
                                value={form.origin_lng} onChange={e => update('origin_lng', e.target.value)}
                                style={{ ...inputStyle, paddingLeft: 14, fontSize: 13 }}
                            />
                            <input
                                type="number" step="any" placeholder="Dest Lat"
                                value={form.destination_lat} onChange={e => update('destination_lat', e.target.value)}
                                style={{ ...inputStyle, paddingLeft: 14, fontSize: 13 }}
                            />
                            <input
                                type="number" step="any" placeholder="Dest Lng"
                                value={form.destination_lng} onChange={e => update('destination_lng', e.target.value)}
                                style={{ ...inputStyle, paddingLeft: 14, fontSize: 13 }}
                            />
                        </div>

                        <button onClick={() => setStep(2)} disabled={!canNext1} style={{
                            width: '100%', padding: 14, backgroundColor: canNext1 ? '#7B68EE' : '#E5E7EB',
                            color: canNext1 ? '#fff' : '#9CA3AF', fontWeight: 600, fontSize: 15,
                            borderRadius: 14, border: 'none', cursor: canNext1 ? 'pointer' : 'not-allowed',
                        }}>
                            Continue →
                        </button>
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 24, padding: 32,
                        border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1B1D2A', marginBottom: 24 }}>
                            Ride Details
                        </h2>

                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Departure Date & Time</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} color="#7B68EE" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="datetime-local"
                                    value={form.departure_time}
                                    onChange={e => update('departure_time', e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#7B68EE'}
                                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label style={labelStyle}>Available Seats</label>
                                <div style={{ position: 'relative' }}>
                                    <Users size={16} color="#7B68EE" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <select
                                        value={form.total_seats}
                                        onChange={e => update('total_seats', e.target.value)}
                                        style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                            <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Price per Seat (Rs.)</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} color="#7B68EE" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="number" min="1" placeholder="500"
                                        value={form.price_per_seat}
                                        onChange={e => update('price_per_seat', e.target.value)}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#7B68EE'}
                                        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Vehicle Info (optional)</label>
                            <div style={{ position: 'relative' }}>
                                <Car size={16} color="#7B68EE" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text" placeholder="e.g. White Honda Civic 2020"
                                    value={form.vehicle_info}
                                    onChange={e => update('vehicle_info', e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#7B68EE'}
                                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label style={labelStyle}>Notes (optional)</label>
                            <textarea
                                placeholder="Any additional info for riders..."
                                value={form.notes}
                                onChange={e => update('notes', e.target.value)}
                                rows={3}
                                style={{
                                    ...inputStyle, paddingLeft: 14,
                                    resize: 'vertical', minHeight: 80,
                                    fontFamily: 'inherit',
                                }}
                                onFocus={e => e.target.style.borderColor = '#7B68EE'}
                                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setStep(1)} style={{
                                flex: 1, padding: 14, backgroundColor: '#F7F8FC',
                                color: '#6B7280', fontWeight: 600, fontSize: 15,
                                borderRadius: 14, border: '2px solid #E5E7EB', cursor: 'pointer',
                            }}>
                                ← Back
                            </button>
                            <button onClick={() => setStep(3)} disabled={!canNext2} style={{
                                flex: 2, padding: 14,
                                backgroundColor: canNext2 ? '#7B68EE' : '#E5E7EB',
                                color: canNext2 ? '#fff' : '#9CA3AF',
                                fontWeight: 600, fontSize: 15,
                                borderRadius: 14, border: 'none',
                                cursor: canNext2 ? 'pointer' : 'not-allowed',
                            }}>
                                Review →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 24, padding: 32,
                        border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1B1D2A', marginBottom: 24 }}>
                            Review Your Ride
                        </h2>

                        <div style={{
                            backgroundColor: '#F7F8FC', borderRadius: 16, padding: 24,
                            marginBottom: 24,
                        }}>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 4 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#7B68EE' }} />
                                    <div style={{ width: 2, height: 24, backgroundColor: '#E5E7EB' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 15, marginBottom: 10 }}>
                                        {form.origin_address}
                                    </p>
                                    <p style={{ fontWeight: 600, color: '#1B1D2A', fontSize: 15 }}>
                                        {form.destination_address}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                gap: 16, paddingTop: 16, borderTop: '1px solid #E5E7EB',
                            }}>
                                <div>
                                    <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Departure</p>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1B1D2A' }}>
                                        {form.departure_time ? new Date(form.departure_time).toLocaleString([], {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        }) : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Seats</p>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1B1D2A' }}>{form.total_seats}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Price / Seat</p>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#7B68EE' }}>Rs. {form.price_per_seat}</p>
                                </div>
                            </div>

                            {form.vehicle_info && (
                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                                    <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Vehicle</p>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: '#1B1D2A' }}>{form.vehicle_info}</p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setStep(2)} style={{
                                flex: 1, padding: 14, backgroundColor: '#F7F8FC',
                                color: '#6B7280', fontWeight: 600, fontSize: 15,
                                borderRadius: 14, border: '2px solid #E5E7EB', cursor: 'pointer',
                            }}>
                                ← Edit
                            </button>
                            <button onClick={handleSubmit} disabled={loading} style={{
                                flex: 2, padding: 14,
                                backgroundColor: '#7B68EE',
                                color: '#fff', fontWeight: 600, fontSize: 15,
                                borderRadius: 14, border: 'none', cursor: 'pointer',
                                opacity: loading ? 0.6 : 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}>
                                {loading ? (
                                    <>
                                        <span style={{
                                            width: 16, height: 16, border: '2px solid #fff',
                                            borderTopColor: 'transparent', borderRadius: '50%',
                                            display: 'inline-block', animation: 'spin 1s linear infinite',
                                        }} />
                                        Creating...
                                    </>
                                ) : (
                                    <><CheckCircle size={18} /> Publish Ride</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
