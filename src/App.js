// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import './Grid.css';

const activitiesList = ['Sleep', 'Another', 'Gym', 'Swim', 'Walk', 'Piano', 'Guitar'];
const pastelColors = generatePastelColors(activitiesList.length);

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

// Function to save activities to local storage
function saveActivitiesToStorage(activities) {
  localStorage.setItem('savedActivities', JSON.stringify(activities));
}

// Function to load activities from local storage
function loadActivitiesFromStorage() {
  const savedActivities = localStorage.getItem('savedActivities');
  return savedActivities ? JSON.parse(savedActivities) : null;
}

// Define the TimeStatusComponent directly within App.js
const TimeStatusComponent = ({ totalCombinedTime }) => {
  const remainingTime = 24 - totalCombinedTime.toFixed(2);

  let statusMessage;

  if (remainingTime !== 0) {
    if (remainingTime > 4) {
      statusMessage = "You have a lot of time to do stuff!";
    } else {
      statusMessage = "You've almost used all your time!";
    }
  } else {
    statusMessage = "Well done! No time wasted!";
  }

  return (
    <span>
      {statusMessage}
    </span>
  );
};

const App = () => {
  const handleDeleteData = () => {
    localStorage.removeItem('savedActivities');
    setActivities(activitiesList.reduce((acc, activity) => ({ ...acc, [activity]: 0 }), {}));
  };

  const [activities, setActivities] = useState(
    loadActivitiesFromStorage() ||
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

  useEffect(() => {
    // Save activities to local storage on every change
    saveActivitiesToStorage(activities);

    // Add/remove classes on the body based on the smallest unit and totalCombinedTime
    document.body.classList.remove('suotr-15', 'suotr-30', 'suotr-60', 'full-day');
    document.body.classList.add(`suotr-${smallestUnit}`);

    if (totalCombinedTime === 24) {
      document.body.classList.add('full-day');
    } else {
      document.body.classList.remove('full-day');
    }
  }, [activities, smallestUnit, totalCombinedTime]);

  const cellsInADay = 24 * 60 / smallestUnit;

  return (
    <div>
      <div className="header">
        <div className="app-title">
          Where does the time go?
        </div>
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
                disabled={totalCombinedTime === 24}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="summary">
        {24 - totalCombinedTime.toFixed(2) !== 0 && (
          <span>
            Still {24 - totalCombinedTime.toFixed(2)} hour{24 - totalCombinedTime <= 1 ? '' : 's'} free.{' '}
          </span>
        )}
        <TimeStatusComponent totalCombinedTime={totalCombinedTime} />
      </div>

      <div className='delete-data'>Something's not working?<button onClick={handleDeleteData}>Delete Data</button></div>
    </div>
  );
};

export default App;
