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
  
  // Add recovery mechanism
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const MAX_RECOVERY_ATTEMPTS = 3;
  
  // Add AI system availability check
  const [aiSystemAvailable, setAiSystemAvailable] = useState(true);
  const [aiRecoveryAttempts, setAiRecoveryAttempts] = useState(0);
  const MAX_AI_RECOVERY_ATTEMPTS = 3;
  
  // Add session state persistence
  const saveSessionState = useCallback(() => {
    if (typeof window !== 'undefined') {
      const state = {
        currentQuestion,
        currentTopic,
        progress,
        remainingTime,
        isInitialized
      };
      localStorage.setItem(`interview_state_${sessionId}`, JSON.stringify(state));
    }
  }, [currentQuestion, currentTopic, progress, remainingTime, isInitialized, sessionId]);
  
  // Load saved session state
  const loadSessionState = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(`interview_state_${sessionId}`);
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setCurrentQuestion(state.currentQuestion);
          setCurrentTopic(state.currentTopic);
          setProgress(state.progress);
          setRemainingTime(state.remainingTime);
          setIsInitialized(state.isInitialized);
          return true;
        } catch (err) {
          console.error('Error loading saved state:', err);
          localStorage.removeItem(`interview_state_${sessionId}`);
        }
      }
    }
    return false;
  }, [sessionId]);
  
  // Fetch initial interview info
  const fetchInterviewInfo = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Fetching interview info for session ${sessionId}...`);
      
      // Try to load saved state first
      const hasSavedState = loadSessionState();
      
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
      
      // Save state after successful fetch
      saveSessionState();
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching interview info:', err);
      
      // Try recovery if we have saved state
      if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
        console.log(`Attempting recovery (${recoveryAttempts + 1}/${MAX_RECOVERY_ATTEMPTS})...`);
        setRecoveryAttempts(prev => prev + 1);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to fetch again
        fetchInterviewInfo();
      } else {
        setError(err.message || 'Error loading interview');
        setLoading(false);
      }
    }
  }, [sessionId, router, isInitialized, recoveryAttempts, saveSessionState, loadSessionState]);
  
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
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log('Failed to start interview, trying fallback...');
        // If starting fails, try to get current interview state
        const fallbackResponse = await fetch(`${API_URL}/interview-info/${sessionId}`);
        
        if (!fallbackResponse.ok) {
          throw new Error('Failed to get interview information');
        }
        
        const fallbackData = await fallbackResponse.json();
        console.log('Using fallback question');
        
        if (fallbackData.status === 'active') {
          setCurrentQuestion(fallbackData.current_question || "Tell us about your experience in UX/UI design. What projects have you worked on and what methodologies do you use?");
          setCurrentTopic(fallbackData.current_topic || 'general');
          setIsInitialized(true);
        }
      } else {
        // Interview successfully started
        const data = await response.json();
        console.log('Interview started, first question received:', data);
        setCurrentQuestion(data.first_question);
        setCurrentTopic(data.current_topic);
        setIsInitialized(true);
      }
      
      setRemainingTime(300); // 5 minutes for an answer
      
    } catch (err: any) {
      console.error('Error fetching next question:', err);
      setError(err.message || 'Failed to load the next question');
    }
  }, [sessionId, isInitialized]);
  
  // Check AI system availability
  const checkAiSystemAvailability = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/health-check`);
      if (!response.ok) {
        throw new Error('AI system unavailable');
      }
      setAiSystemAvailable(true);
      return true;
    } catch (err) {
      console.error('AI system check failed:', err);
      setAiSystemAvailable(false);
      return false;
    }
  }, []);

  // Add recovery mechanism for AI system
  const attemptAiRecovery = useCallback(async () => {
    if (aiRecoveryAttempts >= MAX_AI_RECOVERY_ATTEMPTS) {
      console.log('Max AI recovery attempts reached');
      return false;
    }

    console.log(`Attempting AI system recovery (${aiRecoveryAttempts + 1}/${MAX_AI_RECOVERY_ATTEMPTS})...`);
    setAiRecoveryAttempts(prev => prev + 1);

    // Wait before retry with exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, aiRecoveryAttempts) * 1000));
    
    const isAvailable = await checkAiSystemAvailability();
    if (isAvailable) {
      setAiRecoveryAttempts(0);
      return true;
    }

    return false;
  }, [aiRecoveryAttempts, checkAiSystemAvailability]);
  
  // Submit audio answer
  const submitAudioAnswer = useCallback(async (audioBlob: Blob) => {
    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 120000; // 2 minutes timeout
    let retryCount = 0;

    const attemptSubmission = async (): Promise<any> => {
      try {
        // Check AI system availability before submission
        if (!aiSystemAvailable) {
          const recovered = await attemptAiRecovery();
          if (!recovered) {
            throw new Error('AI system is currently unavailable. Please try again later or use text input.');
          }
        }

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
        
        console.log(`Sending request to ${API_URL}/process-answer/${sessionId} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Set up timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        
        try {
          // Send to server with credentials
          const response = await fetch(`${API_URL}/process-answer/${sessionId}`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            credentials: 'include', // Include credentials for CORS
            headers: {
              'Accept': 'application/json',
            }
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
          return data;
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          throw fetchError;
        }
        
      } catch (err: any) {
        if (retryCount < MAX_RETRIES - 1) {
          console.log(`Retrying submission (${retryCount + 1}/${MAX_RETRIES})...`);
          retryCount++;
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return attemptSubmission();
        }
        throw err;
      }
    };

    try {
      await attemptSubmission();
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setError(`${err.message || 'Failed to submit your answer'}. Try using text input instead.`);
      setLoading(false);
      // Automatically switch to text input on failure
      setUseTextInput(true);
    }
  }, [sessionId, aiSystemAvailable, attemptAiRecovery]);
  
  // Submit text answer
  const submitTextAnswer = useCallback(async (text: string) => {
    try {
      console.log('Submitting text answer...');
      setLoading(true);
      
      const formData = new FormData();
      formData.append('text', text);
      
      const response = await fetch(`${API_URL}/text-answer/${sessionId}`, {
        method: 'POST',
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
    try {
      if (data.error) {
        setError(data.error);
        return;
      }

      // Обновляем UI с транскрипцией ответа
      if (data.transcription) {
        setTranscription(data.transcription);
      }

      // Обновляем ответ AI
      if (data.ai_response) {
        setAiResponse(data.ai_response);
      }

      // Обновляем прогресс
      if (data.progress) {
        setProgress(data.progress);
      }

      // Если интервью завершено
      if (data.completed) {
        setInterviewComplete(true);
        // Сохраняем оценку
        if (data.evaluation) {
          setEvaluation({
            report: data.evaluation,
            scores: data.scores
          });
        }
        // Перенаправляем на страницу результатов
        setTimeout(() => {
          router.push(`/interview/${sessionId}/complete`);
        }, 2000);
        return;
      }

      // Устанавливаем следующий вопрос с задержкой
      if (data.next_question) {
        setTimeout(() => {
          setCurrentQuestion(data.next_question);
          setAiResponse(null); // Очищаем предыдущий ответ AI
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing interview response:', error);
      setError('Failed to process interview response');
    }
  }, [router, sessionId]);
  
  // End interview early
  const endInterviewEarly = useCallback(async () => {
    if (window.confirm("Are you sure you want to end the interview early? Your progress will be saved.")) {
      try {
        console.log('Ending interview early...');
        setLoading(true);
        
        const response = await fetch(`${API_URL}/end-interview/${sessionId}`, {
          method: 'POST'
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