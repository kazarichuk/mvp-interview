"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Image from 'next/image';

// API URL для Python-бэкенда
const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

export default function InterviewCompletePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.code as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/interview-results/${sessionId}`, {
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          // Если интервью не завершено, перенаправляем на основную страницу
          if (response.status === 404) {
            router.replace(`/interview/${sessionId}`);
            return;
          }
          
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Не удалось загрузить результаты интервью');
        }
        
        const data = await response.json();
        
        // Проверяем статус
        if (data.status === 'in_progress') {
          // Интервью еще не завершено
          router.replace(`/interview/${sessionId}/session`);
          return;
        }
        
        setResults(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(err.message || 'Ошибка при загрузке результатов');
        setLoading(false);
      }
    }
    
    fetchResults();
  }, [sessionId, router]);
  
  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };
  
  // Форматирование оценки
  const formatScore = (score: number) => {
    return score.toFixed(1);
  };
  
  // Определение цвета оценки
  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Загрузка
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка результатов интервью...</p>
        </div>
      </div>
    );
  }
  
  // Ошибка
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
            <CardTitle className="text-red-600">Ошибка</CardTitle>
            <CardDescription>
              Не удалось загрузить результаты интервью
            </CardDescription>
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
  
  // Результаты
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white border-b py-4 px-4 md:px-6 mb-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Image
            src="/logo.svg"
            alt="HireFlick Logo"
            width={100}
            height={32}
            className="object-contain"
          />
          <span className="text-gray-500">Interview Results</span>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete</h1>
          <p className="text-gray-600">
            Thank you for completing your UX/UI designer interview.
          </p>
        </div>
        
        {/* Карточка с результатами */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Interview Assessment</CardTitle>
            <CardDescription>
              AI-powered analysis of your responses and skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Оценки */}
            <div>
              <h3 className="text-lg font-medium mb-4">Skills Assessment</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results?.scores && Object.entries(results.scores).map(([key, value]: [string, any]) => {
                  if (typeof value === 'number' && key !== 'overall_score') {
                    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return (
                      <div key={key} className="bg-white p-4 rounded-md shadow-sm border">
                        <div className="text-gray-600 text-sm mb-1">{formattedKey}</div>
                        <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                          {formatScore(value)}/10
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              
              {/* Общая оценка */}
              {results?.scores?.overall_score && (
                <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="text-center">
                    <div className="text-gray-700 mb-1">Overall Score</div>
                    <div className={`text-3xl font-bold ${getScoreColor(results.scores.overall_score)}`}>
                      {formatScore(results.scores.overall_score)}/10
                    </div>
                    
                    {results?.scores?.experience_level && (
                      <div className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                        {results.scores.experience_level.charAt(0).toUpperCase() + results.scores.experience_level.slice(1)} Level
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Полный отчет */}
            {results?.evaluation && (
              <div>
                <h3 className="text-lg font-medium mb-2">Detailed Evaluation</h3>
                
                <div className="bg-white p-4 rounded-md shadow-sm border">
                  <button
                    className="flex justify-between items-center w-full text-left"
                    onClick={() => toggleSection('evaluation')}
                  >
                    <span className="font-medium">View Full Evaluation Report</span>
                    {expandedSections.includes('evaluation') ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.includes('evaluation') && (
                    <div className="mt-4 pt-4 border-t text-gray-700 whitespace-pre-wrap">
                      {results.evaluation}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Сильные стороны и области для улучшения */}
            {results?.scores?.strengths && results?.scores?.areas_for_improvement && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <h3 className="font-medium text-green-800 mb-2">Key Strengths</h3>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    {results.scores.strengths.map((strength: string, index: number) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                  <h3 className="font-medium text-yellow-800 mb-2">Areas for Improvement</h3>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    {results.scores.areas_for_improvement.map((area: string, index: number) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Завершающая информация */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            This evaluation was generated by an AI-powered assessment system.
          </p>
          <p>
            © 2025 HireFlick • AI-Driven Recruitment Platform
          </p>
        </div>
      </main>
    </div>
  );
}