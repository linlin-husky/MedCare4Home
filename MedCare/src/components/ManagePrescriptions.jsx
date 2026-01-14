import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import './ManagePrescriptions.css';

function ManagePrescriptions({ user }) {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        medicationName: '',
        dosage: '',
        frequency: '',
        instructions: '',
        prescribedBy: '',
        refillsRemaining: 0,
        sideEffects: ''
    });

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    async function fetchPrescriptions() {
        try {
            setLoading(true);
            const data = await api.getPrescriptions();
            // Handle both { medications: [] } and [] response formats
            setPrescriptions(data.medications || data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
            setError('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if (editingId) {
                await api.updatePrescription(editingId, formData);
            } else {
                await api.createPrescription(formData);
            }
            setFormData({
                medicationName: '',
                dosage: '',
                frequency: '',
                instructions: '',
                prescribedBy: '',
                refillsRemaining: 0,
                sideEffects: ''
            });
            setShowForm(false);
            setEditingId(null);
            fetchPrescriptions();
        } catch (err) {
            setError('Failed to save prescription');
        }
    }

    function handleEdit(prescription) {
        setFormData({
            medicationName: prescription.medicationName || prescription.name,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            instructions: prescription.instructions,
            prescribedBy: prescription.prescribedBy,
            refillsRemaining: prescription.refillsRemaining,
            sideEffects: prescription.sideEffects
        });
        setEditingId(prescription.id);
        setShowForm(true);
    }

    async function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            try {
                await api.deletePrescription(id);
                fetchPrescriptions();
            } catch (err) {
                setError('Failed to delete prescription');
            }
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'refillsRemaining' ? parseInt(value) : value
        }));
    }

    if (loading) {
        return <div className="manage-prescriptions"><p>Loading prescriptions...</p></div>;
    }

    return (
        <div className="manage-prescriptions">
            <div className="prescriptions-header">
                <h1>Manage Prescriptions</h1>
                <button className="add-btn" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
                    + Add Prescription
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <div className="prescription-form-container">
                    <form className="prescription-form" onSubmit={handleSubmit}>
                        <h2>{editingId ? 'Edit Prescription' : 'Add New Prescription'}</h2>

                        <div className="form-group">
                            <label>Medication Name *</label>
                            <input
                                type="text"
                                name="medicationName"
                                value={formData.medicationName}
                                onChange={handleChange}
                                placeholder="e.g., Acetaminophen"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Dosage *</label>
                                <input
                                    type="text"
                                    name="dosage"
                                    value={formData.dosage}
                                    onChange={handleChange}
                                    placeholder="e.g., 500mg"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Frequency *</label>
                                <input
                                    type="text"
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleChange}
                                    placeholder="e.g., 1 pill, twice daily"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Instructions</label>
                            <textarea
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                placeholder="e.g., Take with food, avoid milk"
                                rows="2"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Prescribed By</label>
                                <input
                                    type="text"
                                    name="prescribedBy"
                                    value={formData.prescribedBy}
                                    onChange={handleChange}
                                    placeholder="e.g., Dr. Johnson"
                                />
                            </div>

                            <div className="form-group">
                                <label>Refills Remaining</label>
                                <input
                                    type="number"
                                    name="refillsRemaining"
                                    value={formData.refillsRemaining}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Side Effects</label>
                            <textarea
                                name="sideEffects"
                                value={formData.sideEffects}
                                onChange={handleChange}
                                placeholder="e.g., Headache, dizziness"
                                rows="2"
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-btn">
                                {editingId ? 'Update Prescription' : 'Add Prescription'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => { setShowForm(false); setEditingId(null); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="prescriptions-list">
                {prescriptions.length === 0 ? (
                    <div className="empty-state">
                        <p>No prescriptions yet. Add one to get started!</p>
                    </div>
                ) : (
                    prescriptions.map(prescription => (
                        <div key={prescription.id} className="prescription-card">
                            <div className="prescription-header">
                                <h3>{prescription.medicationName || prescription.name}</h3>
                                <span className={`status-badge ${prescription.status}`}>
                                    {prescription.status || 'active'}
                                </span>
                            </div>

                            <div className="prescription-details">
                                <div className="detail-row">
                                    <span className="label">Dosage:</span>
                                    <span className="value">{prescription.dosage}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Frequency:</span>
                                    <span className="value">{prescription.frequency}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Instructions:</span>
                                    <span className="value">{prescription.instructions || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Prescribed By:</span>
                                    <span className="value">{prescription.prescribedBy || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Refills Remaining:</span>
                                    <span className={`value ${prescription.refillsRemaining === 0 ? 'warning' : ''}`}>
                                        {prescription.refillsRemaining}
                                    </span>
                                </div>
                                {prescription.sideEffects && (
                                    <div className="detail-row">
                                        <span className="label">Side Effects:</span>
                                        <span className="value">{prescription.sideEffects}</span>
                                    </div>
                                )}
                            </div>

                            <div className="prescription-actions">
                                <button className="edit-btn" onClick={() => handleEdit(prescription)}>
                                    Edit
                                </button>
                                <button className="delete-btn" onClick={() => handleDelete(prescription.id)}>
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

export default ManagePrescriptions;

