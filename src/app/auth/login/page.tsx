import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log In - HireFlick',
  description: 'Log in to your HireFlick account',
};

export default function LoginPage() {
  return <LoginForm />;
}