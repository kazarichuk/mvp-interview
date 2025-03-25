import { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from '@/components/auth/SignupForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: 'Sign Up - HireFlick',
  description: 'Create your HireFlick account',
};

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignupForm />
    </Suspense>
  );
}