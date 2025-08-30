import { Card, CardContent } from "@/app/components/ui/card";
import { Bot } from "lucide-react";

/**
 * StatusCard Component
 * 
 * Displays the current system status with a visual indicator.
 * Shows that the system is online and auto-posting is active.
 */
export function StatusCard() {
  return (
    <Card className="bg-slate-900/40 border-emerald-500/20 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto">
            <Bot className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-xs">
            <div className="text-emerald-300 font-mono">SYSTEM ONLINE</div>
            <div className="text-slate-500">Auto-posting active</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}