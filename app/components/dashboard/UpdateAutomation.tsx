import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";

/**
 * UpdateAutomation Component
 * 
 * Provides a form for users to update the automation prompt.
 * This component manages its own loading state and handles the submission process.
 * 
 * @param {function} onSubmit - Callback function that receives the new prompt text and processes it
 */
interface UpdateAutomationProps {
  onSubmit: (prompt: string) => Promise<void>;
}

export function UpdateAutomation({ onSubmit }: UpdateAutomationProps) {
  const [newPrompt, setNewPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPrompt.trim()) return;
    setIsLoading(true);
    try {
      await onSubmit(newPrompt);
      setNewPrompt(""); // Clear the textarea after successful submission
    } catch (error) {
      console.error("Failed to update prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-lg shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-slate-800 dark:text-slate-200 text-base flex items-center gap-3 font-sans">
          <UploadCloud className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          Update Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-4">
        <Textarea
          placeholder="Enter your new motivational prompt here. Be specific about the tone and topic..."
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          className="bg-slate-100/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-500 min-h-[100px] resize-none text-sm font-mono rounded-lg focus:border-amber-500 focus:ring-amber-500/50"
        />
        <Button
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold h-12 text-sm tracking-wide uppercase rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          onClick={handleSubmit}
          disabled={isLoading || !newPrompt.trim()}
        >
          {isLoading ? "Deploying..." : "Deploy New Prompt"}
        </Button>
      </CardContent>
    </Card>
  );
}