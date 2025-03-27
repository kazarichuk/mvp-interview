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
      setError(null);
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

      const response = await fetch(`${API_URL}/interview-info/${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load interview information');
      }
      
      const data = await response.json();
      console.log('Interview info received:', data);
      
      // Проверяем статус сервера
      if (data.status === 'error') {
        throw new Error(data.message || 'Server error occurred');
      }
      
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
      const question = data.current_question || data.first_question;
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
        setCurrentTopic(data.current_topic || 'general');
        setIsInitialized(true);
        
        // Сохраняем состояние
        localStorage.setItem(`interview_state_${sessionId}`, JSON.stringify({
          timestamp: Date.now(),
          data: {
            current_question: question,
            current_topic: data.current_topic || 'general',
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
  }, [sessionId, router, isInitialized]);
  
  // Fetch next question or start interview
  const fetchNextQuestion = useCallback(async () => {
    if (isInitialized) {
      console.log('Interview already initialized, skipping fetchNextQuestion');
      return;
    }

    try {
      console.log('Fetching next question...');
      setLoading(true);
      setError(null);
      
      // Получаем данные кандидата из localStorage
      const candidateData = localStorage.getItem('candidateData');
      if (!candidateData) {
        throw new Error('Candidate data not found. Please start the interview again.');
      }
      
      const { name, email, position } = JSON.parse(candidateData);
      console.log('Using candidate data:', { name, email, position });
      
      const response = await fetch(`${API_URL}/start-interview/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          position
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start interview');
      }
      
      const data = await response.json();
      console.log('Interview started, first question received:', data);
      
      // Проверяем статус сервера
      if (data.status === 'error') {
        throw new Error(data.message || 'Server error occurred');
      }
      
      // Проверяем статус интервью
      if (data.status === 'active' || data.status === 'resumed') {
        const question = data.first_question || data.current_question;
        if (!question || question.trim() === '') {
          console.error('No valid question in response:', data);
          throw new Error('Interview question is missing. Please try again or contact support.');
        }
        
        console.log('Setting current question:', question);
        setCurrentQuestion(question);
        setCurrentTopic(data.current_topic || 'general');
        setIsInitialized(true);
        
        // Сохраняем состояние
        localStorage.setItem(`interview_state_${sessionId}`, JSON.stringify({
          timestamp: Date.now(),
          data: {
            current_question: question,
            current_topic: data.current_topic || 'general',
            progress: data.progress
          }
        }));
      } else {
        console.error('Invalid interview status:', data.status);
        throw new Error('Interview failed to start properly');
      }
      
      setRemainingTime(300); // Reset timer for next question
      
    } catch (err: any) {
      console.error('Error fetching next question:', err);
      setError(err.message || 'Failed to load the next question');
      
      // Показываем уведомление об ошибке
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = err.message || 'Failed to load the next question';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId, isInitialized]);
  
  // Submit answer with improved error handling and retry logic
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
      
      console.log('Submitting answer:', { answer, currentTopic });
      
      const response = await fetch(`${API_URL}/submit-answer/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          answer,
          topic: currentTopic
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit answer');
      }
      
      const data = await response.json();
      console.log('Answer submitted successfully:', data);
      
      // Обновляем прогресс
      if (data.progress) {
        setProgress(data.progress);
      }
      
      // Проверяем, завершено ли интервью
      if (data.status === 'completed') {
        console.log('Interview completed, redirecting to results page');
        router.replace(`/interview/${sessionId}/complete`);
        return;
      }
      
      // Получаем следующий вопрос
      if (data.next_question) {
        setCurrentQuestion(data.next_question);
        setCurrentTopic(data.next_topic || 'general');
      } else {
        throw new Error('No next question available');
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
  }, [sessionId, currentTopic, router]);
  
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
    submitAnswer,
    endInterviewEarly,
    toggleInputMode: () => setUseTextInput(!useTextInput)
  };
}