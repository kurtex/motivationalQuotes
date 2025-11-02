import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Cog, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/app/lib/utils/utils";

/**
 * ActiveAutomation Component
 * 
 * Displays the currently active prompt in a card. The prompt text is expandable.
 * 
 * @param {string | null} activePrompt - The current active prompt text or null if none is set
 */
interface ActiveAutomationProps {
  activePrompt: string | null;
}

export function ActiveAutomation ({ activePrompt }: ActiveAutomationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-lg shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3 pt-4 px-5 flex flex-row items-center justify-between">
        <CardTitle className="text-slate-800 dark:text-slate-200 text-base flex items-center gap-3 font-sans">
          <Cog className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
          Active Automation
        </CardTitle>
        <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs h-6">ACTIVE</Badge>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="bg-slate-100/70 dark:bg-slate-900/70 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className={cn(
            "text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-mono transition-all",
            !isExpanded && "line-clamp-3"
          )}>
            {activePrompt || "No active prompt set."}
          </p>
          {(activePrompt && activePrompt.length > 150) && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 h-auto p-0 mt-3 text-xs font-semibold"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" />
                  Show More
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
