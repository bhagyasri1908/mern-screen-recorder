import React from 'react';

const VideoPlayer = ({ recording }) => {
  // Use env var in production, fallback to localhost for dev
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const videoUrl = `${API_URL}/api/recordings/${recording.id}`;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="playback-container">
      <h4 className="playback-title">{recording.filename}</h4>
      <video
        controls
        className="playback-video"
        key={videoUrl} // Force re-render when recording changes
      >
        <source src={videoUrl} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <div className="playback-info">
        <p>Size: {formatFileSize(recording.filesize)}</p>
        <p>Created: {new Date(recording.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
