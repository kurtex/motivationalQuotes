import type { Metadata } from 'next';
import PrivacyPolicyClientPage from './PrivacyPolicyClientPage';
import { getCookie } from '@/app/lib/utils/cookies/actions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for the motivational quote generation application.',
};

export default async function PrivacyPolicyPage() {
  const access_token = await getCookie("threads-token");
  if (!access_token) {
    redirect('/');
  }

  return <PrivacyPolicyClientPage />;
}
