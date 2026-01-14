import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import './BodyMeasurement.css';

function BodyMeasurement({ user }) {
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'weight',
        value: '',
        unit: 'lb',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const vitalTypes = {
        weight: { unit: 'lb', label: 'Weight' },
        height: { unit: 'inches', label: 'Height' },
        bloodPressure: { unit: 'mmHg', label: 'Blood Pressure' },
        pulse: { unit: 'bpm', label: 'Pulse' },
        temperature: { unit: '°F', label: 'Temperature' },
        cholesterol: { unit: 'mg/dL', label: 'Cholesterol' },
        glucose: { unit: 'mg/dL', label: 'Glucose' }
    };

    useEffect(() => {
        fetchVitals();
    }, []);

    async function fetchVitals() {
        try {
            setLoading(true);
            const data = await api.getVitals();
            setVitals(data.vitals || data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching vitals:', err);
            setError('Failed to load vitals');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api.addVital({
                type: formData.type,
                value: parseFloat(formData.value),
                unit: vitalTypes[formData.type].unit,
                date: new Date(formData.date),
                notes: formData.notes
            });
            setFormData({
                type: 'weight',
                value: '',
                unit: 'lb',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setShowForm(false);
            fetchVitals();
        } catch (err) {
            setError('Failed to save vital');
        }
    }

    async function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this vital record?')) {
            try {
                await api.deleteVital(id);
                fetchVitals();
            } catch (err) {
                setError('Failed to delete vital');
            }
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        if (name === 'type') {
            setFormData(prev => ({
                ...prev,
                type: value,
                unit: vitalTypes[value]?.unit || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    // Group vitals by type for display
    const getLatestByType = () => {
        const latest = {};
        vitals.forEach(vital => {
            if (!latest[vital.type] || new Date(vital.date) > new Date(latest[vital.type].date)) {
                latest[vital.type] = vital;
            }
        });
        return latest;
    };

    if (loading) {
        return <div className="body-measurement"><p>Loading vitals...</p></div>;
    }

    const latestVitals = getLatestByType();

    return (
        <div className="body-measurement">
            <div className="vitals-header">
                <h1>Body Measurement & Vitals</h1>
                <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                    + Add Vital
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="vital-form-container">
                    <form className="vital-form" onSubmit={handleSubmit}>
                        <h2>Record New Vital</h2>

                        <div className="form-group">
                            <label>Vital Type *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                {Object.entries(vitalTypes).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Value *</label>
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                    placeholder="Enter value"
                                    step="0.1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Unit</label>
                                <input
                                    type="text"
                                    value={vitalTypes[formData.type]?.unit || ''}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date *</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any additional notes..."
                                rows="2"
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-btn">
                                Save Vital
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="vitals-summary">
                <h2>Latest Readings</h2>
                <div className="measurements-grid">
                    {Object.entries(latestVitals).length === 0 ? (
                        <p className="no-data">No vitals recorded yet</p>
                    ) : (
                        Object.entries(latestVitals).map(([type, vital]) => (
                            <div key={type} className="measurement-card">
                                <h3>{vitalTypes[type]?.label || type}</h3>
                                <p className="value">
                                    {vital.value} <span className="unit">{vital.unit}</span>
                                </p>
                                <p className="date">
                                    {new Date(vital.date).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="vitals-history">
                <h2>All Records</h2>
                {vitals.length === 0 ? (
                    <div className="empty-state">
                        <p>No vital records yet. Add one to get started!</p>
                    </div>
                ) : (
                    <div className="vitals-list">
                        {vitals.sort((a, b) => new Date(b.date) - new Date(a.date)).map(vital => (
                            <div key={vital.id} className="vital-card">
                                <div className="vital-header">
                                    <h3>{vitalTypes[vital.type]?.label || vital.type}</h3>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(vital.id)}
                                    >
                                        Delete
                                    </button>
                                </div>

                                <div className="vital-details">
                                    <div className="detail-row">
                                        <span className="label">Value:</span>
                                        <span className="value">{vital.value} {vital.unit}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Date:</span>
                                        <span className="value">
                                            {new Date(vital.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {vital.notes && (
                                        <div className="detail-row">
                                            <span className="label">Notes:</span>
                                            <span className="value">{vital.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BodyMeasurement;