import React, { useState } from 'react';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { MasterList } from './MasterList';
import { MasterForm } from './MasterForm';
import { CalibrationList } from './CalibrationList';
import { CalibrationForm } from './CalibrationForm';
import { IEMapping } from './IEMapping';
import { IEFieldsForm } from './IEFieldsForm';
import { Modal } from './Modal';
import './admin.css';

export const AdminDashboard = () => {
    const [activeModule, setActiveModule] = useState('users');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    // User Module Handlers
    const handleCreateUser = () => {
        setSelectedItem(null);
        setModalTitle('Create New User');
        setModalContent('user-form');
        setModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedItem(user);
        setModalTitle('Edit User');
        setModalContent('user-form');
        setModalOpen(true);
    };

    const handleChangeRole = (user) => {
        setSelectedItem(user);
        setModalTitle('Change User Role');
        setModalContent('change-role');
        setModalOpen(true);
    };

    const handleChangeRegion = (user) => {
        setSelectedItem(user);
        setModalTitle('Change User Region');
        setModalContent('change-region');
        setModalOpen(true);
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            alert('User deleted successfully');
        }
    };

    const handleSubmitUser = (formData) => {
        alert(selectedItem ? 'User updated successfully' : 'User created successfully');
        setModalOpen(false);
    };

    // Master Module Handlers
    const handleCreateMaster = () => {
        setSelectedItem(null);
        setModalTitle('Create New Master');
        setModalContent('master-form');
        setModalOpen(true);
    };

    const handleEditMaster = (master) => {
        setSelectedItem(master);
        setModalTitle('Edit Master');
        setModalContent('master-form');
        setModalOpen(true);
    };

    const handleDeleteMaster = (masterId) => {
        if (window.confirm('Are you sure you want to delete this master?')) {
            alert('Master deleted successfully');
        }
    };

    const handleApproveMaster = (masterId) => {
        alert('Master approved successfully');
    };

    const handleSubmitMaster = (formData) => {
        alert(selectedItem ? 'Master updated successfully' : 'Master created successfully');
        setModalOpen(false);
    };

    const handleSubmitCalibration = (formData) => {
        alert(selectedItem ? 'Calibration updated successfully' : 'Calibration created successfully');
        setModalOpen(false);
    };

    const handleSubmitMapping = (formData) => {
        alert(selectedItem ? 'Mapping updated successfully' : 'Mapping created successfully');
        setModalOpen(false);
    };

    // Calibration Handlers
    const handleCreateCalibration = () => {
        setSelectedItem(null);
        setModalTitle('Add Calibration Record');
        setModalContent('calibration-form');
        setModalOpen(true);
    };

    const handleEditCalibration = (cal) => {
        setSelectedItem(cal);
        setModalTitle('Edit Calibration Record');
        setModalContent('calibration-form');
        setModalOpen(true);
    };

    const handleDeleteCalibration = (calId) => {
        if (window.confirm('Are you sure you want to delete this calibration record?')) {
            alert('Calibration record deleted successfully');
        }
    };

    const handleUploadCertificate = (cal) => {
        alert('Certificate upload feature - to be implemented');
    };

    // IE Mapping Handlers
    const handleCreateMapping = () => {
        setSelectedItem(null);
        setModalTitle('Create IE Mapping');
        setModalContent('mapping-form');
        setModalOpen(true);
    };

    const handleEditMapping = (mapping) => {
        setSelectedItem(mapping);
        setModalTitle('Edit IE Mapping');
        setModalContent('mapping-form');
        setModalOpen(true);
    };

    const handleDeleteMapping = (mappingId) => {
        if (window.confirm('Are you sure you want to delete this mapping?')) {
            alert('Mapping deleted successfully');
        }
    };

    const getModuleTitle = () => {
        switch (activeModule) {
            case 'users': return 'User Management';
            case 'masters': return 'Master Data';
            case 'calibration': return 'Calibration';
            case 'mapping': return 'IE Mapping';
            default: return 'Admin Module';
        }
    };

    const getModuleDescription = () => {
        switch (activeModule) {
            case 'users': return 'Manage system users and their roles';
            case 'masters': return 'Manage master data including vendors, items, and plants';
            case 'calibration': return 'Manage calibration records and certificates';
            case 'mapping': return 'Manage IE to CM and IE to POI mappings';
            default: return '';
        }
    };

    const getCurrentDateTime = () => {
        const now = new Date();
        return now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="admin-container">
            {/* Sidebar Navigation */}
            <aside className="admin-sidebar">
                <div style={{ padding: '0 16px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#17a2b8', letterSpacing: '1px' }}>
                        SARTHI
                    </h3>
                    <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Admin Module</p>
                </div>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <a
                            className={`nav-link ${activeModule === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveModule('users')}
                        >
                            <span>👥</span>
                            <span>User Management</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className={`nav-link ${activeModule === 'masters' ? 'active' : ''}`}
                            onClick={() => setActiveModule('masters')}
                        >
                            <span>📋</span>
                            <span>Master Data</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className={`nav-link ${activeModule === 'calibration' ? 'active' : ''}`}
                            onClick={() => setActiveModule('calibration')}
                        >
                            <span>🔧</span>
                            <span>Calibration</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            className={`nav-link ${activeModule === 'mapping' ? 'active' : ''}`}
                            onClick={() => setActiveModule('mapping')}
                        >
                            <span>🗺️</span>
                            <span>IE Mapping</span>
                        </a>
                    </li>
                </ul>
            </aside>

            {/* Main Content */}
            <div className="admin-main">


                <div className="admin-content">
                    {activeModule === 'users' && (
                        <UserList
                            onEdit={handleEditUser}
                            onDelete={handleDeleteUser}
                            onChangeRole={handleChangeRole}
                            onChangeRegion={handleChangeRegion}
                            onCreateNew={handleCreateUser}
                        />
                    )}

                    {activeModule === 'masters' && (
                        <MasterList
                            onEdit={handleEditMaster}
                            onDelete={handleDeleteMaster}
                            onCreateNew={handleCreateMaster}
                            onApprove={handleApproveMaster}
                        />
                    )}

                    {activeModule === 'calibration' && (
                        <CalibrationList
                            onEdit={handleEditCalibration}
                            onDelete={handleDeleteCalibration}
                            onCreateNew={handleCreateCalibration}
                            onUploadCertificate={handleUploadCertificate}
                        />
                    )}

                    {activeModule === 'mapping' && (
                        <IEMapping
                            onEdit={handleEditMapping}
                            onDelete={handleDeleteMapping}
                            onCreateNew={handleCreateMapping}
                        />
                    )}
                </div>
            </div>

            {/* Modal for Forms */}
            <Modal
                isOpen={modalOpen}
                title={modalTitle}
                onClose={() => setModalOpen(false)}
            >
                {modalContent === 'user-form' && (
                    <UserForm
                        user={selectedItem}
                        onSubmit={handleSubmitUser}
                        onCancel={() => setModalOpen(false)}
                    />
                )}
                {modalContent === 'master-form' && (
                    <MasterForm
                        master={selectedItem}
                        onSubmit={handleSubmitMaster}
                        onCancel={() => setModalOpen(false)}
                    />
                )}
                {modalContent === 'change-role' && (
                    <div>
                        <p>Change role for: <strong>{selectedItem?.name}</strong></p>
                        <div className="form-group">
                            <label className="form-label">New Role</label>
                            <select className="form-control">
                                <option>Select New Role</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={() => {
                                alert('Role changed successfully');
                                setModalOpen(false);
                            }}>
                                Update Role
                            </button>
                        </div>
                    </div>
                )}
                {modalContent === 'change-region' && (
                    <div>
                        <p>Change region for: <strong>{selectedItem?.name}</strong></p>
                        <div className="form-group">
                            <label className="form-label">New Region</label>
                            <select className="form-control">
                                <option>Select New Region</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={() => {
                                alert('Region changed successfully');
                                setModalOpen(false);
                            }}>
                                Update Region
                            </button>
                        </div>
                    </div>
                )}
                {modalContent === 'calibration-form' && (
                    <CalibrationForm
                        calibration={selectedItem}
                        onSubmit={handleSubmitCalibration}
                        onCancel={() => setModalOpen(false)}
                    />
                )}
                {modalContent === 'mapping-form' && (
                    <IEFieldsForm
                        onSubmit={handleSubmitMapping}
                        onCancel={() => setModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
};
