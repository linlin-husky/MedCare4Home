import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api.js';
import './BodyMeasurement.css';
import LoadingSpinner from './LoadingSpinner.jsx';
import DeleteButton from './DeleteButton.jsx';

// --- Helper for Charts ---
const TrendChart = ({ data, dataKey, dataKey2, color = '#3b82f6', color2 = '#14b8a6', height = 100 }) => {
    if (!data || data.length < 2) return <div className="no-chart">Not enough data for trend</div>;

    // Filter valid numerical data
    const validData = data.filter(d => !isNaN(d[dataKey]));
    if (validData.length === 0) return null;

    const values = validData.map(d => d[dataKey]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // SVG padding
    const padding = 5;
    const chartHeight = height - padding * 2;
    const width = 100; // ViewBox width percentage

    const getX = index => (index / (validData.length - 1)) * 100;
    const getY = val => height - padding - ((val - min) / range) * chartHeight;

    let points = validData.map((d, i) => `${getX(i)},${getY(d[dataKey])}`).join(' ');

    let points2 = null;
    if (dataKey2) {
        const values2 = validData.map(d => d[dataKey2]);
        const min2 = Math.min(...values2, min); // Share scale? usually better to share scale for BP
        const max2 = Math.max(...values2, max);
        const range2 = max2 - min2 || 1;

        // Recalculate if sharing scale
        // For BP, we want same scale for sys/dia to show gap
        const globalMin = Math.min(min, Math.min(...values2));
        const globalMax = Math.max(max, Math.max(...values2));
        const globalRange = globalMax - globalMin || 1;

        const getYGlobal = val => height - padding - ((val - globalMin) / globalRange) * chartHeight;

        // Re-map points 1
        points = validData.map((d, i) => `${getX(i)},${getYGlobal(d[dataKey])}`).join(' ');
        points2 = validData.map((d, i) => `${getX(i)},${getYGlobal(d[dataKey2])}`).join(' ');
    }

    return (
        <div className="mini-chart-container" style={{ height: height + 'px' }}>
            <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="chart-svg">
                {/* Gradient for area under curve (optional) */}

                {/* Line 1 */}
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />

                {/* Line 2 (if present) */}
                {points2 && (
                    <polyline points={points2} fill="none" stroke={color2} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                )}

                {/* Dots */}
                {validData.map((d, i) => (
                    <circle
                        key={i}
                        cx={getX(i)}
                        cy={dataKey2
                            ? (height - padding - ((d[dataKey] - Math.min(min, Math.min(...validData.map(v => v[dataKey2])))) / (Math.max(max, Math.max(...validData.map(v => v[dataKey2]))) - Math.min(min, Math.min(...validData.map(v => v[dataKey2]))))) * chartHeight)
                            : getY(d[dataKey])
                        }
                        r="3"
                        fill="white"
                        stroke={color}
                        strokeWidth="1.5"
                    >
                        <title>{new Date(d.date).toLocaleDateString()}: {d[dataKey]}</title>
                    </circle>
                ))}
            </svg>
        </div>
    );
};


function BodyMeasurement({ user }) {
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formType, setFormType] = useState('bloodPressure');
    const [formData, setFormData] = useState({
        value: '', // for weight/height
        systolic: '',
        diastolic: '',
        pulse: '',
        unit: 'lbs', // Default for weight
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        fetchVitals();
    }, []);

    const fetchVitals = () => {
        setLoading(true);
        api.getVitals().then(data => {
            setVitals(data.vitals || data || []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    // Calculate Latest & History for Charts
    const history = useMemo(() => {
        const sorted = [...vitals].sort((a, b) => new Date(a.date) - new Date(b.date)); // Oldest to newest

        const weightData = sorted.filter(v => v.type === 'weight');
        const heightData = sorted.filter(v => v.type === 'height');
        const bpData = sorted.filter(v => v.type === 'bloodPressure');

        // Calculate BMI History
        // We need height for each weight record. We'll find the height record closest to (but usually before) the weight record date.
        // For simplicity, we'll use the latest height on or before the weight date.
        const bmiData = weightData.map(w => {
            // Find latest height before or same day as weight
            const hRecord = heightData
                .filter(h => new Date(h.date) <= new Date(w.date))
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            if (!hRecord) return null;

            // Calc BMI: weight (kg) / height (m)^2
            // Conversions
            let weightKg = w.unit === 'lb' ? w.value * 0.453592 : w.value;
            let heightM = hRecord.unit === 'cm' ? hRecord.value / 100 : (hRecord.unit === 'ft' ? hRecord.value * 0.3048 : hRecord.value); // Assume cm if not ft?? actually seed is cm.

            if (!heightM || !weightKg) return null;

            const bmi = weightKg / (heightM * heightM);
            return {
                date: w.date,
                value: parseFloat(bmi.toFixed(1)),
                unit: 'BMI'
            };
        }).filter(Boolean);

        return {
            weight: weightData,
            height: heightData,
            bloodPressure: bpData,
            bmi: bmiData
        };
    }, [vitals]);

    const latest = {
        weight: history.weight[history.weight.length - 1],
        height: history.height[history.height.length - 1],
        bp: history.bloodPressure[history.bloodPressure.length - 1],
        bmi: history.bmi[history.bmi.length - 1]
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setFormType(newType);
        // Reset specific fields and set default unit
        let defaultUnit = '';
        if (newType === 'weight') defaultUnit = 'lb';
        if (newType === 'height') defaultUnit = 'cm';
        if (newType === 'bloodPressure') defaultUnit = 'mmHg';

        setFormData(prev => ({
            ...prev,
            unit: defaultUnit,
            value: '',
            systolic: '',
            diastolic: '',
            pulse: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            type: formType,
            date: new Date(formData.date),
            notes: formData.notes,
            unit: formData.unit
        };

        if (formType === 'bloodPressure') {
            payload.systolic = parseFloat(formData.systolic);
            payload.diastolic = parseFloat(formData.diastolic);
            payload.pulse = formData.pulse ? parseFloat(formData.pulse) : undefined;
            payload.value = payload.systolic; // Store systolic as main value for fallback
        } else {
            payload.value = parseFloat(formData.value);
        }

        try {
            await api.addVital(payload);
            setShowForm(false);
            setFormData({ ...formData, notes: '', value: '', systolic: '', diastolic: '', pulse: '' });
            fetchVitals();
        } catch (err) {

        }
    };

    const handleDelete = async (id) => {
        await api.deleteVital(id);
        fetchVitals();
    };

    return (
        <div className="body-measurement">
            <div className="vitals-header">
                <h1>Body Measurement & Vitals</h1>
                <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                    <span style={{ fontSize: '1.25rem' }}>+</span> Add Record
                </button>
            </div>

            {/* --- Summary Cards --- */}
            <div className="measurements-grid">
                {/* Blood Pressure Card */}
                <div className="measurement-card">
                    <div className="card-header">
                        <span className="card-title">Blood Pressure</span>
                        <div className="card-icon">❤️</div>
                    </div>
                    {latest.bp ? (
                        <>
                            <div className="latest-value">
                                {latest.bp.systolic}/{latest.bp.diastolic}
                                <span className="latest-unit">mmHg</span>
                            </div>
                            <div className="latest-date">{new Date(latest.bp.date).toLocaleDateString()}</div>
                            {latest.bp.pulse && <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Pulse: <strong>{latest.bp.pulse}</strong> bpm</div>}
                            <TrendChart data={history.bloodPressure} dataKey="systolic" dataKey2="diastolic" />
                        </>
                    ) : (
                        <div className="no-data">No data</div>
                    )}
                </div>

                {/* Weight Card */}
                <div className="measurement-card">
                    <div className="card-header">
                        <span className="card-title">Weight</span>
                        <div className="card-icon">⚖️</div>
                    </div>
                    {latest.weight ? (
                        <>
                            <div className="latest-value">
                                {latest.weight.value}
                                <span className="latest-unit">{latest.weight.unit}</span>
                            </div>
                            <div className="latest-date">{new Date(latest.weight.date).toLocaleDateString()}</div>
                            <TrendChart data={history.weight} dataKey="value" color="#8b5cf6" />
                        </>
                    ) : (
                        <div className="no-data">No data</div>
                    )}
                </div>

                {/* BMI Card */}
                <div className="measurement-card">
                    <div className="card-header">
                        <span className="card-title">BMI</span>
                        <div className="card-icon">📊</div>
                    </div>
                    {latest.bmi ? (
                        <>
                            <div className="latest-value">
                                {latest.bmi.value}
                                <span className="latest-unit">BMI</span>
                            </div>
                            <div className="latest-date">{new Date(latest.bmi.date).toLocaleDateString()}</div>
                            <div className="bmi-status" style={{ fontSize: '0.875rem', fontWeight: '600', color: latest.bmi.value < 18.5 ? 'orange' : latest.bmi.value < 25 ? 'green' : 'red', marginBottom: '10px' }}>
                                {latest.bmi.value < 18.5 ? 'Underweight' : latest.bmi.value < 25 ? 'Normal' : 'Overweight'}
                            </div>
                            <TrendChart data={history.bmi} dataKey="value" color="#ec4899" />
                        </>
                    ) : (
                        <div className="no-data">Add Height & Weight</div>
                    )}
                </div>
            </div>

            {/* --- Quick Add Form --- */}
            {showForm && (
                <div className="vital-form-container">
                    <form className="vital-form" onSubmit={handleSubmit}>
                        <h2>Record New Measurement</h2>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Type</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal' }}>
                                    <input type="radio" name="type" value="bloodPressure" checked={formType === 'bloodPressure'} onChange={handleTypeChange} /> Blood Pressure
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal' }}>
                                    <input type="radio" name="type" value="weight" checked={formType === 'weight'} onChange={handleTypeChange} /> Weight
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal' }}>
                                    <input type="radio" name="type" value="height" checked={formType === 'height'} onChange={handleTypeChange} /> Height
                                </label>
                            </div>
                        </div>

                        <div className="form-grid">
                            {formType === 'bloodPressure' ? (
                                <>
                                    <div className="form-group">
                                        <label>Systolic (mmHg)</label>
                                        <input type="number" name="systolic" value={formData.systolic} onChange={handleFormChange} placeholder="120" required className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Diastolic (mmHg)</label>
                                        <input type="number" name="diastolic" value={formData.diastolic} onChange={handleFormChange} placeholder="80" required className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Pulse (bpm) - Optional</label>
                                        <input type="number" name="pulse" value={formData.pulse} onChange={handleFormChange} placeholder="72" className="form-input" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Value</label>
                                        <input type="number" name="value" step="0.1" value={formData.value} onChange={handleFormChange} placeholder="0.0" required className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Unit</label>
                                        <select name="unit" value={formData.unit} onChange={handleFormChange} className="form-input">
                                            {formType === 'weight' ? (
                                                <>
                                                    <option value="lb">lb</option>
                                                    <option value="kg">kg</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="cm">cm</option>
                                                    <option value="ft">ft</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleFormChange} required className="form-input" />
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="submit-btn" style={{ width: 'auto' }}>Save Record</button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- History List --- */}
            <div className="vitals-history">
                <h2>History Log</h2>
                {vitals.length === 0 ? <p>No history yet.</p> : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...vitals].sort((a, b) => new Date(b.date) - new Date(a.date)).map(v => (
                                <tr key={v.id}>
                                    <td>{new Date(v.date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`type-badge ${v.type.toLowerCase()}`}>
                                            {v.type === 'bloodPressure' ? 'BP' : v.type}
                                        </span>
                                    </td>
                                    <td>
                                        {v.type === 'bloodPressure'
                                            ? `${v.systolic}/${v.diastolic} ${v.unit} ${v.pulse ? `(Pulse: ${v.pulse})` : ''}`
                                            : `${v.value} ${v.unit}`
                                        }
                                    </td>
                                    <td>{v.notes}</td>
                                    <td>
                                        <DeleteButton
                                            onDelete={() => handleDelete(v.id)}
                                            className="delete-action"
                                            style={{ padding: '0.25rem 0.5rem' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default BodyMeasurement;