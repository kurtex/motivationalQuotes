import axios from "axios";

export const THREADS_BASE_URL = "https://graph.threads.net";

export default axios.create({
	baseURL: THREADS_BASE_URL,
});
