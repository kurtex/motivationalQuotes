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
    <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-sm rounded-lg p-3 border border-slate-600/30">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-slate-600 to-slate-500 text-white px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <Link href="/">{username}</Link>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-xs",
            isAutomated
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
              : "bg-slate-500/15 text-slate-300 border-slate-500/25"
          )}
        >
          <div className={cn(
            "w-1.5 h-1.5 rounded-full mr-1.5",
            isAutomated ? "bg-emerald-300" : "bg-slate-400"
          )}></div>
          {isAutomated ? "AUTOMATED" : "NOT AUTOMATED"}
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-300 h-8 px-2"
          asChild
        >
          <Link href="/threads/delete">
            <Trash2 className="w-3 h-3" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-300 h-8 px-2"
          asChild
        >
          <Link href="/privacy">
            <Shield className="w-3 h-3" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-300 h-8 px-2"
          onClick={onLogout}
        >
          <LogOut className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
