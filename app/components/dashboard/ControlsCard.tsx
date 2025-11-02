import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Eye, Play, AlertCircle, SlidersHorizontal } from "lucide-react";
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
    <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-lg shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-slate-800 dark:text-slate-200 text-base flex items-center gap-3 font-sans">
          <SlidersHorizontal className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        {error && (
          <Alert variant="destructive" className="bg-rose-100/70 dark:bg-rose-900/30 border-rose-200 dark:border-rose-500/50 py-2 mb-3">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <AlertDescription className="text-xs text-rose-800 dark:text-rose-300">{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-sky-700 hover:from-blue-700 hover:to-sky-800 text-white font-bold h-11 text-sm tracking-wide uppercase rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          size="sm"
          onClick={handlePreview}
          disabled={isPreviewing}
        >
          {isPreviewing ? "Previewing..." : <><Eye className="w-4 h-4 mr-2" />Preview</>}
        </Button>
        {previewQuote && (
          <div className="bg-slate-100/70 dark:bg-slate-900/70 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mt-3">
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-mono">{previewQuote}</p>
          </div>
        )}
        <Button 
          className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold h-11 text-sm tracking-wide uppercase rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          size="sm"
          onClick={handleExecute}
          disabled={isExecuting}
        >
          {isExecuting ? "Executing..." : <><Play className="w-4 h-4 mr-2" />Execute Now</>}
        </Button>
      </CardContent>
    </Card>
  );
}