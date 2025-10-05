import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Timer } from "lucide-react";
import type { SerializedScheduledPost } from "@/app/lib/types/schedule";

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
  scheduledPost: SerializedScheduledPost | null;
  onClearSchedule: () => Promise<void>;
  onReactivateSchedule: () => Promise<void>;
  isClearing: boolean;
  isReactivating: boolean;
}

export function ScheduleCard ({
  scheduledPost,
  onClearSchedule,
  onReactivateSchedule,
  isClearing,
  isReactivating,
}: ScheduleCardProps) {
  const effectiveTimeZone = scheduledPost?.timeZoneId ?? "UTC";
  const nextScheduledLocal = scheduledPost
    ? new Intl.DateTimeFormat(undefined, {
      timeZone: effectiveTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(scheduledPost.nextScheduledAt))
    : null;
  const statusColor = scheduledPost
    ? scheduledPost.status === "error"
      ? "text-red-400"
      : scheduledPost.status === "paused"
        ? "text-amber-300"
        : "text-emerald-300"
    : "text-slate-300";

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
              <span className="text-slate-300">TIME ({effectiveTimeZone}):</span>
              <span className="text-slate-300 font-mono">{scheduledPost.timeOfDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">NEXT:</span>
              <span className="text-white text-xs">
                {nextScheduledLocal}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">STATUS:</span>
              <span className={`${statusColor} text-xs font-medium uppercase`}>
                {scheduledPost.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-xs text-center py-3">
            No schedule currently set.
          </div>
        )}
        <Separator className="bg-slate-700/50" />
        {scheduledPost?.status === "error" && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={onReactivateSchedule}
            disabled={isReactivating}
          >
            {isReactivating ? "Reactivating..." : "REACTIVATE"}
          </Button>
        )}
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
