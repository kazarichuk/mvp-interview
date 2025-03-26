// src/hooks/useInterviewSession.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// API URL for Python backend
const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

interface UseInterviewSessionProps {
  sessionId: string;
}

export default function useInterviewSession({ sessionId }: UseInterviewSessionProps) {
  const router = useRouter();
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds
  const [progress, setProgress] = useState<any>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [useTextInput, setUseTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Fetch initial interview info
  const fetchInterviewInfo = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Fetching interview info for session ${sessionId}...`);
      const response = await fetch(`${API_URL}/interview-info/${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load interview information');
      }
      
      const data = await response.json();
      console.log('Interview info received:', data);
      
      // Check interview status
      if (data.status === 'pending') {
        console.log('Interview pending, redirecting to start page');
        router.replace(`/interview/${sessionId}`);
        return;
      }
      
      if (data.status === 'completed') {
        console.log('Interview already completed, redirecting to results page');
        router.replace(`/interview/${sessionId}/complete`);
        return;
      }
      
      // Update progress
      if (data.progress) {
        setProgress(data.progress);
      }

      // If interview is active but not initialized, get current question
      if (data.status === 'active' && !isInitialized) {
        setCurrentQuestion(data.current_question || "Tell us about your experience in UX/UI design. What projects have you worked on and what methodologies do you use?");
        setCurrentTopic(data.current_topic || 'general');
        setIsInitialized(true);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching interview info:', err);
      setError(err.message || 'Error loading interview');
      setLoading(false);
    }
  }, [sessionId, router, isInitialized]);
  
  // Fetch next question or start interview
  const fetchNextQuestion = useCallback(async () => {
    if (isInitialized) {
      console.log('Interview already initialized, skipping fetchNextQuestion');
      return;
    }

    try {
      console.log('Fetching next question...');
      const response = await fetch(`${API_URL}/start-interview/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: '', // Имя будет добавлено позже
          email: '', // Email будет добавлен позже
          position: 'UX/UI Designer'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start interview');
      }
      
      const data = await response.json();
      console.log('Interview started, first question received:', data);
      setCurrentQuestion(data.first_question);
      setCurrentTopic(data.current_topic);
      setIsInitialized(true);
      
      setRemainingTime(300); // 5 minutes for an answer
      
    } catch (err: any) {
      console.error('Error fetching next question:', err);
      setError(err.message || 'Failed to load the next question');
    }
  }, [sessionId, isInitialized]);
  
  // Submit audio answer
  const submitAudioAnswer = useCallback(async (audioBlob: Blob) => {
    try {
      console.log(`Submitting audio answer, size: ${audioBlob.size} bytes, type: ${audioBlob.type}...`);
      setLoading(true);
      
      // Get file extension based on audio type
      const fileExtension = audioBlob.type.includes('webm') ? 'webm' : 
                         audioBlob.type.includes('ogg') ? 'ogg' : 
                         audioBlob.type.includes('mp4') ? 'mp4' : 
                         audioBlob.type.includes('mpeg') ? 'mp3' : 'wav';
      
      // Create form with audio data
      const formData = new FormData();
      formData.append('audio', audioBlob, `answer.${fileExtension}`);
      
      console.log(`Sending request to ${API_URL}/process-answer/${sessionId}`);
      
      // Set up timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
      
      try {
        // Send to server
        const response = await fetch(`${API_URL}/process-answer/${sessionId}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          let errorText = '';
          try {
            const errorData = await response.json();
            errorText = errorData.detail || 'Failed to process your answer';
          } catch {
            errorText = `Server error (${response.status})`;
          }
          throw new Error(errorText);
        }
        
        const data = await response.json();
        console.log('Response received:', data);
        
        // Process response
        processInterviewResponse(data);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. The server took too long to respond. Try using text input instead.');
        }
        throw fetchError;
      }
      
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setError(`${err.message || 'Failed to submit your answer'}. Try using text input instead.`);
      setLoading(false);
      // Automatically switch to text input on failure
      setUseTextInput(true);
    }
  }, [sessionId]);
  
  // Submit text answer
  const submitTextAnswer = useCallback(async (text: string) => {
    try {
      console.log('Submitting text answer...');
      setLoading(true);
      
      const formData = new FormData();
      formData.append('text', text);
      
      const response = await fetch(`${API_URL}/text-answer/${sessionId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process your answer');
      }
      
      const data = await response.json();
      console.log('Text answer response received:', data);
      
      // Process response
      processInterviewResponse(data);
      
      // Clear text input
      setTextInput('');
      
    } catch (err: any) {
      console.error('Error submitting text answer:', err);
      setError(err.message || 'Failed to submit your text answer');
      setLoading(false);
    }
  }, [sessionId]);
  
  // Process interview response data
  const processInterviewResponse = useCallback((data: any) => {
    // Update UI with response
    setTranscription(data.transcription || '');
    setAiResponse(data.response || '');
    
    // Update progress
    if (data.progress) {
      setProgress(data.progress);
    }
    
    // Reset timer
    setRemainingTime(300);
    
    // Check if interview is complete
    if (data.interview_complete) {
      setInterviewComplete(true);
      if (data.evaluation) {
        setEvaluation({
          report: data.evaluation,
          scores: data.scores
        });
      }
      
      // Redirect to results page after 5 seconds
      setTimeout(() => {
        router.push(`/interview/${sessionId}/complete`);
      }, 5000);
    } else if (data.next_question) {
      // Set next question with a small delay
      setTimeout(() => {
        setCurrentQuestion(data.next_question);
        setCurrentTopic(data.next_topic || null);
      }, 1000);
    }
    
    setLoading(false);
  }, [router, sessionId]);
  
  // End interview early
  const endInterviewEarly = useCallback(async () => {
    if (window.confirm("Are you sure you want to end the interview early? Your progress will be saved.")) {
      try {
        console.log('Ending interview early...');
        setLoading(true);
        
        const response = await fetch(`${API_URL}/end-interview/${sessionId}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to end the interview');
        }
        
        console.log('Interview ended successfully');
        
        // Redirect to results page
        router.push(`/interview/${sessionId}/complete`);
        
      } catch (err: any) {
        console.error('Error ending interview:', err);
        setError(err.message || 'Failed to end the interview');
        setLoading(false);
      }
    }
  }, [router, sessionId]);
  
  // Toggle between text and audio input
  const toggleInputMode = useCallback(() => {
    setUseTextInput(!useTextInput);
  }, [useTextInput]);
  
  // Return hook interface
  return {
    loading,
    error,
    setError,
    currentQuestion,
    currentTopic,
    transcription,
    aiResponse,
    remainingTime,
    setRemainingTime,
    progress,
    interviewComplete,
    evaluation,
    useTextInput,
    textInput,
    setTextInput,
    isInitialized,
    fetchInterviewInfo,
    fetchNextQuestion,
    submitAudioAnswer,
    submitTextAnswer,
    endInterviewEarly,
    toggleInputMode: () => setUseTextInput(!useTextInput)
  };
}