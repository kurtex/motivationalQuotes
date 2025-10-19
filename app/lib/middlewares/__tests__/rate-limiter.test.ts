import { NextRequest } from "next/server";
import { rateLimiter, cache } from "../rate-limiter";

// Mock NextRequest
const mockRequest = (ip: string, url: string) => {
	return {
		ip,
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

	it("should allow requests within the limit", async () => {
		const limiter = rateLimiter({
			uniqueTokenPerInterval: 5,
			interval: 60000,
		});

		for (let i = 0; i < 5; i++) {
			const req = mockRequest("127.0.0.1", "/api/test");
			const res = limiter(req);
			expect(res.status).not.toBe(429);
		}
	});

	it("should block requests that exceed the limit", async () => {
		const limiter = rateLimiter({
			uniqueTokenPerInterval: 2,
			interval: 60000,
		});

		const req = mockRequest("127.0.0.1", "/api/test");

		// First two requests should be allowed
		let res = limiter(req);
		expect(res.status).not.toBe(429);
		res = limiter(req);
		expect(res.status).not.toBe(429);

		// Third request should be blocked
		res = limiter(req);
		expect(res.status).toBe(429);
	});

	it("should reset the count after the interval", async () => {
		const limiter = rateLimiter({
			uniqueTokenPerInterval: 1,
			interval: 1000, // 1 second
		});

		const req = mockRequest("127.0.0.1", "/api/test");

		// First request should be allowed
		let res = limiter(req);
		expect(res.status).not.toBe(429);

		// Second request should be blocked
		res = limiter(req);
		expect(res.status).toBe(429);

		// Wait for the interval to pass
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Third request should be allowed again
		res = limiter(req);
		expect(res.status).not.toBe(429);
	});
});
