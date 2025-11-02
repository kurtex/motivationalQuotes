import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Clock } from "lucide-react";
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
    }).format(new Date(scheduledPost.nextScheduledAt))
    : null;

  const getStatusStyles = () => {
    if (!scheduledPost) return { badge: "bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-400", text: "text-slate-500 dark:text-slate-400" };
    switch (scheduledPost.status) {
      case "error":
        return { badge: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200 dark:border-rose-500/30", text: "text-rose-500 dark:text-rose-300" };
      case "paused":
        return { badge: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30", text: "text-amber-500 dark:text-amber-300" };
      default:
        return { badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30", text: "text-emerald-500 dark:text-emerald-300" };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-lg shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-slate-800 dark:text-slate-200 text-base flex items-center gap-3 font-sans">
          <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-4">
        {scheduledPost ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Mode:</span>
              <Badge variant="outline" className="border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-300 text-xs uppercase tracking-wider">
                {scheduledPost.scheduleType}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Time:</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono">{scheduledPost.timeOfDay} ({effectiveTimeZone})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Next Run:</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono text-xs">
                {nextScheduledLocal}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Status:</span>
              <Badge variant="outline" className={`${statusStyles.badge} text-xs uppercase tracking-wider`}>
                {scheduledPost.status}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 dark:text-slate-400 text-sm text-center py-6">
            No schedule is currently active.
          </div>
        )}
        <Separator className="bg-slate-200 dark:bg-slate-700/80" />
        <div className="space-y-2">
          {scheduledPost?.status === "error" && (
            <Button
              variant="outline"
              className="w-full border-amber-500/50 text-amber-600 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-200 h-10 text-xs tracking-wider"
              onClick={onReactivateSchedule}
              disabled={isReactivating}
            >
              {isReactivating ? "Reactivating..." : "Reactivate Schedule"}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full border-rose-500/50 text-rose-600 dark:text-rose-300 hover:bg-rose-100/50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-200 h-10 text-xs tracking-wider"
            onClick={onClearSchedule}
            disabled={isClearing || !scheduledPost}
          >
            {isClearing ? "Clearing..." : "Clear Schedule"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
