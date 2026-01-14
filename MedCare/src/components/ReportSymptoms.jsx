import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import './ReportSymptoms.css';

function ReportSymptoms({ user }) {
    const [symptoms, setSymptoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        symptomName: '',
        severity: 'mild',
        description: '',
        onsetDate: new Date().toISOString().split('T')[0],
        duration: '',
        relatedMedications: []
    });

    useEffect(() => {
        fetchSymptoms();
    }, []);

    async function fetchSymptoms() {
        try {
            setLoading(true);
            const data = await api.getSymptoms();
            // Handle both { symptoms: [] } and [] response formats
            setSymptoms(data.symptoms || data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching symptoms:', err);
            setError('Failed to load symptoms');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api.createSymptom(formData);
            setFormData({
                symptomName: '',
                severity: 'mild',
                description: '',
                onsetDate: new Date().toISOString().split('T')[0],
                duration: '',
                relatedMedications: []
            });
            setShowForm(false);
            fetchSymptoms();
        } catch (err) {
            setError('Failed to save symptom');
        }
    }

    async function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this symptom?')) {
            try {
                await api.deleteSymptom(id);
                fetchSymptoms();
            } catch (err) {
                setError('Failed to delete symptom');
            }
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    if (loading) {
        return <div className="report-symptoms"><p>Loading symptoms...</p></div>;
    }

    return (
        <div className="report-symptoms">
            <div className="symptoms-header">
                <h1>Report Symptoms</h1>
                <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                    + Report Symptom
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="symptom-form-container">
                    <form className="symptom-form" onSubmit={handleSubmit}>
                        <h2>Report New Symptom</h2>

                        <div className="form-group">
                            <label>Symptom Name *</label>
                            <input
                                type="text"
                                name="symptomName"
                                value={formData.symptomName}
                                onChange={handleChange}
                                placeholder="e.g., Headache, Fever"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Severity *</label>
                                <select
                                    name="severity"
                                    value={formData.severity}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="mild">Mild</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="severe">Severe</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Onset Date *</label>
                                <input
                                    type="date"
                                    name="onsetDate"
                                    value={formData.onsetDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your symptoms..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Duration</label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g., 2 days, 1 week"
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-btn">
                                Report Symptom
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

            <div className="symptoms-list">
                {symptoms.length === 0 ? (
                    <div className="empty-state">
                        <p>No symptoms reported yet.</p>
                    </div>
                ) : (
                    symptoms.map(symptom => (
                        <div key={symptom.id} className="symptom-card">
                            <div className="symptom-header">
                                <h3>{symptom.symptomName}</h3>
                                <span className={`severity-badge ${symptom.severity}`}>
                                    {symptom.severity}
                                </span>
                            </div>

                            <div className="symptom-details">
                                <div className="detail-row">
                                    <span className="label">Status:</span>
                                    <span className="value">{symptom.status || 'active'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Onset Date:</span>
                                    <span className="value">
                                        {new Date(symptom.onsetDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Duration:</span>
                                    <span className="value">{symptom.duration || 'N/A'}</span>
                                </div>
                                {symptom.description && (
                                    <div className="detail-row">
                                        <span className="label">Description:</span>
                                        <span className="value">{symptom.description}</span>
                                    </div>
                                )}
                            </div>

                            <div className="symptom-actions">
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(symptom.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ReportSymptoms;