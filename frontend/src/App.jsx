import React, { useState, useEffect } from 'react';
import Recorder from './components/Recorder';
import RecordingList from './components/RecordingList';
import './App.css';

function App() {
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const fetchRecordings = async () => {
  try {
    const response = await fetch(`${API_URL}/api/recordings`);
    const data = await response.json();
    setRecordings(data);
  } catch (error) {
    console.error("Error fetching recordings:", error);
  }
};

const handleRecordingUploaded = () => {
  fetchRecordings();
};

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">Screen Recorder</h1>
      </div>
      
      <div className="app-container">
        <Recorder onRecordingUploaded={handleRecordingUploaded} />
        
        <div className="recordings-section">
          <h2 className="section-title">Recorded Sessions</h2>
          <RecordingList 
            recordings={recordings} 
            onSelectRecording={setSelectedRecording}
            selectedRecording={selectedRecording}
          />
        </div>
      </div>
    </div>
  );
}

export default App;