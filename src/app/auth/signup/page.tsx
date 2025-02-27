import { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account - HireFlick',
  description: 'Create your HireFlick account',
};

export default function SignupPage() {
  return <SignupForm />;
}