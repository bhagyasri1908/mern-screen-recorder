import React from 'react';
import VideoPlayer from './VideoPlayer';

const RecordingList = ({ recordings, onSelectRecording, selectedRecording }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (recordings.length === 0) {
    return (
      <div className="recordings-container">
        <p className="no-recordings">No recordings yet. Start recording to see them here.</p>
      </div>
    );
  }

  return (
    <div className="recordings-container">
      <div className="recordings-grid">
        <div>
          <h3 className="section-title">Saved Recordings</h3>
          <ul className="recordings-list">
            {recordings.map(recording => (
              <li 
                key={recording.id} 
                className={selectedRecording && selectedRecording.id === recording.id ? "recording-item selected" : "recording-item"}
                onClick={() => onSelectRecording(recording)}
              >
                <div className="recording-header">
                  <div className="recording-name">{recording.filename}</div>
                  <div className="recording-size">{formatFileSize(recording.filesize)}</div>
                </div>
                <div className="recording-date">
                  {formatDate(recording.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="section-title">Playback</h3>
          {selectedRecording ? (
            <VideoPlayer recording={selectedRecording} />
          ) : (
            <p className="select-recording">Select a recording to play it back</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingList;