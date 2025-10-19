import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
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
    <Card className="bg-slate-900/40 border-slate-600/30 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-slate-300 text-sm flex items-center gap-2 font-mono">
          <Cog className="w-4 h-4 animate-spin" />
          ACTIVE AUTOMATION
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="bg-slate-950/50 p-3 rounded border border-slate-700/50">
          <p className={cn(
            "text-slate-300 text-xs leading-relaxed font-mono transition-all",
            !isExpanded && "line-clamp-3"
          )}>
            {activePrompt || "No active prompt set."}
          </p>
          {(activePrompt && activePrompt.length > 100) && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-200 h-auto p-0 mt-2 text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show more
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
