import { POST } from "../route";
import { validateSignedRequest } from "@/app/lib/meta/security";
import { deleteUserAndAssociatedData } from "@/app/lib/database/actions";

// Mock Next.js server environment
jest.mock("next/server", () => ({
	NextResponse: {
		json: jest.fn((data, init) => ({
			json: () => Promise.resolve(data),
			status: init?.status || 200,
		})),
	},
}));

// Mock dependencies
jest.mock("@/app/lib/meta/security", () => ({
	validateSignedRequest: jest.fn(),
}));

jest.mock("@/app/lib/database/actions", () => ({
	deleteUserAndAssociatedData: jest.fn(),
}));

const mockValidateSignedRequest = validateSignedRequest as jest.Mock;
const mockDeleteUserAndAssociatedData =
	deleteUserAndAssociatedData as jest.Mock;

describe("POST /api/meta/data-deletion-callback", () => {
	let originalAppSecret: string | undefined;

	beforeAll(() => {
		originalAppSecret = process.env.CLIENT_SECRET;
	});

	afterAll(() => {
		process.env.CLIENT_SECRET = originalAppSecret;
	});

	beforeEach(() => {
		jest.clearAllMocks();
		process.env.CLIENT_SECRET = "test-secret";
	});

	it("should handle a valid data deletion request successfully", async () => {
		const mockUserId = "user-123";
		const mockSignedRequest = "valid_signature.payload";

		mockValidateSignedRequest.mockReturnValue({ user_id: mockUserId });
		mockDeleteUserAndAssociatedData.mockResolvedValue({ success: true });

		const formData = new FormData();
		formData.append("signed_request", mockSignedRequest);

		const request = {
			formData: async () => formData,
		} as any;

		const response = await POST(request);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.status).toBe("success");
		expect(body.confirmation_code).toMatch(
			new RegExp(`^${mockUserId}_deleted_`)
		);
		expect(mockValidateSignedRequest).toHaveBeenCalledWith(
			mockSignedRequest,
			"test-secret"
		);
		expect(mockDeleteUserAndAssociatedData).toHaveBeenCalledWith(mockUserId);
	});

	it("should return 400 if signed_request is missing", async () => {
		const formData = new FormData(); // Empty form data
		const request = {
			formData: async () => formData,
		} as any;

		const response = await POST(request);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.error).toBe("Missing signed_request");
	});

	it("should return 500 if CLIENT_SECRET is not set", async () => {
		delete process.env.CLIENT_SECRET;

		const formData = new FormData();
		formData.append("signed_request", "any_request");

		const request = {
			formData: async () => formData,
		} as any;

		const response = await POST(request);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body.error).toBe("Internal server configuration error.");
	});

	it("should return 401 if signed_request is invalid", async () => {
		const mockSignedRequest = "invalid_signature.payload";
		mockValidateSignedRequest.mockImplementation(() => {
			throw new Error("Invalid signature");
		});

		const formData = new FormData();
		formData.append("signed_request", mockSignedRequest);

		const request = {
			formData: async () => formData,
		} as any;

		const response = await POST(request);
		const body = await response.json();

		expect(response.status).toBe(401);
		expect(body.error).toBe("Invalid signed_request");
	});

	it("should return 500 if data deletion fails", async () => {
		const mockUserId = "user-123";
		const mockSignedRequest = "valid_signature.payload";

		mockValidateSignedRequest.mockReturnValue({ user_id: mockUserId });
		mockDeleteUserAndAssociatedData.mockImplementation(() => {
			throw new Error("Database connection failed");
		});

		const formData = new FormData();
		formData.append("signed_request", mockSignedRequest);

		const request = {
			formData: async () => formData,
		} as any;

		const response = await POST(request);
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body.error).toBe("Failed to process request");
	});
});
