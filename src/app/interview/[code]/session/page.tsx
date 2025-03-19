"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Camera, CameraOff, Loader2, XCircle, CheckCircle, Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';

// API URL для Python-бэкенда
const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.code as string;
  
  // Состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [remainingTime, setRemainingTime] = useState(300); // 5 минут в секундах
  const [progress, setProgress] = useState<any>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  
  // Медиа состояния
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  
  // Рефы
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Загрузка информации об интервью
  useEffect(() => {
    async function fetchInterviewInfo() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/interview-info/${sessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Не удалось загрузить информацию об интервью');
        }
        
        const data = await response.json();
        
        // Проверяем статус интервью
        if (data.status === 'pending') {
          // Интервью еще не начато, перенаправляем на страницу начала
          router.replace(`/interview/${sessionId}`);
          return;
        }
        
        if (data.status === 'completed') {
          // Интервью уже завершено, перенаправляем на страницу результатов
          router.replace(`/interview/${sessionId}/complete`);
          return;
        }
        
        // Обновляем прогресс
        if (data.progress) {
          setProgress(data.progress);
        }
        
        // Запрашиваем первый вопрос, если это новое интервью
        await fetchNextQuestion();
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching interview info:', err);
        setError(err.message || 'Ошибка при загрузке интервью');
        setLoading(false);
      }
    }
    
    fetchInterviewInfo();
  }, [sessionId, router]);
  
  // Управление таймером
  useEffect(() => {
    if (currentQuestion && !interviewComplete) {
      // Запускаем таймер
      timerRef.current = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            // Время истекло, останавливаем запись если она активна
            if (isRecording) {
              stopRecording();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion, interviewComplete, isRecording]);
  
  // Запрос доступа к медиа-устройствам
  useEffect(() => {
    async function setupMedia() {
      try {
        // Запрашиваем доступ к микрофону и камере
        const constraints = {
          audio: micActive,
          video: cameraActive ? { width: 640, height: 480 } : false
        };
        
        // Останавливаем предыдущий медиа-поток, если он есть
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Запрашиваем новый поток с обновленными параметрами
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        // Обновляем видео-элемент, если камера включена
        if (videoRef.current && cameraActive) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        if (micActive) {
          setError('Не удалось получить доступ к микрофону. Проверьте разрешения в браузере.');
        }
      }
    }
    
    setupMedia();
    
    return () => {
      // Очищаем медиа-потоки при размонтировании компонента
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [micActive, cameraActive]);
  
  // Форматирование времени для отображения
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Запуск записи аудио
  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await submitAudioAnswer(audioBlob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('');
      setAiResponse('');
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Не удалось начать запись. Проверьте разрешения для микрофона.');
    }
  };
  
  // Остановка записи аудио
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Отправка аудио-ответа на сервер
  const submitAudioAnswer = async (audioBlob: Blob) => {
    try {
      setLoading(true);
      
      // Создаем форму с аудио-данными
      const formData = new FormData();
      formData.append('audio', audioBlob, 'answer.wav');
      
      // Отправляем на сервер
      const response = await fetch(`${API_URL}/process-answer/${sessionId}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось обработать ваш ответ');
      }
      
      const data = await response.json();
      
      // Обновляем UI с ответом
      setTranscription(data.transcription);
      setAiResponse(data.response);
      
      // Обновляем прогресс
      if (data.progress) {
        setProgress(data.progress);
      }
      
      // Сбрасываем таймер
      setRemainingTime(300);
      
      // Проверяем, завершено ли интервью
      if (data.interview_complete) {
        setInterviewComplete(true);
        if (data.evaluation) {
          setEvaluation({
            report: data.evaluation,
            scores: data.scores
          });
        }
        
        // Перенаправляем на страницу результатов через 5 секунд
        setTimeout(() => {
          router.push(`/interview/${sessionId}/complete`);
        }, 5000);
      } else if (data.next_question) {
        // Устанавливаем следующий вопрос с небольшой задержкой
        setTimeout(() => {
          setCurrentQuestion(data.next_question);
          setCurrentTopic(data.next_topic || null);
        }, 1000);
      }
      
      setLoading(false);
      
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setError(err.message || 'Не удалось отправить ваш ответ');
      setLoading(false);
    }
  };
  
  // Отправка текстового ответа (для тестирования)
  const submitTextAnswer = async (text: string) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('text', text);
      
      const response = await fetch(`${API_URL}/text-answer/${sessionId}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось обработать ваш ответ');
      }
      
      const data = await response.json();
      
      // Обновляем UI с ответом
      setTranscription(data.transcription);
      setAiResponse(data.response);
      
      // Обновляем прогресс
      if (data.progress) {
        setProgress(data.progress);
      }
      
      // Сбрасываем таймер
      setRemainingTime(300);
      
      // Проверяем, завершено ли интервью
      if (data.interview_complete) {
        setInterviewComplete(true);
        if (data.evaluation) {
          setEvaluation({
            report: data.evaluation,
            scores: data.scores
          });
        }
        
        // Перенаправляем на страницу результатов через 5 секунд
        setTimeout(() => {
          router.push(`/interview/${sessionId}/complete`);
        }, 5000);
      } else if (data.next_question) {
        // Устанавливаем следующий вопрос
        setCurrentQuestion(data.next_question);
        setCurrentTopic(data.next_topic || null);
      }
      
      setLoading(false);
      
    } catch (err: any) {
      console.error('Error submitting text answer:', err);
      setError(err.message || 'Не удалось отправить ваш текстовый ответ');
      setLoading(false);
    }
  };
  
  // Получение следующего вопроса
  const fetchNextQuestion = async () => {
    try {
      const response = await fetch(`${API_URL}/start-interview/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "Candidate", // это уже должно быть установлено на сервере
          email: "candidate@example.com", // это уже должно быть установлено на сервере
          position: "UX/UI Designer"
        })
      });
      
      if (!response.ok) {
        // Если начать не получилось, пробуем получить текущее состояние интервью
        const fallbackResponse = await fetch(`${API_URL}/interview-info/${sessionId}`);
        
        if (!fallbackResponse.ok) {
          throw new Error('Не удалось получить информацию об интервью');
        }
        
        const data = await fallbackResponse.json();
        
        // Устанавливаем заглушку для первого вопроса
        setCurrentQuestion("Расскажите о вашем опыте в UX/UI дизайне. Над какими проектами вы работали и какие методологии используете?");
        setCurrentTopic('general');
      } else {
        // Интервью успешно начато
        const data = await response.json();
        setCurrentQuestion(data.first_question);
        setCurrentTopic(data.current_topic);
      }
      
      setRemainingTime(300); // 5 минут на ответ
      
    } catch (err: any) {
      console.error('Error fetching next question:', err);
      setError(err.message || 'Не удалось загрузить следующий вопрос');
    }
  };
  
  // Завершение интервью досрочно
  const endInterviewEarly = async () => {
    if (window.confirm("Вы уверены, что хотите завершить интервью досрочно? Ваш прогресс будет сохранен.")) {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/end-interview/${sessionId}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Не удалось завершить интервью');
        }
        
        const data = await response.json();
        
        // Перенаправляем на страницу результатов
        router.push(`/interview/${sessionId}/complete`);
        
      } catch (err: any) {
        console.error('Error ending interview:', err);
        setError(err.message || 'Не удалось завершить интервью');
        setLoading(false);
      }
    }
  };
  
  // Обработчики включения/выключения медиа
  const toggleMicrophone = () => {
    setMicActive(!micActive);
  };
  
  const toggleCamera = () => {
    setCameraActive(!cameraActive);
  };
  
  // Показываем загрузку
  if (loading && !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка интервью...</p>
        </div>
      </div>
    );
  }
  
  // Показываем ошибку
  if (error && !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="mb-6">
          <Image
            src="/logo.svg"
            alt="HireFlick Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
        
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-red-600">Ошибка интервью</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="mt-4">
              <Button onClick={() => window.location.reload()}>
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Если интервью завершено
  if (interviewComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="mb-6">
          <Image
            src="/logo.svg"
            alt="HireFlick Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
        
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-6 w-6" />
              Интервью завершено!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Спасибо за участие в интервью! Ваши ответы записаны и будут проанализированы.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-md text-blue-800">
              <p>Перенаправляем вас на страницу с результатами...</p>
              <Progress value={100} className="mt-2 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Основной UI интервью
  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Хедер */}
      <header className="bg-white border-b py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo.svg"
              alt="HireFlick Logo"
             width={100}
             height={32}
             className="object-contain"
           />
           <span className="hidden md:inline-block text-sm text-gray-500">AI-Powered UX/UI Interview</span>
         </div>
         
         <div className="flex items-center space-x-2">
           <div className="flex items-center text-sm text-gray-700 mr-2">
             <Clock className="h-4 w-4 mr-1 text-gray-500" />
             <span className={remainingTime < 60 ? "text-red-600 font-medium" : ""}>
               {formatTime(remainingTime)}
             </span>
           </div>
           
           <Button
             variant="ghost"
             size="sm"
             className="text-gray-700 hover:text-red-600"
             onClick={endInterviewEarly}
           >
             <XCircle className="h-4 w-4 mr-1" />
             <span className="hidden sm:inline">End Interview</span>
           </Button>
         </div>
       </div>
     </header>
     
     <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Левая колонка - видео и контроль */}
       <div className="lg:col-span-1">
         <Card className="mb-4">
           <CardContent className="p-4">
             {/* Видео */}
             <div className="relative bg-gray-900 aspect-video rounded-md mb-4 overflow-hidden">
               {cameraActive ? (
                 <video
                   ref={videoRef}
                   autoPlay
                   muted
                   playsInline
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                   <CameraOff className="h-12 w-12 text-gray-500" />
                 </div>
               )}
               
               {/* Индикатор записи */}
               {isRecording && (
                 <div className="absolute top-2 right-2 flex items-center bg-red-600 text-white px-2 py-1 rounded-md text-xs animate-pulse">
                   <span className="h-2 w-2 bg-white rounded-full mr-1"></span>
                   Recording
                 </div>
               )}
             </div>
             
             {/* Кнопки управления медиа */}
             <div className="flex justify-center space-x-2">
               <Button
                 variant={micActive ? "default" : "outline"}
                 size="sm"
                 onClick={toggleMicrophone}
                 className="flex-1"
               >
                 {micActive ? (
                   <>
                     <Mic className="h-4 w-4 mr-1" />
                     <span className="hidden sm:inline">Mic On</span>
                   </>
                 ) : (
                   <>
                     <MicOff className="h-4 w-4 mr-1" />
                     <span className="hidden sm:inline">Mic Off</span>
                   </>
                 )}
               </Button>
               
               <Button
                 variant={cameraActive ? "default" : "outline"}
                 size="sm"
                 onClick={toggleCamera}
                 className="flex-1"
               >
                 {cameraActive ? (
                   <>
                     <Camera className="h-4 w-4 mr-1" />
                     <span className="hidden sm:inline">Camera On</span>
                   </>
                 ) : (
                   <>
                     <CameraOff className="h-4 w-4 mr-1" />
                     <span className="hidden sm:inline">Camera Off</span>
                   </>
                 )}
               </Button>
             </div>
           </CardContent>
         </Card>
         
         {/* Прогресс интервью */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-lg">Interview Progress</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             {progress ? (
               <>
                 <div className="space-y-1">
                   <div className="flex justify-between text-sm">
                     <span>Questions: {progress.questions_asked}/{progress.max_questions}</span>
                     <span>{Math.round((progress.questions_asked / progress.max_questions) * 100)}%</span>
                   </div>
                   <Progress value={(progress.questions_asked / progress.max_questions) * 100} />
                 </div>
                 
                 <div className="space-y-1">
                   <div className="flex justify-between text-sm">
                     <span>Time: {Math.round(progress.elapsed_minutes)}/{progress.max_duration_minutes} min</span>
                     <span>{Math.round((progress.elapsed_minutes / progress.max_duration_minutes) * 100)}%</span>
                   </div>
                   <Progress value={(progress.elapsed_minutes / progress.max_duration_minutes) * 100} />
                 </div>
                 
                 {currentTopic && (
                   <div className="bg-blue-50 p-3 rounded-md">
                     <p className="text-xs text-gray-500 mb-1">Current Topic:</p>
                     <p className="text-sm font-medium capitalize">
                       {currentTopic.replace('_', ' ')}
                     </p>
                   </div>
                 )}
               </>
             ) : (
               <div className="py-2">
                 <Loader2 className="h-5 w-5 animate-spin mx-auto" />
               </div>
             )}
           </CardContent>
         </Card>
       </div>
       
       {/* Правая колонка - интервью */}
       <div className="lg:col-span-2 space-y-4">
         {/* Вопрос */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-lg flex items-center">
               <span className="inline-block w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                 Q
               </span>
               Interview Question
             </CardTitle>
           </CardHeader>
           <CardContent>
             {currentQuestion ? (
               <div className="text-gray-800 py-1">{currentQuestion}</div>
             ) : (
               <div className="flex items-center justify-center h-16">
                 <Loader2 className="h-5 w-5 animate-spin" />
               </div>
             )}
           </CardContent>
         </Card>
         
         {/* Ответ и запись */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-lg flex items-center">
               <span className="inline-block w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mr-2">
                 A
               </span>
               Your Answer
             </CardTitle>
           </CardHeader>
           <CardContent className="pb-2">
             {isRecording ? (
               <div className="flex flex-col items-center justify-center py-4">
                 <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-2 relative">
                   <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse"></div>
                   <div className="absolute inset-0 w-full h-full rounded-full border-4 border-red-500 opacity-75"></div>
                 </div>
                 <p className="text-gray-700 mb-1">Recording...</p>
                 <p className="text-sm text-gray-500">
                   Speak clearly into your microphone
                 </p>
               </div>
             ) : transcription ? (
               <div className="rounded-md bg-gray-50 p-3 text-gray-800">
                 {transcription}
               </div>
             ) : (
               <div className="text-center py-6">
                 <p className="text-gray-500 mb-2">Press the button below to start recording your answer</p>
                 <p className="text-xs text-gray-400">
                   You have {formatTime(remainingTime)} to answer this question
                 </p>
               </div>
             )}
           </CardContent>
           <CardFooter className="pt-0">
             {isRecording ? (
               <Button
                 className="w-full"
                 variant="destructive"
                 onClick={stopRecording}
               >
                 <span className="flex items-center">
                   <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                   Stop Recording
                 </span>
               </Button>
             ) : (
               <Button
                 className="w-full"
                 onClick={startRecording}
                 disabled={!micActive || loading}
               >
                 {loading ? (
                   <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                 ) : (
                   <Mic className="h-4 w-4 mr-1" />
                 )}
                 {loading ? "Processing..." : "Start Recording"}
               </Button>
             )}
           </CardFooter>
         </Card>
         
         {/* Ответ интервьюера */}
         {aiResponse && (
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-lg flex items-center">
                 <span className="inline-block w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs mr-2">
                   AI
                 </span>
                 Interviewer Response
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="rounded-md bg-purple-50 p-3 text-gray-800">
                 {aiResponse}
               </div>
             </CardContent>
           </Card>
         )}
         
         {/* Сообщение об ошибке */}
         {error && (
           <Alert variant="destructive">
             <AlertDescription>{error}</AlertDescription>
           </Alert>
         )}
       </div>
     </main>
   </div>
 );
}