"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from 'next/image';
import { Mic, Camera, Loader2 } from 'lucide-react';

// API URL для Python-бэкенда
const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

export default function InterviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const inviteCode = params.code as string;
  const emailParam = searchParams.get('email');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [interviewInfo, setInterviewInfo] = useState<any>(null);

  useEffect(() => {
    // Проверяем валидность ссылки интервью
    async function checkInvite() {
      try {
        setLoading(true);
        
        // Запрашиваем информацию об интервью из Python API
        const response = await fetch(`${API_URL}/interview-info/${inviteCode}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Ссылка на интервью недействительна или истекла');
        }
        
        const data = await response.json();
        setInterviewInfo(data);
        
        // Если email кандидата уже есть, заполняем его
        if (!emailParam && data.candidate_email) {
          setEmail(data.candidate_email);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error checking invite:', err);
        setError(err.message || 'Ошибка при загрузке информации об интервью');
        setLoading(false);
      }
    }
    
    checkInvite();
  }, [inviteCode, emailParam]);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Отправляем информацию о кандидате в Python API
      const response = await fetch(`${API_URL}/start-interview/${inviteCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          position: interviewInfo?.position || 'UX/UI Designer'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось начать интервью');
      }
      
      // Получаем данные для начала интервью
      const data = await response.json();
      
      // Переходим на страницу интервью
      window.location.href = `/interview/${inviteCode}/session`;
      
    } catch (err: any) {
      console.error('Error starting interview:', err);
      setError(err.message || 'Не удалось начать интервью');
      setLoading(false);
    }
  };

  // Показываем загрузку
  if (loading) {
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
  if (error) {
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
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Ошибка интервью</CardTitle>
            <CardDescription>
              Возникла проблема с этой ссылкой на интервью
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Если интервью уже начато, показываем соответствующее сообщение
  if (interviewInfo?.status === 'active') {
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
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Интервью уже начато</CardTitle>
            <CardDescription>
              Это интервью уже в процессе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Вы можете продолжить с того места, на котором остановились.
            </p>
            
            <Button 
              className="w-full"
              onClick={() => window.location.href = `/interview/${inviteCode}/session`}
            >
              Продолжить интервью
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Если интервью завершено, показываем сообщение и перенаправляем
  if (interviewInfo?.status === 'completed') {
    // Перенаправляем на страницу результатов через 3 секунды
    useEffect(() => {
      const timer = setTimeout(() => {
        window.location.href = `/interview/${inviteCode}/complete`;
      }, 3000);
      
      return () => clearTimeout(timer);
    }, [inviteCode]);
    
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
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Интервью завершено</CardTitle>
            <CardDescription>
              Это интервью уже завершено
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Перенаправляем вас на страницу результатов...
            </p>
            
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Показываем форму для начала интервью
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

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI-интервью для UX/UI дизайнеров</CardTitle>
          <CardDescription>
            Заполните эту форму, чтобы начать интервью с AI
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleStartInterview}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Полное имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Иван Иванов"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email адрес</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ivan@company.com"
                disabled={!!emailParam} // Отключаем если email передан в URL
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 space-y-4">
              <p className="font-medium">Перед началом:</p>
              <div className="flex items-start space-x-2">
                <Mic className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Убедитесь, что у вас есть доступ к микрофону и он включен</span>
              </div>
              <div className="flex items-start space-x-2">
                <Camera className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Для лучшего опыта рекомендуется использовать камеру (опционально)</span>
              </div>
              <p>Интервью займет примерно 30-60 минут. На каждый вопрос вам дается до 5 минут на ответ.</p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Подготовка...
                </>
              ) : (
                'Начать интервью'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="mt-6 text-sm text-gray-500">
        Powered by HireFlick • AI-Driven Recruitment Platform
      </p>
    </div>
  );
}