import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/app/lib/middlewares/rate-limiter';

const limiter = rateLimiter({
  uniqueTokenPerInterval: 5,
  interval: 60000, // 1 minute
});

export async function middleware(req: NextRequest) {
  const res = limiter(req);
  if (res.status === 429) {
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/gemini-generate',
    '/api/threads/auth',
    '/api/post-now',
    '/api/delete-user',
  ],
};
