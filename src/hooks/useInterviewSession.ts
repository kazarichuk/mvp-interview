// src/hooks/useInterviewSession.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// API URL for Python backend
const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

interface UseInterviewSessionProps {
  sessionId: string;
}

interface InterviewResults {
  technical_skills: number;
  design_methodology: number;
  design_principles: number;
  design_systems: number;
  communication: number;
  problem_solving: number;
  overall_score: number;
  experience_level: string;
  strengths: string[];
  areas_for_improvement: string[];
}

export default function useInterviewSession({ sessionId }: UseInterviewSessionProps) {
  const router = useRouter();
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(3600); // 60 minutes in seconds
  const [progress, setProgress] = useState<any>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [useTextInput, setUseTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [results, setResults] = useState<InterviewResults | null>(null);
  
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
      const response = await fetchWithTimeout('/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('API is not healthy');
      }
      
      const data = await response.json();
      if (data.status !== 'ok') {
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
          setIsInitialized(true);
          setProgress(data.progress || 0);
          
          // Проверяем оставшееся время
          const timeElapsed = Math.floor((Date.now() - timestamp) / 1000);
          const remainingTime = Math.max(0, 3600 - timeElapsed);
          setRemainingTime(remainingTime);
          
          if (remainingTime === 0) {
            // Если время вышло, завершаем интервью
            setInterviewComplete(true);
            router.push(`/interview/${sessionId}/complete`);
            return;
          }
          
          setLoading(false);
          return;
        }
      }

      // Start interview
      const response = await fetchWithTimeout('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: 'Start interview' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start interview');
      }
      
      const data = await response.json();
      console.log('Interview started successfully:', data);
      
      // Set initial question
      if (data.response) {
        setCurrentQuestion(data.response);
        setIsInitialized(true);
      } else {
        throw new Error('No question received from server');
      }
      
      setRemainingTime(3600); // Reset timer
      
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
    } finally {
      setLoading(false);
    }
  }, [sessionId, checkApiHealth]);
  
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
      
      console.log('Submitting answer:', answer);
      
      const response = await fetchWithTimeout('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: answer })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit answer');
      }
      
      const data = await response.json();
      console.log('Answer processed successfully:', data);
      
      // Update UI with response
      setCurrentQuestion(data.response);
      setFeedback(data.feedback || '');
      setScore(data.score || null);
      
      // Save progress
      const currentProgress = {
        questions_answered: (progress?.questions_answered || 0) + 1,
        timestamp: Date.now()
      };
      setProgress(currentProgress);
      
      // Save state
      localStorage.setItem(`interview_state_${sessionId}`, JSON.stringify({
        timestamp: Date.now(),
        data: {
          current_question: data.response,
          progress: currentProgress
        }
      }));
      
      setRemainingTime(3600); // Reset timer for next question
      
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
  }, [progress, sessionId]);
  
  // End interview early
  const endInterviewEarly = useCallback(async () => {
    if (window.confirm("Are you sure you want to end the interview early? Your progress will be saved.")) {
      try {
        console.log('Ending interview early...');
        setLoading(true);
        
        // Get results
        const response = await fetchWithTimeout(`/api/interview/${sessionId}/results`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            // Если результаты еще не готовы, показываем сообщение
            setError('Interview results are not yet available. Please try again later.');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to get interview results');
        }
        
        const data = await response.json();
        setResults(data);
        setInterviewComplete(true);
        
        // Очищаем сохраненное состояние
        localStorage.removeItem(`interview_state_${sessionId}`);
        
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
  
  // Return hook interface
  return {
    loading,
    error,
    setError,
    currentQuestion,
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
    results,
    fetchInterviewInfo,
    submitAnswer,
    endInterviewEarly,
    toggleInputMode: () => setUseTextInput(!useTextInput)
  };
}