import {
	createThreadTextContainer,
	postThreadsTextContainer,
	getThreadsCookie,
} from "./actions";
import apiClient from "../apiClient";
import { getCookie } from "../../utils/cookies/actions";
import { EThreadsAuthEndpoints } from "../EThreadsEndpoints";

jest.mock("../apiClient");
jest.mock("../../utils/cookies/actions");

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedGetCookie = getCookie as jest.Mock;

describe("Threads Posts Actions", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("createThreadTextContainer", () => {
		it("should return container id on success", async () => {
			mockedApiClient.post.mockResolvedValueOnce({
				data: { id: "container123" },
			});
			const id = await createThreadTextContainer("hello", "token");
			expect(id).toBe("container123");
			expect(mockedApiClient.post).toHaveBeenCalledWith(
				EThreadsAuthEndpoints.NEW_TEXT_CONTAINER,
				null,
				expect.objectContaining({
					params: expect.objectContaining({
						text: "hello",
						access_token: "token",
					}),
				})
			);
		});

		it("should throw and log error on failure", async () => {
			const error = new Error("fail");
			mockedApiClient.post.mockRejectedValueOnce(error);
			await expect(createThreadTextContainer("fail", "token")).rejects.toThrow(
				"fail"
			);
		});
	});

	describe("postThreadsTextContainer", () => {
		it("should return true on success", async () => {
			mockedApiClient.post.mockResolvedValueOnce({});
			const result = await postThreadsTextContainer("container123", "token");
			expect(result).toBe(true);
			expect(mockedApiClient.post).toHaveBeenCalledWith(
				EThreadsAuthEndpoints.POST_TEXT_CONTAINER,
				null,
				expect.objectContaining({
					params: expect.objectContaining({
						creation_id: "container123",
						access_token: "token",
					}),
				})
			);
		});

		it("should throw and log error on failure", async () => {
			const error = new Error("fail");
			mockedApiClient.post.mockRejectedValueOnce(error);
			await expect(postThreadsTextContainer("fail", "token")).rejects.toThrow(
				"fail"
			);
		});
	});

	describe("getThreadsCookie", () => {
		it("should return access token if found", async () => {
			mockedGetCookie.mockResolvedValueOnce("token123");
			const token = await getThreadsCookie();
			expect(token).toBe("token123");
			expect(mockedGetCookie).toHaveBeenCalledWith("threads-token");
		});

		it("should throw error if token not found", async () => {
			mockedGetCookie.mockResolvedValueOnce(undefined);
			await expect(getThreadsCookie()).rejects.toThrow(
				"Access token is required"
			);
		});
	});
});
