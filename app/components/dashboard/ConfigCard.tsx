"use client";

import { Settings } from "lucide-react";
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
  timeZoneId: string;
  onScheduleTypeChange: (value: string) => void;
  onScheduleTimeChange: (value: string) => void;
  onSaveConfig: () => Promise<void>;
  isSavingConfig: boolean;
}

export function ConfigCard ({
  scheduleType,
  scheduleTime,
  timeZoneId,
  onScheduleTypeChange,
  onScheduleTimeChange,
  onSaveConfig,
  isSavingConfig
}: ConfigCardProps) {
  return (
    <Card className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-lg shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-slate-800 dark:text-slate-200 text-base flex items-center gap-3 font-sans">
          <Settings className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-4">
        <div className="space-y-3">
          <Select value={scheduleType} onValueChange={onScheduleTypeChange}>
            <SelectTrigger className="bg-slate-100/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 h-11 text-sm rounded-lg focus:border-amber-500 focus:ring-amber-500/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="time"
            value={scheduleTime}
            onChange={(e) => onScheduleTimeChange(e.target.value)}
            className="bg-slate-100/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 h-11 text-sm font-mono rounded-lg focus:border-amber-500 focus:ring-amber-500/50"
          />
        </div>
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold h-12 text-sm tracking-wide uppercase rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          onClick={onSaveConfig}
          disabled={isSavingConfig}
        >
          {isSavingConfig ? "Saving..." : "Save Configuration"}
        </Button>
      </CardContent>
    </Card>
  );
}
