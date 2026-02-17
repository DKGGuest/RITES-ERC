import React, { useState, useEffect } from 'react';

export const CalibrationForm = ({ calibration, onSubmit, onCancel }) => {
    const statuses = ['Valid', 'Expired', 'Pending'];

    const [formData, setFormData] = useState({
        productName: '',
        instrumentCode: '',
        lastCalibrationDate: '',
        nextCalibrationDate: '',
        calibrationCertificate: '',
        status: 'Valid',
        vendor: ''
    });

    useEffect(() => {
        if (calibration) {
            setFormData(calibration);
        }
    }, [calibration]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                        type="text"
                        name="productName"
                        className="form-control"
                        value={formData.productName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Instrument Code</label>
                    <input
                        type="text"
                        name="instrumentCode"
                        className="form-control"
                        value={formData.instrumentCode}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <input
                        type="text"
                        name="vendor"
                        className="form-control"
                        value={formData.vendor}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                        name="status"
                        className="form-control"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Last Calibration Date</label>
                    <input
                        type="date"
                        name="lastCalibrationDate"
                        className="form-control"
                        value={formData.lastCalibrationDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Next Calibration Date</label>
                    <input
                        type="date"
                        name="nextCalibrationDate"
                        className="form-control"
                        value={formData.nextCalibrationDate}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Calibration Certificate No.</label>
                <input
                    type="text"
                    name="calibrationCertificate"
                    className="form-control"
                    value={formData.calibrationCertificate}
                    onChange={handleChange}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {calibration ? 'Update Record' : 'Add Record'}
                </button>
            </div>
        </form>
    );
};
