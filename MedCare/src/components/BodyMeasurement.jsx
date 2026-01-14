import React, { useState } from 'react';
import './BodyMeasurement.css';

function BodyMeasurement({ user }) {
    const [measurements, setMeasurements] = useState([
        { type: 'Weight', value: 110, unit: 'lb' },
        { type: 'Height', value: '5\'4"', unit: '' },
        { type: 'BMI', value: 20, unit: '' }
    ]);

    return (
        <div className="body-measurement">
            <h1>Body Measurement</h1>
            <div className="measurements-grid">
                {measurements.map((m, i) => (
                    <div key={i} className="measurement-card">
                        <h3>{m.type}</h3>
                        <p className="value">{m.value} {m.unit}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BodyMeasurement;