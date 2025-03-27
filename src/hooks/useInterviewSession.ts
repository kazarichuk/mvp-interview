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
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds
  const [progress, setProgress] = useState<any>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [useTextInput, setUseTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Fetch with timeout
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  // Check API health
  const checkApiHealth = useCallback(async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('API is not healthy');
      }
      const data = await response.json();
      if (data.status !== 'healthy' || data.vllm_api !== 'available') {
        throw new Error('API services are not available');
      }
      return true;
    } catch (err) {
      console.error('API health check failed:', err);
      return false;
    }
  }, []);

  // Fetch initial interview info
  const fetchInterviewInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check API health first
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        throw new Error('Interview service is temporarily unavailable. Please try again later.');
      }
      
      console.log(`Fetching interview info for session ${sessionId}...`);
      
      // Проверяем сохраненное состояние
      const savedState = localStorage.getItem(`interview_state_${sessionId}`);
      if (savedState) {
        const { timestamp, data } = JSON.parse(savedState);
        // Проверяем, не устарело ли сохраненное состояние (30 минут)
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          console.log('Using saved interview state');
          setCurrentQuestion(data.current_question);
          setCurrentTopic(data.current_topic);
          setIsInitialized(true);
          setProgress(data.progress || 0);
          setLoading(false);
          return;
        }
      }

      const response = await fetchWithTimeout(`${API_URL}/api/interview-info/${sessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load interview information');
      }
      
      const data = await response.json();
      console.log('Interview info received:', data);
      
      // Проверяем статус интервью
      if (data.status === 'pending') {
        console.log('Interview pending, redirecting to start page');
        window.location.href = `/interview/${sessionId}`;
        return;
      }
      
      if (data.status === 'completed') {
        console.log('Interview already completed, redirecting to results page');
        router.replace(`/interview/${sessionId}/complete`);
        return;
      }
      
      // Проверяем наличие вопроса
      const question = data.question;
      if (!question || question.trim() === '') {
        console.error('No valid question in response:', data);
        throw new Error('Interview question is missing. Please try again or contact support.');
      }
      
      // Update progress
      if (data.progress) {
        setProgress(data.progress);
      }

      // If interview is active or resumed, get current question
      if ((data.status === 'active' || data.status === 'resumed') && !isInitialized) {
        console.log('Setting current question:', question);
        setCurrentQuestion(question);
        setCurrentTopic(data.topic || 'general');
        setIsInitialized(true);
        
        // Сохраняем состояние
        localStorage.setItem(`interview_state_${sessionId}`, JSON.stringify({
          timestamp: Date.now(),
          data: {
            current_question: question,
            current_topic: data.topic || 'general',
            progress: data.progress
          }
        }));
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching interview info:', err);
      setError(err.message || 'Error loading interview');
      setLoading(false);
      
      // Показываем уведомление об ошибке
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = err.message || 'Error loading interview';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
      }
    }
  }, [sessionId, router, isInitialized, checkApiHealth]);
  
  // Start interview
  const startInterview = useCallback(async (candidateData: { name: string; email: string; position: string }) => {
    try {
      console.log('Starting interview...');
      setLoading(true);
      setError(null);
      
      // Validate candidate data
      const errors = [];
      if (!candidateData.name || candidateData.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (!candidateData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateData.email)) {
        errors.push('Invalid email format');
      }
      if (!candidateData.position) {
        errors.push('Position is required');
      }
      
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      const response = await fetchWithTimeout(`${API_URL}/api/start-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(candidateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start interview');
      }
      
      const data = await response.json();
      console.log('Interview started successfully:', data);
      
      // Save session ID
      localStorage.setItem('interview_session_id', data.session_id);
      
      // Set initial question
      if (data.question) {
        setCurrentQuestion(data.question);
        setCurrentTopic(data.topic || 'general');
        setIsInitialized(true);
      } else {
        throw new Error('No question received from server');
      }
      
      setRemainingTime(300); // Reset timer
      
    } catch (err: any) {
      console.error('Error starting interview:', err);
      setError(err.message || 'Failed to start interview');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Submit answer
  const submitAnswer = useCallback(async (answer: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем подключение к интернету
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      // Проверяем валидность ответа
      if (!answer.trim()) {
        throw new Error('Please provide an answer before submitting.');
      }
      
      if (answer.length < 10) {
        throw new Error('Your answer is too short. Please provide more details.');
      }
      
      // Get session ID
      const sessionId = localStorage.getItem('interview_session_id');
      if (!sessionId) {
        throw new Error('No active interview session');
      }
      
      console.log('Submitting answer:', { answer, currentTopic });
      
      const response = await fetchWithTimeout(`${API_URL}/api/process-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          answer: answer
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit answer');
      }
      
      const data = await response.json();
      console.log('Answer processed successfully:', data);
      
      // Update UI with response
      setFeedback(data.feedback);
      setScore(data.score);
      
      // Set next question
      if (data.next_question) {
        setCurrentQuestion(data.next_question);
        setCurrentTopic(data.topic || 'general');
      } else {
        setInterviewComplete(true);
        router.replace(`/interview/${sessionId}/complete`);
        return;
      }
      
      setRemainingTime(300); // Reset timer for next question
      
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setError(err.message || 'Failed to submit answer');
      
      // Показываем уведомление об ошибке
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = err.message || 'Failed to submit answer';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
      }
    } finally {
      setLoading(false);
    }
  }, [currentTopic, router]);
  
  // End interview early
  const endInterviewEarly = useCallback(async () => {
    if (window.confirm("Are you sure you want to end the interview early? Your progress will be saved.")) {
      try {
        console.log('Ending interview early...');
        setLoading(true);
        
        const sessionId = localStorage.getItem('interview_session_id');
        if (!sessionId) {
          throw new Error('No active interview session');
        }
        
        const response = await fetchWithTimeout(`${API_URL}/api/end-interview/${sessionId}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          }
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
  }, [router]);
  
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
    feedback,
    score,
    remainingTime,
    setRemainingTime,
    progress,
    interviewComplete,
    useTextInput,
    textInput,
    setTextInput,
    isInitialized,
    fetchInterviewInfo,
    startInterview,
    submitAnswer,
    endInterviewEarly,
    toggleInputMode: () => setUseTextInput(!useTextInput)
  };
}