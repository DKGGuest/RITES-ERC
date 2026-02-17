import React, { useState, useMemo } from 'react';
import { mockUsers, USER_ROLES, REGIONS } from './utils/mockData';
import { filterBySearch, paginate } from './utils/helpers';
import { DEFAULT_PAGE_SIZE } from './utils/constants';

export const UserList = ({ onEdit, onDelete, onChangeRole, onChangeRegion, onCreateNew }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterRegion, setFilterRegion] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(DEFAULT_PAGE_SIZE);

    const filteredUsers = useMemo(() => {
        let result = mockUsers;

        // Search filter
        if (searchTerm) {
            result = filterBySearch(result, searchTerm, ['name', 'rritesEmployeeCode', 'email']);
        }

        // Role filter
        if (filterRole) {
            result = result.filter(user => user.role === filterRole);
        }

        // Region filter
        if (filterRegion) {
            result = result.filter(user => user.rio === filterRegion);
        }

        return result;
    }, [searchTerm, filterRole, filterRegion]);

    const paginatedUsers = useMemo(() => {
        return paginate(filteredUsers, currentPage, pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredUsers.length / pageSize);

    const activeUsers = mockUsers.filter(u => u.status === 'Active').length;
    const inactiveUsers = mockUsers.filter(u => u.status === 'Inactive').length;
    const totalUsers = mockUsers.length;

    return (
        <div>
            {/* Metric Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div className="metric-card">
                    <div className="metric-label">Total Users</div>
                    <div className="metric-value">{totalUsers}</div>
                    <div className="metric-status">All users in system</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Active Users</div>
                    <div className="metric-value">{activeUsers}</div>
                    <div className="metric-status">Currently active</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Inactive Users</div>
                    <div className="metric-value">{inactiveUsers}</div>
                    <div className="metric-status">Deactivated</div>
                </div>
                <div className="metric-card highlight">
                    <div className="metric-label">User Roles</div>
                    <div className="metric-value">{USER_ROLES.length}</div>
                    <div className="metric-status">Available roles</div>
                </div>
            </div>

            {/* Main Card */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h2 className="card-title">User List</h2>
                        <p className="card-subtitle">Manage system users and their roles</p>
                    </div>
                    <button className="btn btn-primary" onClick={onCreateNew}>
                        + Create New User
                    </button>
                </div>

                <div className="search-filter-bar">
                    <div className="search-input">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="filter-select">
                        <select
                            value={filterRole}
                            onChange={(e) => {
                                setFilterRole(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Roles</option>
                            {USER_ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-select">
                        <select
                            value={filterRegion}
                            onChange={(e) => {
                                setFilterRegion(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Regions</option>
                            {REGIONS.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee Code</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Region</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.rritesEmployeeCode}</td>
                                    <td>{user.name}</td>
                                    <td>{user.role}</td>
                                    <td>{user.rio}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge badge-${user.status === 'Active' ? 'success' : 'danger'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-primary" onClick={() => onEdit(user)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-warning" onClick={() => onChangeRole(user)}>
                                            Change Role
                                        </button>
                                        <button className="btn btn-sm btn-warning" onClick={() => onChangeRegion(user)}>
                                            Change Region
                                        </button>
                                        <button className="btn btn-sm btn-danger" onClick={() => onDelete(user.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <div className="pagination-info">
                        Showing {paginatedUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="btn btn-sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn btn-sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
