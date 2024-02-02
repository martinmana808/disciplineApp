import React, { useState } from 'react';
import './App.css';
import './Grid.css';

const activitiesList = ['Sleep', 'Sports', 'Music'];
const pastelColors = generatePastelColors(activitiesList.length);

const App = () => {
  const [activities, setActivities] = useState(
    activitiesList.reduce((acc, activity, index) => {
      acc[activity] = 0;
      return acc;
    }, {})
  );

  const [smallestUnit, setSmallestUnit] = useState(60); // Default smallest unit is 60 minutes

  const handleTimeChange = (activity, time) => {
    setActivities((prevActivities) => ({
      ...prevActivities,
      [activity]: time,
    }));
  };

  const totalCombinedTime = Object.values(activities).reduce((total, time) => total + time, 0);

  const handleUnitChange = (unit) => {
    setSmallestUnit(unit);
  };

  const saveActivities = () => {
    const dataToSave = {
      activities,
      smallestUnit,
    };

    const blob = new Blob([JSON.stringify(dataToSave)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved_activities.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadActivities = (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        setActivities(data.activities);
        setSmallestUnit(data.smallestUnit);
      };
      reader.readAsText(file);
    }
  };

  const cellsInADay = 24 * 60 / smallestUnit;

  return (
    <div>
      <div className="unit-selection">
        <label>
          <input
            type="radio"
            value={15}
            checked={smallestUnit === 15}
            onChange={() => handleUnitChange(15)}
          />
          15m
        </label>
        <label>
          <input
            type="radio"
            value={30}
            checked={smallestUnit === 30}
            onChange={() => handleUnitChange(30)}
          />
          30m
        </label>
        <label>
          <input
            type="radio"
            value={60}
            checked={smallestUnit === 60}
            onChange={() => handleUnitChange(60)}
          />
          60m
        </label>
      </div>

      <div className="summary">
        <p>Total Allocated Time: {totalCombinedTime}</p>
      </div>

      <div className="grid-container">
        <div className="grid">
          {Array.from({ length: cellsInADay }, (_, cellIndex) => {
            const cellColor = determineCellColor(cellIndex + 1, smallestUnit, activities);
            return (
              <div
                key={cellIndex}
                style={{ backgroundColor: cellColor }}
                className="grid-cell"
              >
                {cellIndex + 1}
              </div>
            );
          })}
        </div>
      </div>

      <div className="activities">
        {activitiesList.map((activity, index) => (
          <div key={activity} className="activity">
            <div className="activity-header" style={{ backgroundColor: pastelColors[index] }}></div>
            <p>{activity}</p>
            <div className="time-control">
              <button
                onClick={() =>
                  handleTimeChange(activity, Math.max(0, activities[activity] - (smallestUnit / 60)))
                }
              >
                -
              </button>
              <span>{Math.floor(activities[activity] * (60 / smallestUnit))}</span>
              <button
                onClick={() =>
                  handleTimeChange(
                    activity,
                    Math.min(cellsInADay, activities[activity] + (smallestUnit / 60))
                  )
                }
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="save-load-buttons">
        <button onClick={saveActivities}>SAVE</button>
        <input type="file" onChange={loadActivities} />
      </div>
    </div>
  );
};

// Function to determine the color of a cell based on allocated time
const determineCellColor = (cellIndex, smallestUnit, activities) => {
  const timeInHours = cellIndex * (smallestUnit / 60);
  let cumulativeTime = 0;

  for (const activity of activitiesList) {
    if (cumulativeTime + activities[activity] >= timeInHours) {
      return pastelColors[activitiesList.indexOf(activity)];
    }

    cumulativeTime += activities[activity];
  }

  return '';
};

// Function to generate pastel colors
function generatePastelColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.floor(Math.random() * 360);
    const lightness = Math.floor(Math.random() * 30) + 70; // lightness between 70% and 100%
    colors.push(`hsl(${hue}, 100%, ${lightness}%)`);
  }
  return colors;
}

export default App;
