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
      "bg-slate-900/40 backdrop-blur-sm",
      isOnline ? "border-emerald-500/20" : "border-slate-600/30"
    )}>
      <CardContent className="p-4">
        <div className="text-center space-y-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center mx-auto",
            isOnline ? "bg-emerald-500/15" : "bg-slate-500/15"
          )}>
            <Bot className={cn(
              "w-4 h-4",
              isOnline ? "text-emerald-300" : "text-slate-400"
            )} />
          </div>
          <div className="text-xs">
            <div className={cn(
              "font-mono",
              isOnline ? "text-emerald-300" : "text-slate-400"
            )}>
              {isOnline ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
            </div>
            <div className="text-slate-500">
              {isOnline ? "Auto-posting active" : "Auto-posting disabled"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
