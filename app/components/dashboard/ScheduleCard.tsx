import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Timer } from "lucide-react";

/**
 * ScheduledPost Interface
 * 
 * Represents the structure of a scheduled post configuration.
 */
interface ScheduledPost {
  scheduleType: string;
  timeOfDay: string;
  nextScheduledAt: string;
}

/**
 * ScheduleCard Component
 * 
 * Displays information about the current schedule configuration and provides
 * a button to clear the schedule if one is set.
 * 
 * @param {ScheduledPost | null} scheduledPost - The current schedule configuration or null if none exists
 * @param {function} onClearSchedule - Function to clear the current schedule
 * @param {boolean} isClearing - Whether the schedule clearing is in progress
 */
interface ScheduleCardProps {
  scheduledPost: ScheduledPost | null;
  onClearSchedule: () => Promise<void>;
  isClearing: boolean;
}

export function ScheduleCard({ scheduledPost, onClearSchedule, isClearing }: ScheduleCardProps) {
  return (
    <Card className="bg-slate-900/40 border-slate-600/30 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-slate-300 text-sm flex items-center gap-2 font-mono">
          <Timer className="w-4 h-4" />
          SCHEDULE
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2">
        {scheduledPost ? (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">MODE:</span>
              <Badge variant="outline" className="border-slate-500/40 text-slate-300 text-xs h-5 uppercase">
                {scheduledPost.scheduleType}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">TIME:</span>
              <span className="text-slate-300 font-mono">{scheduledPost.timeOfDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">NEXT:</span>
              <span className="text-white text-xs">
                {new Date(scheduledPost.nextScheduledAt).toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-xs text-center py-3">
            No schedule currently set.
          </div>
        )}
        <Separator className="bg-slate-700/50" />
        <Button
          variant="destructive"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={onClearSchedule}
          disabled={isClearing || !scheduledPost}
        >
          {isClearing ? "Clearing..." : "CLEAR"}
        </Button>
      </CardContent>
    </Card>
  );
}