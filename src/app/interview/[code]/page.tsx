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

// API URL for Python backend
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
    // Check the validity of the interview link
    async function checkInvite() {
      try {
        setLoading(true);
        
        // Request interview information from Python API
        const response = await fetch(`${API_URL}/interview-info/${inviteCode}`, {
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'The interview link is invalid or has expired');
        }
        
        const data = await response.json();
        setInterviewInfo(data);
        
        // If candidate email already exists, fill it in
        if (!emailParam && data.candidate_email) {
          setEmail(data.candidate_email);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error checking invite:', err);
        setError(err.message || 'Error loading interview information');
        setLoading(false);
      }
    }
    
    checkInvite();
  }, [inviteCode, emailParam]);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем подключение к интернету
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      // Валидация данных
      if (!name.trim()) {
        throw new Error('Please enter your name');
      }
      
      if (!email.trim()) {
        throw new Error('Please enter your email');
      }
      
      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      console.log('Starting interview with data:', {
        name,
        email,
        position: interviewInfo?.position || 'UX/UI Designer',
        inviteCode
      });
      
      // Send candidate information to Python API
      const response = await fetch(`${API_URL}/start-interview/${inviteCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          position: interviewInfo?.position || 'UX/UI Designer'
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to start the interview');
      }
      
      // Get data to start the interview
      const data = await response.json();
      console.log('Interview started successfully:', data);
      
      // Проверяем статус сервера
      if (data.status === 'error') {
        throw new Error(data.message || 'Server error occurred');
      }
      
      // Проверяем статус перед редиректом
      if (data.status === 'active' || data.status === 'resumed') {
        console.log('Interview is active/resumed, saving candidate data and redirecting...');
        
        // Проверяем наличие вопроса
        const question = data.current_question || data.first_question;
        if (!question || question.trim() === '') {
          console.error('No valid question in response:', data);
          throw new Error('Interview question is missing. Please try again or contact support.');
        }
        
        // Сохраняем данные кандидата
        localStorage.setItem('candidateData', JSON.stringify({
          name,
          email,
          position: interviewInfo?.position || 'UX/UI Designer',
          timestamp: Date.now()
        }));
        
        // Добавляем небольшую задержку перед редиректом
        setTimeout(() => {
          window.location.href = `/interview/${inviteCode}/session`;
        }, 100);
      } else {
        console.error('Invalid interview status:', data.status);
        throw new Error('Interview failed to start properly');
      }
      
    } catch (err: any) {
      console.error('Error starting interview:', err);
      setError(err.message || 'Failed to start the interview');
      
      // Показываем уведомление об ошибке
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = err.message || 'Failed to start the interview';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Show error state
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
            <CardTitle className="text-red-600">Interview Error</CardTitle>
            <CardDescription>
              There was a problem with this interview link
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

  // If the interview is already active, show appropriate message
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
            <CardTitle>Interview Already Started</CardTitle>
            <CardDescription>
              This interview is already in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You can continue from where you left off.
            </p>
            
            <Button 
              className="w-full"
              onClick={() => window.location.href = `/interview/${inviteCode}/session`}
            >
              Continue Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If interview is completed, show message and redirect
  if (interviewInfo?.status === 'completed') {
    // Redirect to results page after 3 seconds
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
            <CardTitle>Interview Completed</CardTitle>
            <CardDescription>
              This interview has already been completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Redirecting you to the results page...
            </p>
            
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show form to start the interview
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
          <CardTitle>AI Interview for UX/UI Designers</CardTitle>
          <CardDescription>
            Complete this form to start your AI interview
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleStartInterview}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@company.com"
                disabled={true} // Always disabled to prevent editing
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 space-y-4">
              <p className="font-medium">Before you begin:</p>
              <div className="flex items-start space-x-2">
                <Mic className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Make sure you have access to a microphone and it's enabled</span>
              </div>
              <div className="flex items-start space-x-2">
                <Camera className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>For the best experience, a camera is recommended (optional)</span>
              </div>
              <p>The interview will take approximately 30-60 minutes. You have up to 5 minutes to answer each question.</p>
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
                  Preparing...
                </>
              ) : (
                'Start Interview'
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