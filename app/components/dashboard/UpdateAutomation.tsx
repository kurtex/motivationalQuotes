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
    <Card className="bg-slate-900/40 border-slate-600/30 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-slate-300 text-sm font-mono">UPDATE AUTOMATION</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-3">
        <Textarea
          placeholder="Enter new automation prompt..."
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          className="bg-slate-950/50 border-slate-700/50 text-white placeholder:text-slate-500 min-h-[80px] resize-none text-xs font-mono"
        />
        <Button
          className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 h-8 text-xs"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Deploying..." : "DEPLOY AUTOMATION"}
        </Button>
      </CardContent>
    </Card>
  );
}