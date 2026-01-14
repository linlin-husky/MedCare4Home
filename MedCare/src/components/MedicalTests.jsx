import { useState, useEffect } from 'react';
import './MedicalTests.css';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';

const TEST_CATEGORIES = [
    'Blood Work',
    'Imaging',
    'Cardiac',
    'Respiratory',
    'Neurological',
    'Dermatological',
    'Other'
];

const TEST_STATUSES = [
    'scheduled',
    'completed',
    'pending'
];

export default function MedicalTests() {
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [statusFilter, setStatusFilter] = useState('All Items');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        testName: '',
        category: '',
        status: 'pending',
        testDate: '',
        resultDate: '',
        result: '',
        notes: '',
        doctor: '',
        facility: ''
    });

    // Fetch all tests
    useEffect(() => {
        fetchTests();
    }, []);

    // Apply filters when tests or filters change
    useEffect(() => {
        applyFilters();
    }, [tests, statusFilter, categoryFilter, searchQuery]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/medical-tests', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tests');
            }

            const data = await response.json();
            // Handle both { tests: [] } and [] response formats
            const testsArray = data.tests || data || [];
            setTests(Array.isArray(testsArray) ? testsArray : []);
            setError('');
        } catch (err) {
            setError('Failed to load medical tests');
            console.error(err);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...tests];

        // Apply status filter
        if (statusFilter !== 'All Items') {
            filtered = filtered.filter(test => test.status === statusFilter);
        }

        // Apply category filter
        if (categoryFilter !== 'All Categories') {
            filtered = filtered.filter(test => test.category === categoryFilter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(test =>
                test.testName.toLowerCase().includes(query) ||
                test.category.toLowerCase().includes(query) ||
                test.doctor?.toLowerCase().includes(query) ||
                test.result?.toLowerCase().includes(query)
            );
        }

        setFilteredTests(filtered);
    };

    const handleAddTest = async (e) => {
        e.preventDefault();

        if (!formData.testName || !formData.category) {
            setError('Test name and category are required');
            return;
        }

        try {
            const response = await fetch('/api/medical-tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to add test');
            }

            const newTest = await response.json();
            setTests([...tests, newTest]);
            setFormData({
                testName: '',
                category: '',
                status: 'pending',
                testDate: '',
                resultDate: '',
                result: '',
                notes: '',
                doctor: '',
                facility: ''
            });
            setShowForm(false);
            setSuccess('Medical test added successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to add test');
            console.error(err);
        }
    };

    const handleDeleteTest = async (id) => {
        if (!confirm('Are you sure you want to delete this test?')) return;

        try {
            const response = await fetch(`/api/medical-tests/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete test');
            }

            setTests(tests.filter(test => test.id !== id));
            setSuccess('Medical test deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete test');
            console.error(err);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'scheduled':
                return <span className="badge badge-scheduled">Scheduled</span>;
            case 'completed':
                return <span className="badge badge-completed">Completed</span>;
            case 'pending':
                return <span className="badge badge-pending">Pending</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="medical-tests-container">
            <div className="medical-tests-header">
                <h1>Medical Tests</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Test'}
                </button>
            </div>

            {error && <ErrorMessage message={error} onClose={() => setError('')} />}
            {success && <SuccessMessage message={success} />}

            {showForm && (
                <form className="test-form" onSubmit={handleAddTest}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Test Name *</label>
                            <input
                                type="text"
                                value={formData.testName}
                                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                                placeholder="e.g., Complete Blood Count"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Select a category</option>
                                {TEST_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                {TEST_STATUSES.map(status => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Test Date</label>
                            <input
                                type="date"
                                value={formData.testDate}
                                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Result Date</label>
                            <input
                                type="date"
                                value={formData.resultDate}
                                onChange={(e) => setFormData({ ...formData, resultDate: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Result</label>
                            <input
                                type="text"
                                value={formData.result}
                                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                placeholder="e.g., Normal, Abnormal"
                            />
                        </div>

                        <div className="form-group">
                            <label>Doctor</label>
                            <input
                                type="text"
                                value={formData.doctor}
                                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                                placeholder="Doctor name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Facility</label>
                            <input
                                type="text"
                                value={formData.facility}
                                onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                                placeholder="Hospital/Lab name"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional notes..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary">Add Medical Test</button>
                </form>
            )}

            <div className="filters-container">
                <div className="filter-group">
                    <label htmlFor="status-select">Status:</label>
                    <select
                        id="status-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Items</option>
                        {TEST_STATUSES.map(status => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="category-select">Category:</label>
                    <select
                        id="category-select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option>All Categories</option>
                        {TEST_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="search-group">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="tests-list">
                {filteredTests.length === 0 ? (
                    <p className="no-tests">No medical tests found</p>
                ) : (
                    filteredTests.map(test => (
                        <div key={test.id} className="test-card">
                            <div className="test-header">
                                <h3>{test.testName}</h3>
                                <button
                                    className="btn btn-danger btn-small"
                                    onClick={() => handleDeleteTest(test.id)}
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="test-details">
                                <div className="detail-row">
                                    <span className="label">Category:</span>
                                    <span className="value">{test.category}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Status:</span>
                                    <span className="value">{getStatusBadge(test.status)}</span>
                                </div>
                                {test.testDate && (
                                    <div className="detail-row">
                                        <span className="label">Test Date:</span>
                                        <span className="value">{formatDate(test.testDate)}</span>
                                    </div>
                                )}
                                {test.resultDate && (
                                    <div className="detail-row">
                                        <span className="label">Result Date:</span>
                                        <span className="value">{formatDate(test.resultDate)}</span>
                                    </div>
                                )}
                                {test.result && (
                                    <div className="detail-row">
                                        <span className="label">Result:</span>
                                        <span className="value">{test.result}</span>
                                    </div>
                                )}
                                {test.doctor && (
                                    <div className="detail-row">
                                        <span className="label">Doctor:</span>
                                        <span className="value">{test.doctor}</span>
                                    </div>
                                )}
                                {test.facility && (
                                    <div className="detail-row">
                                        <span className="label">Facility:</span>
                                        <span className="value">{test.facility}</span>
                                    </div>
                                )}
                                {test.notes && (
                                    <div className="detail-row">
                                        <span className="label">Notes:</span>
                                        <span className="value">{test.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
