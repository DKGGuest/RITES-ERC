import React from 'react';
import { PERFORMANCE_METRICS } from '../data/mockData';

const PerformanceDashboard = ({ metrics = PERFORMANCE_METRICS }) => (
  <div>
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Total Inspections</div>
        <div className="stat-value">{metrics.total_inspections}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Completed %</div>
        <div className="stat-value">{metrics.completed_percentage}%</div>
        <div className="stat-change positive">+5% from last month</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Average Time (hrs)</div>
        <div className="stat-value">{metrics.average_time}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Pending Calls</div>
        <div className="stat-value">{metrics.pending_calls}</div>
      </div>
    </div>
  </div>
);

export default PerformanceDashboard;
