import type { SerializedScheduledPost } from "../types/schedule";

export async function updateAutomationPrompt(prompt: string) {
  const response = await fetch("/api/gemini-generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorMessage = response.statusText || "Failed to update prompt";
    throw new Error(`Error: ${errorMessage}`);
  }

  return response.json() as Promise<{ promptText: string }>;
}

export async function getActivePromptText() {
  const response = await fetch("/api/gemini-generate/get-active-prompt");
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
  return response.json() as Promise<{ promptText: string | null }>;
}

export async function getScheduledPost() {
  const response = await fetch("/api/get-scheduled-post");
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
  return response.json() as Promise<{ scheduledPost?: SerializedScheduledPost }>;
}

export async function clearSchedule() {
  const response = await fetch("/api/clear-schedule", {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
}

export async function reactivateSchedule() {
  const response = await fetch("/api/reactivate-schedule", {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || response.statusText || "Failed to reactivate schedule";
    throw new Error(message);
  }

  return response.json() as Promise<{ nextScheduledAt: string }>;
}

interface SaveSchedulePayload {
  scheduleType: string;
  timeOfDay: string;
  intervalValue?: number;
  intervalUnit?: string;
  timeZoneId: string;
}

export async function saveScheduleConfig(payload: SaveSchedulePayload) {
  const response = await fetch("/api/schedule-post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || response.statusText || "Failed to save schedule";
    throw new Error(message);
  }

  return response.json();
}

export async function requestPreview(prompt: string) {
  const response = await fetch("/api/gemini-generate/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("Response body is empty.");
  }

  return response;
}

export async function executePrompt(prompt: string) {
  const response = await fetch("/api/post-now", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }
}

export async function logoutUser() {
	const response = await fetch("/api/auth/logout", {
		method: "GET",
	});

	if (!response.ok) {
		throw new Error("Failed to logout");
	}
}

export async function deleteUser() {
	const response = await fetch("/api/delete-user", {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error("Failed to delete user data");
	}

	document.cookie = "threads-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
