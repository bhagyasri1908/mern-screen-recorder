import React, { useState, useRef } from 'react';

const Recorder = ({ onRecordingUploaded, api_url }) => {
  // Use API_URL from prop, fallback to env variable or localhost
  const API_URL = api_url || process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  
  const timerRef = useRef(null);
  const MAX_RECORDING_TIME = 180; // 3 minutes in seconds

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp9,opus' });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        setRecordedChunks(chunks);
        setPreviewUrl(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })));
        combinedStream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecordedChunks([]);
      setPreviewUrl('');

      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setTimer(seconds);
        if (seconds >= MAX_RECORDING_TIME) stopRecording();
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setUploadStatus('Error: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      clearInterval(timerRef.current);
      setTimer(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadRecording = async () => {
    if (recordedChunks.length === 0) return;
    
    try {
      setUploadStatus('Uploading...');
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', blob, `recording-${Date.now()}.webm`);

      const response = await fetch(`${API_URL}/api/recordings`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setUploadStatus('Upload successful!');
        setRecordedChunks([]);
        setPreviewUrl('');
        onRecordingUploaded();
      } else {
        let errorMsg = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMsg += ': ' + errorData.error;
        } catch {
          errorMsg += ': ' + response.statusText;
        }
        setUploadStatus(errorMsg);
      }

    } catch (error) {
      console.error('Error uploading recording:', error);
      setUploadStatus('Upload failed: ' + error.message);
    }
  };

  return (
    <div className="recorder">
      <h2 className="recorder-title">Record Your Screen</h2>
      
      <div className="recorder-controls">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={recording ? "record-button stop" : "record-button start"}
        >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        {recording && (
          <div className="timer">Recording: {formatTime(timer)}</div>
        )}
      </div>
      
      {previewUrl && (
        <div className="preview-container">
          <h3 className="preview-title">Preview</h3>
          <video src={previewUrl} controls className="preview-video" />

          <div className="action-buttons">
            <button onClick={downloadRecording} className="action-button download-button">
              Download
            </button>
            
            <button onClick={uploadRecording} className="action-button upload-button">
              Upload to Server
            </button>
          </div>

          {uploadStatus && <div className="status-message">{uploadStatus}</div>}
        </div>
      )}
    </div>
  );
};

export default Recorder;
