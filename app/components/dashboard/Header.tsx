import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Bot, LogOut, Trash2, HelpCircle, Shield } from "lucide-react";
import { cn } from "@/app/lib/utils/utils";
import Link from "next/link";

/**
 * Header Component
 * 
 * Displays the application header with the bot name, automation status badge,
 * and navigation controls (logout).
 * 
 * @param {function} onLogout - Function to handle user logout
 * @param {function} onDelete - Function to handle user data deletion
 * @param {boolean} isAutomated - Determines the automation status badge.
 */
interface HeaderProps {
  onLogout: () => Promise<void>;
  isAutomated: boolean;
  username: string;
}

export function Header ({ onLogout, isAutomated, username }: HeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white/50 dark:bg-slate-900/70 backdrop-blur-lg rounded-xl p-4 border border-slate-200 dark:border-slate-800/50 h-20">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-lg shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{username}</h1>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-mono tracking-wider",
              isAutomated
                ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25"
                : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/25"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full mr-2",
              isAutomated ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-slate-500 dark:bg-slate-500"
            )}></div>
            {isAutomated ? "AUTOMATED" : "NOT AUTOMATED"}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full"
          asChild
        >
          <Link href="/threads/delete">
            <Trash2 className="w-4 h-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full"
          asChild
        >
          <Link href="/privacy">
            <Shield className="w-4 h-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-full"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
