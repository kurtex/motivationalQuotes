import { NextRequest, NextResponse } from 'next/server';
import { getCookie, deleteCookie } from '@/app/lib/utils/cookies/actions';
import { deleteUserAndAssociatedData, getMetaUserIdByThreadsAccessToken } from '@/app/lib/database/actions';

export async function POST(req: NextRequest) {
  try {
    const threadsAccessToken = await getCookie('threads-token');
    if (!threadsAccessToken) {
      return NextResponse.json({ error: 'Unauthorized: No Threads token found' }, { status: 401 });
    }

    const metaUserId = await getMetaUserIdByThreadsAccessToken(threadsAccessToken);
    const result = await deleteUserAndAssociatedData(metaUserId);

    const response = NextResponse.json(result, { status: 200 });
    await deleteCookie('threads-token');

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
