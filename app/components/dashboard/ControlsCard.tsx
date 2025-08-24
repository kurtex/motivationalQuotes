import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Eye, Play, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

/**
 * ControlsCard Component
 * 
 * Provides preview and execution controls for the automation system.
 * This component handles error states and displays appropriate messages to the user.
 * 
 * @param {function} onPreview - Function to generate a preview of the quote
 * @param {function} onExecute - Function to execute the automation and post a quote
 * @param {string | null} previewQuote - The preview quote text if available
 * @param {boolean} isPreviewing - Whether the preview is currently loading
 * @param {boolean} isExecuting - Whether the execution is currently in progress
 */
interface ControlsCardProps {
  onPreview: () => Promise<void>;
  onExecute: () => Promise<void>;
  previewQuote: string | null;
  isPreviewing: boolean;
  isExecuting: boolean;
}

export function ControlsCard({
  onPreview,
  onExecute,
  previewQuote,
  isPreviewing,
  isExecuting
}: ControlsCardProps) {
  const [error, setError] = useState<string | null>(null);
  
  const handlePreview = async () => {
    setError(null); // Clear previous errors
    try {
      await onPreview();
    } catch (err: any) {
      setError(err.message || "Failed to generate preview");
    }
  };
  
  const handleExecute = async () => {
    setError(null); // Clear previous errors
    try {
      await onExecute();
    } catch (err: any) {
      setError(err.message || "Failed to execute");
    }
  };
  return (
    <Card className="bg-slate-900/40 border-slate-600/30 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-slate-300 text-sm font-mono">CONTROLS</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2">
        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 py-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs text-red-300">{error}</AlertDescription>
          </Alert>
        )}
        
        <Button className="w-full bg-blue-600/60 hover:bg-blue-600/80 h-8 text-xs" size="sm"
          onClick={handlePreview}
          disabled={isPreviewing}
        >
          {isPreviewing ? "Previewing..." : <><Eye className="w-3 h-3 mr-2" />PREVIEW</>}
        </Button>
        {previewQuote && (
          <div className="bg-slate-950/50 p-3 rounded border border-slate-700/50 mt-2">
            <p className="text-slate-300 text-xs leading-relaxed font-mono">{previewQuote}</p>
          </div>
        )}
        <Button className="w-full bg-emerald-600/60 hover:bg-emerald-600/80 h-8 text-xs" size="sm"
          onClick={handleExecute}
          disabled={isExecuting}
        >
          {isExecuting ? "Executing..." : <><Play className="w-3 h-3 mr-2" />EXECUTE</>}
        </Button>
      </CardContent>
    </Card>
  );
}