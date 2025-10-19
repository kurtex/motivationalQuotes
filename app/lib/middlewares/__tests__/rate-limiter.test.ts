import { NextRequest } from "next/server";
import { rateLimiter, cache } from "../rate-limiter";

// Mock NextRequest
const mockRequest = (ip: string, url: string) => {
	// The actual NextRequest object is complex, so we mock only what we need.
	return {
		headers: new Headers({
			'x-forwarded-for': ip,
		}),
		nextUrl: {
			pathname: url,
		},
	} as NextRequest;
};

describe("rateLimiter", () => {
	beforeEach(() => {
		// Clear the cache before each test
		cache.clear();
	});

	it("should allow requests within the limit", () => {
		const limiter = rateLimiter({
			uniqueTokenPerInterval: 5,
			interval: 60000,
		});

		for (let i = 0; i < 5; i++) {
			const req = mockRequest("127.0.0.1", "/api/test");
			const res = limiter(req);
			expect(res).toBeUndefined();
		}
	});

	it("should block requests that exceed the limit", () => {
		const limiter = rateLimiter({
			uniqueTokenPerInterval: 2,
			interval: 60000,
		});

		const req = mockRequest("127.0.0.1", "/api/test");

		// First two requests should be allowed (return undefined)
		expect(limiter(req)).toBeUndefined();
		expect(limiter(req)).toBeUndefined();

		// Third request should be blocked
		const res = limiter(req);
		expect(res).toBeDefined();
		expect(res?.status).toBe(429);
	});

	it("should reset the count after the interval", async () => {
		const limiter = rateLimiter({
			uniqueTokenPerInterval: 1,
			interval: 1000, // 1 second
		});

		const req = mockRequest("127.0.0.1", "/api/test");

		// First request should be allowed
		expect(limiter(req)).toBeUndefined();

		// Second request should be blocked
		const res = limiter(req);
		expect(res).toBeDefined();
		expect(res?.status).toBe(429);

		// Wait for the interval to pass
		await new Promise((resolve) => setTimeout(resolve, 1100)); // Wait a bit longer than the interval

		// Third request should be allowed again
		expect(limiter(req)).toBeUndefined();
	});
});
