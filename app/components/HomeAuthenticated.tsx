"use client";

import { useState, useEffect } from "react";

// Importar componentes UI base
import { ActiveAutomation } from "./dashboard/ActiveAutomation";
import { UpdateAutomation } from "./dashboard/UpdateAutomation";
import { ScheduleCard } from "./dashboard/ScheduleCard";
import { ConfigCard } from "./dashboard/ConfigCard";
import { ControlsCard } from "./dashboard/ControlsCard";
import { StatusCard } from "./dashboard/StatusCard";
import { Header } from "./dashboard/Header";
import {
	updateAutomationPrompt,
	getActivePromptText,
	getScheduledPost as fetchScheduledPostApi,
	clearSchedule,
	saveScheduleConfig,
	requestPreview,
	executePrompt,
	logoutUser,
} from "@/app/lib/services/automationClient";


export default function SchedulerDashboard () {
  const [scheduleType, setScheduleType] = useState("daily");
  const [scheduleTime, setScheduleTime] = useState("11:35");
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [scheduledPost, setScheduledPost] = useState<any>(null); // TODO: Define a proper type for ScheduledPost
  const [isClearing, setIsClearing] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [previewQuote, setPreviewQuote] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

	const handleSubmitPrompt = async (prompt: string) => {
		try {
			const data = await updateAutomationPrompt(prompt);
			setActivePrompt(data.promptText);
			alert("Prompt updated successfully!");
		} catch (error) {
			console.error("Failed to update prompt:", error);
			alert("Failed to update prompt. Please try again.");
		}
	};

	const handleClearSchedule = async () => {
		setIsClearing(true);
		try {
			await clearSchedule();
			setScheduledPost(null); // Clear the scheduled post in UI
			alert("Schedule cleared successfully!");
			loadScheduledPost(); // Re-fetch to ensure UI consistency
		} catch (error) {
			console.error("Failed to clear schedule:", error);
			alert("Failed to clear schedule. Please try again.");
		} finally {
			setIsClearing(false);
		}
	};

	const handleSaveConfig = async () => {
		setIsSavingConfig(true);
		try {
			await saveScheduleConfig({
				scheduleType,
				timeOfDay: scheduleTime,
			});
			await loadScheduledPost();
			alert("Schedule saved successfully!");
		} catch (error: any) {
			console.error("Failed to save schedule:", error);
			if (error.message.includes("An overlapping schedule already exists.")) {
				alert("Failed to save schedule: An overlapping schedule already exists. Please clear the existing schedule first.");
      } else {
        alert("Failed to save schedule. Please try again.");
      }
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handlePreview = async () => {
    if (!activePrompt) {
      alert("Please set an active prompt first.");
      return;
    }
    setIsPreviewing(true);
	setPreviewQuote(""); // Clear previous preview
	try {
		const response = await requestPreview(activePrompt);
if (!response.body) {
			throw new Error("Response body is null.");
		}
		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        setPreviewQuote((prev) => prev + chunk);
      }

    } catch (error: any) {
      console.error("Failed to generate preview:", error);
      // No usamos alert aquí porque ahora el componente ControlsCard maneja los errores
      throw error; // Propagamos el error para que ControlsCard lo maneje
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleExecute = async () => {
    if (!activePrompt) {
      throw new Error("Please set an active prompt first.");
    }
    
	setIsExecuting(true);
	try {
		await executePrompt(activePrompt);
		alert("Quote posted successfully!");
		} catch (error: any) {
		console.error("Failed to post quote:", error);
      // No usamos alert aquí porque ahora el componente ControlsCard maneja los errores
      throw error; // Propagamos el error para que ControlsCard lo maneje
    } finally {
      setIsExecuting(false);
    }
  };

	const handleLogout = async () => {
	try {
		await logoutUser();
		alert("Logged out successfully!");
		window.location.href = "/"; // Redirect to home page after logout
	} catch (error) {
		console.error("Failed to log out:", error);
		alert("Failed to log out. Please try again.");
	}
};

	const loadScheduledPost = async () => {
	try {
		const data = await fetchScheduledPostApi();
		if (data.scheduledPost) {
			setScheduledPost(data.scheduledPost);
		} else {
			setScheduledPost(null);
		}
	} catch (error) {
		console.error("Failed to fetch scheduled post:", error);
	}
};

useEffect(() => {
	const fetchActivePrompt = async () => {
		try {
			const data = await getActivePromptText();
			setActivePrompt(data.promptText);
		} catch (error) {
			console.error("Failed to fetch active prompt:", error);
		}
	};

	fetchActivePrompt();
	loadScheduledPost();
}, []);

  return (
    <div className="min-h-screen p-3">
      <div className="max-w-6xl mx-auto space-y-4">
        <Header onLogout={handleLogout} isAutomated={!!scheduledPost} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <ActiveAutomation activePrompt={activePrompt} />
            <UpdateAutomation onSubmit={handleSubmitPrompt} />
          </div>

          <div className="space-y-4">
            <ScheduleCard 
              scheduledPost={scheduledPost} 
              onClearSchedule={handleClearSchedule} 
              isClearing={isClearing} 
            />
            <ConfigCard 
              scheduleType={scheduleType}
              scheduleTime={scheduleTime}
              onScheduleTypeChange={setScheduleType}
              onScheduleTimeChange={setScheduleTime}
              onSaveConfig={handleSaveConfig}
              isSavingConfig={isSavingConfig}
            />
          </div>

          <div className="space-y-4">
            <ControlsCard 
              onPreview={handlePreview}
              onExecute={handleExecute}
              previewQuote={previewQuote}
              isPreviewing={isPreviewing}
              isExecuting={isExecuting}
            />
            <StatusCard isOnline={!!scheduledPost} />
          </div>
        </div>
      </div>
    </div>
  );
}
