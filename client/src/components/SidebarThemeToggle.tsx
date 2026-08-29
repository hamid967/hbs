import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarThemeToggleProps {
  className?: string;
}

export function SidebarThemeToggle({ className = "" }: SidebarThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`w-full ${className}`}>
      {/* Expanded view: Compact segmented pill control */}
      <div className="group-data-[collapsible=icon]:hidden w-full">
        <div className="flex items-center justify-between gap-1 rounded-xl border border-white/10 bg-black/20 p-1 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setTheme("light")}
            aria-pressed={!isDark}
            aria-label="التبديل إلى الوضع النهاري"
            className={`pressable flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-bold transition-all ${
              !isDark
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Sun className={`size-3.5 ${!isDark ? "text-amber-400" : "text-slate-400"}`} />
            <span>نهاري</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            aria-pressed={isDark}
            aria-label="التبديل إلى الوضع الليلي"
            className={`pressable flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-bold transition-all ${
              isDark
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Moon className={`size-3.5 ${isDark ? "text-emerald-400" : "text-slate-400"}`} />
            <span>ليلي</span>
          </button>
        </div>
      </div>

      {/* Collapsed icon-rail view: Compact icon button with tooltip */}
      <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
              className="pressable flex size-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isDark ? (
                <Moon className="size-4 text-emerald-400" />
              ) : (
                <Sun className="size-4 text-amber-400" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs font-bold">
            {isDark ? "الوضع الحالي: ليلي (انقر للتبديل للنهاري)" : "الوضع الحالي: نهاري (انقر للتبديل لليلي)"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
