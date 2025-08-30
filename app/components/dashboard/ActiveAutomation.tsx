import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Cog } from "lucide-react";

/**
 * ActiveAutomation Component
 * 
 * Displays the currently active prompt in a card with a spinning cog icon.
 * This component is part of the dashboard and shows the user what prompt
 * is currently being used for automation.
 * 
 * @param {string | null} activePrompt - The current active prompt text or null if none is set
 */
interface ActiveAutomationProps {
  activePrompt: string | null;
}

export function ActiveAutomation({ activePrompt }: ActiveAutomationProps) {
  return (
    <Card className="bg-slate-900/40 border-slate-600/30 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-slate-300 text-sm flex items-center gap-2 font-mono">
          <Cog className="w-4 h-4 animate-spin" />
          ACTIVE AUTOMATION
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="bg-slate-950/50 p-3 rounded border border-slate-700/50">
          <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 font-mono">{activePrompt}</p>
        </div>
      </CardContent>
    </Card>
  );
}