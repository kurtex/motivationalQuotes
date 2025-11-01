import type { Metadata } from 'next';
import DataDeletionClientPage from './DataDeletionClientPage';
import { getCookie } from '@/app/lib/utils/cookies/actions';
import { getThreadsUsername } from '@/app/lib/threads-api/user-data/actions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Data Deletion Instructions',
  description: 'How to request the deletion of your data from our application.',
};

export default async function DataDeletionPage() {
  const access_token = await getCookie("threads-token");
  if (!access_token) {
    redirect('/');
  }

  const username = await getThreadsUsername(access_token);

  return <DataDeletionClientPage username={username} />;
}
