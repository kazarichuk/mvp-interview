import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password - HireFlick',
  description: 'Reset your HireFlick account password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}