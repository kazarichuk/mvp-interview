"use client";

// src/components/auth/ForgotPasswordForm.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/firebase/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setErrorMessage('');

    const { error } = await resetPassword(email);
    
    if (error) {
      setIsError(true);
      // Улучшаем UX Writing для ошибок
      if (error.includes('user-not-found')) {
        setErrorMessage('No account found with this email address. Please check and try again.');
      } else if (error.includes('invalid-email')) {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(error);
      }
      setIsLoading(false);
      return;
    }

    // Показываем успех только если действительно email существует
    setIsSuccess(true);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you instructions to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isError && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {isSuccess && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                If an account exists with this email address, you'll receive password reset instructions shortly.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || isSuccess}
              className="bg-white"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isSuccess}
          >
            {isLoading ? 'Sending instructions...' : 'Send reset instructions'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <Link 
          href="/auth/login" 
          className="text-blue-600 hover:text-blue-800"
        >
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}