import { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account - HireFlick',
  description: 'Create your HireFlick account',
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}