import React, { useEffect, useRef, useState } from 'react';

const InterviewPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [mediaStatus, setMediaStatus] = useState<'not_initialized' | 'initializing' | 'ready' | 'error'>('not_initialized');
  const [mediaError, setMediaError] = useState<string | null>(null);

  const getMediaConstraints = () => ({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: {
      width: { ideal: 640, max: 1280 },
      height: { ideal: 480, max: 720 },
      frameRate: { max: 30 },
      facingMode: 'user'
    }
  });

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
      videoRef.current.srcObject = null;
    }
  };

  const initializeMedia = async () => {
    try {
      setMediaError(null);
      setMediaStatus('initializing');
      
      // Ensure we clean up any existing streams
      stopMediaTracks();

      const constraints = getMediaConstraints();
      console.log('Requesting media with constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject(new Error('Video element not found'));
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => resolve())
              .catch(reject);
          };
          
          videoRef.current.onerror = () => {
            reject(new Error('Failed to load video'));
          };
        });
      }

      setMediaStatus('ready');
      
      // Monitor track states
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.warn('Media track ended:', track.kind);
          retryMediaAccess();
        };
        
        track.onmute = () => {
          console.warn('Media track muted:', track.kind);
          if (!track.muted) {
            retryMediaAccess();
          }
        };
      });

    } catch (error) {
      console.error('Error initializing media:', error);
      setMediaError(
        error instanceof Error 
          ? `Failed to access media: ${error.message}` 
          : 'Failed to access camera or microphone'
      );
      setMediaStatus('error');
      stopMediaTracks();
    }
  };

  const retryMediaAccess = async () => {
    if (mediaStatus === 'initializing') return;
    
    console.log('Retrying media access...');
    setMediaStatus('not_initialized');
  };

  useEffect(() => {
    if (mediaStatus === 'not_initialized') {
      initializeMedia();
    }

    return () => {
      stopMediaTracks();
    };
  }, [mediaStatus]);

  return (
    <div className="interview-container">
      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        muted
        className="interview-video"
      />
      {mediaError && (
        <div className="media-error">
          <p>{mediaError}</p>
          <button 
            onClick={retryMediaAccess}
            className="retry-button"
          >
            Retry Camera Access
          </button>
        </div>
      )}
      {mediaStatus === 'initializing' && (
        <div className="media-loading">
          Initializing camera and microphone...
        </div>
      )}
    </div>
  );
};

export default InterviewPage; 