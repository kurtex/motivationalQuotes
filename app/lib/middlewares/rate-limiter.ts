import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

type RateLimiterOptions = {
	uniqueTokenPerInterval: number;
	interval: number;
};

export const cache = new LRUCache<string, number>({
	max: 500,
});

export const rateLimiter = (options: RateLimiterOptions) => {
	return (req: NextRequest) => {
    const ip = req.headers?.get('x-forwarded-for') ?? '127.0.0.1';
		const route = req.nextUrl.pathname;

		const rateLimiterKey = `${route}:${ip}`;
		const tokenCount = cache.get(rateLimiterKey) ?? 0;

		if (tokenCount >= options.uniqueTokenPerInterval) {
			return new NextResponse("Too Many Requests", { status: 429 });
		}

		cache.set(rateLimiterKey, tokenCount + 1, { ttl: options.interval });

		return new NextResponse(null, { status: 200 });
	};
};
