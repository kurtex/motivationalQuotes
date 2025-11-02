import { Card, CardContent } from "@/app/components/ui/card";
import { Bot } from "lucide-react";
import { cn } from "@/app/lib/utils/utils";

/**
 * StatusCard Component
 * 
 * Displays the current system status with a visual indicator.
 * Shows whether the system is online (auto-posting active) or offline.
 * 
 * @param {boolean} isOnline - Determines the status to display.
 */
interface StatusCardProps {
  isOnline: boolean;
}

export function StatusCard ({ isOnline }: StatusCardProps) {
  return (
    <Card className={cn(
      "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-lg shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1",
      isOnline ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-rose-500"
    )}>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isOnline ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-rose-100 dark:bg-rose-500/15"
          )}>
            <Bot className={cn(
              "w-6 h-6",
              isOnline ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"
            )} />
          </div>
          <div className="flex-1">
            <div className={cn(
              "font-bold text-lg tracking-wide",
              isOnline ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"
            )}>
              {isOnline ? "System Online" : "System Offline"}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">
              {isOnline ? "Automation is active and running." : "Automation is currently disabled."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
