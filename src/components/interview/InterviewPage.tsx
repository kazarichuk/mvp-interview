import React, { useEffect, useRef, useState } from 'react';

const InterviewPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [mediaStatus, setMediaStatus] = useState<'not_initialized' | 'initializing' | 'ready' | 'error'>('not_initialized');
  const [mediaError, setMediaError] = useState<string | null>(null);

  const MAX_MEDIA_RETRIES = 3;
  const MEDIA_RETRY_DELAY = 1000; // 1 second

  const getMediaConstraints = () => {
    return {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
  };

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

      let retryCount = 0;
      let lastError: Error | null = null;

      while (retryCount < MAX_MEDIA_RETRIES) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise<void>((resolve, reject) => {
              if (!videoRef.current) return reject(new Error('Video element not found'));
              
              const timeoutId = setTimeout(() => {
                reject(new Error('Video loading timeout'));
              }, 5000); // 5 second timeout
              
              videoRef.current.onloadedmetadata = () => {
                clearTimeout(timeoutId);
                videoRef.current?.play()
                  .then(() => resolve())
                  .catch(reject);
              };
              
              videoRef.current.onerror = () => {
                clearTimeout(timeoutId);
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

          return; // Success, exit the retry loop
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Failed to access media');
          console.warn(`Media access attempt ${retryCount + 1} failed:`, lastError);
          
          if (retryCount < MAX_MEDIA_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, MEDIA_RETRY_DELAY * Math.pow(2, retryCount)));
            retryCount++;
          } else {
            throw lastError;
          }
        }
      }
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
    await initializeMedia();
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