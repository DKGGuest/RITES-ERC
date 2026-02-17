import React, { useState, useEffect } from 'react';
import { USER_ROLES, REGIONS } from './utils/mockData';

export const UserForm = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        rritesEmployeeCode: '',
        name: '',
        shortName: '',
        dateOfBirth: '',
        role: '',
        rio: '',
        cm: '',
        email: '',
        mobileNo: '',
        discipline: '',
        status: 'Active'
    });

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

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
                    <label className="form-label">RITES Employee Code</label>
                    <input
                        type="text"
                        name="rritesEmployeeCode"
                        className="form-control"
                        value={formData.rritesEmployeeCode}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Short Name</label>
                    <input
                        type="text"
                        name="shortName"
                        className="form-control"
                        value={formData.shortName}
                        onChange={handleChange}
                        maxLength="5"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        className="form-control"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                        name="role"
                        className="form-control"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Role</option>
                        {USER_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Region (RIO)</label>
                    <select
                        name="rio"
                        className="form-control"
                        value={formData.rio}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Region</option>
                        {REGIONS.map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Controlling Manager (CM)</label>
                    <input
                        type="text"
                        name="cm"
                        className="form-control"
                        value={formData.cm}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Discipline</label>
                    <input
                        type="text"
                        name="discipline"
                        className="form-control"
                        value={formData.discipline}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Mobile No</label>
                    <input
                        type="tel"
                        name="mobileNo"
                        className="form-control"
                        value={formData.mobileNo}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Status</label>
                <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {user ? 'Update User' : 'Create User'}
                </button>
            </div>
        </form>
    );
};
