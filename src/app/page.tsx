import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/auth/login');
}

export const metadata = {
  title: 'HireFlick',
  description: 'Redirecting to login...'
};