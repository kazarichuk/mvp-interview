'use client';

import { useState, useEffect, useRef } from 'react';
  import { useRouter } from 'next/navigation';
  
  // Можно расширять список вопросов
  const questions = [
    'Tell me about your past experience.'
  ];
  
  export default function HomePage() {
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
  
    // Запрос на доступ к камере и микрофону (для приветственного экрана)
    const handleStartNow = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setPermissionGranted(true);
  
        // Останавливаем поток сразу, чтобы не показывать его на welcome-экране
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error('Error accessing devices:', error);
        alert('Error: Please grant access to your camera and microphone.');
      }
    };
  
    // Начинаем «интервью»
    const handleBeginInterview = () => {
      setInterviewStarted(true);
    };
  
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-gray-100">
        {/* Если интервью не началось – показываем приветственный экран */}
        {!interviewStarted ? (
          <WelcomeScreen
            permissionGranted={permissionGranted}
            onStartNow={handleStartNow}
            onBeginInterview={handleBeginInterview}
          />
        ) : (
          <Interview setIsProcessing={setIsProcessing} questions={questions} />
        )}
  
        {/* Если идёт какой-то процесс (например, финализация) – выводим подсказку */}
        {isProcessing && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
            Processing...
          </div>
        )}
      </div>
    );
  }
  
  /** Приветственный экран */
  function WelcomeScreen({
    permissionGranted,
    onStartNow,
    onBeginInterview,
  }: {
    permissionGranted: boolean;
    onStartNow: () => void;
    onBeginInterview: () => void;
  }) {
    return (
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl m-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Design Skill Assessment
        </h1>
          <p className="text-lg text-center text-gray-700 mb-8 leading-relaxed">
          Test your design skills and get your level instantly.  
          </p>
  
        <div className="flex flex-col items-center">
          {!permissionGranted && (
            <button
              onClick={onStartNow}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium mb-4"
            >
              Start Now
            </button>
          )}
  
          {permissionGranted && (
            <>
              <p className="mb-4 text-green-700 font-medium">
                Access to camera and microphone granted!
              </p>
              <button
                onClick={onBeginInterview}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 font-medium"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
  
  /** Экран интервью: запись видео и переход в /thanks */
  function Interview({
    setIsProcessing,
    questions,
  }: {
    setIsProcessing: (value: boolean) => void;
    questions: string[];
  }) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recording, setRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // New local loading state
  
    const videoRef = useRef<HTMLVideoElement>(null);
  
    /** Инициализация потока камеры/микрофона */
    useEffect(() => {
      let activeStream: MediaStream;
  
      const initStream = async () => {
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setStream(activeStream);
        } catch (err) {
          console.error('Error getting stream:', err);
        }
      };
      initStream();
  
      // Очищаем, когда компонент размонтируется
      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach((track) => track.stop());
        }
      };
    }, []);
  
    /** Привязываем поток к видео */
    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);
  
    /** Запускаем запись */
    const startRecording = () => {
      if (!stream) return;
      const recorder = new MediaRecorder(stream);
  
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
  
      // Каждую секунду готовим кусок
      recorder.start(1000);
      setMediaRecorder(recorder);
      setRecording(true);
    };
  
    /** Запускаем запись сразу, как только появится поток */
    useEffect(() => {
      if (stream && !recording) {
        startRecording();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stream]);
  
    /** Остановка записи */
    const stopRecording = (): Promise<void> => {
      return new Promise((resolve) => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.onstop = () => resolve();
          mediaRecorder.stop();
          setRecording(false);
        } else {
          resolve();
        }
      });
    };
  
    /** Обработка ответа (кнопка "Complete"), загрузка видео и переход */
    const handleSendAnswer = async () => {
      setIsLoading(true); // Set local loader on button click
  
      if (recording && mediaRecorder) {
        await stopRecording();
      }
  
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      if (blob.size === 0) {
        alert('No recorded data found. Please allow camera & mic.');
        console.error('Empty blob, no recorded data.');
        setIsLoading(false);
        return;
      }
  
      // Формируем FormData и отправляем на /api/upload
      const formData = new FormData();
      formData.append('file', blob, `question_${currentQuestionIndex + 1}.webm`);
  
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await response.json();
        console.log('Upload response:', uploadData);
  
        let videoUrl = '';
        if (uploadData?.result?.secure_url) {
          videoUrl = uploadData.result.secure_url;
        } else {
          console.error('Error uploading video:', uploadData);
          setIsLoading(false);
          return;
        }
  
        // Чистим предыдущие chunks
        setRecordedChunks([]);
  
        // Последний вопрос? Тогда финализируем
        if (currentQuestionIndex >= questions.length - 1) {
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
          setIsProcessing(true);
  
          // Тут транскрибируем, анализируем, генерируем PDF
          await finalizeInterview(videoUrl);
  
          setIsProcessing(false);
          router.push('/thanks');
        } else {
          // Переходим к следующему вопросу
          setCurrentQuestionIndex((prev) => prev + 1);
  
          // Начинаем запись заново для следующего вопроса
          startRecording();
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Failed to upload video. Check console for details.');
      }
      setIsLoading(false);
    };
  
    /** Финальная функция: транскрипция, анализ, PDF */
    async function finalizeInterview(videoUrl: string) {
      try {
        // 1. Транскрипция
        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl }),
        });
        const transcribeData = await transcribeResponse.json();
        const transcript = transcribeData.text;
        if (!transcript) {
          console.error('No transcription received:', transcribeData);
          return;
        }
  
        // 2. Анализ
        const analyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript }),
        });
        const analyzeData = await analyzeResponse.json();
        const analysis = analyzeData?.choices?.[0]?.message?.content || 'No analysis';
  
        // Сохраняем в localStorage: уровень и текст анализа
        const level = 'Senior Designer'; // Пример, можно вычислить/парсить из analysis
        localStorage.setItem('finalAnalysis', JSON.stringify({
          level,
          description: analysis,
        }));
  
        // 3. Генерация PDF (если нужно)
        const pdfResponse = await fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysis }),
        });
        const pdfData = await pdfResponse.json();
        if (!pdfData.pdf) {
          console.error('PDF generation error:', pdfData);
          return;
        }
        console.log('PDF generated successfully');
      } catch (error) {
        console.error('Error finalizing interview:', error);
      }
    }
  
    const currentQuestion = questions[currentQuestionIndex];
  
    return (
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-xl m-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-gray-700 mt-2">{currentQuestion}</p>
        </div>
  
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Видео поток */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full sm:w-1/2 h-auto rounded-md shadow-md border border-gray-200"
          />
  
          {/* Кнопка */}
          <div className="flex-1 flex flex-col items-center">
            <button
              onClick={handleSendAnswer}
              disabled={isLoading}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors duration-300 font-medium flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Complete"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }