import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

/**
 * ConfigCard Component
 * 
 * Provides a form for configuring the schedule settings for automated posts.
 * Users can select the schedule type (daily, weekly, monthly) and set the time.
 * 
 * @param {string} scheduleType - The current schedule type (daily, weekly, monthly)
 * @param {string} scheduleTime - The current schedule time in HH:MM format
 * @param {function} onScheduleTypeChange - Handler for schedule type changes
 * @param {function} onScheduleTimeChange - Handler for schedule time changes
 * @param {function} onSaveConfig - Function to save the configuration
 * @param {boolean} isSavingConfig - Whether the configuration is currently being saved
 */
interface ConfigCardProps {
  scheduleType: string;
  scheduleTime: string;
  onScheduleTypeChange: (value: string) => void;
  onScheduleTimeChange: (value: string) => void;
  onSaveConfig: () => Promise<void>;
  isSavingConfig: boolean;
}

export function ConfigCard({
  scheduleType,
  scheduleTime,
  onScheduleTypeChange,
  onScheduleTimeChange,
  onSaveConfig,
  isSavingConfig
}: ConfigCardProps) {
  return (
    <Card className="bg-slate-900/40 border-slate-600/30 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-slate-300 text-sm font-mono">CONFIG</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-3">
        <div className="space-y-2">
          <Select value={scheduleType} onValueChange={onScheduleTypeChange}>
            <SelectTrigger className="bg-slate-950/50 border-slate-700/50 text-white h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="time"
            value={scheduleTime}
            onChange={(e) => onScheduleTimeChange(e.target.value)}
            className="bg-slate-950/50 border-slate-700/50 text-white h-8 text-xs font-mono"
          />
        </div>
        <Button
          className="w-full bg-gradient-to-r from-violet-600/80 to-indigo-600/80 hover:from-violet-500/80 hover:to-indigo-500/80 h-7 text-xs"
          onClick={onSaveConfig}
          disabled={isSavingConfig}
        >
          {isSavingConfig ? "Saving..." : "SAVE CONFIG"}
        </Button>
      </CardContent>
    </Card>
  );
}