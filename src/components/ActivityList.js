// src/components/ActivityList.js
import React from 'react';
import './ActivityList.css';

const ActivityList = ({ allocatedTime, onTimeChange }) => {
  return (
    <div className="activity-list-container">
      <h2>Activity List</h2>
      <ul>
        {Object.keys(allocatedTime).map((activity) => (
          <li key={activity}>
            <label>
              {activity}:
              <input
                type="number"
                value={allocatedTime[activity]}
                onChange={(e) => onTimeChange(activity, parseInt(e.target.value, 10))}
                min="0"
              />
              units
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;
