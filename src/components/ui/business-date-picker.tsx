"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { isBusinessDay, isHoliday, isWeekend, getHolidayName, countBusinessDays } from "@/lib/holidays";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import "react-day-picker/style.css";

interface BusinessDatePickerProps {
  value?: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  error?: boolean;
}

export function BusinessDatePicker({
  value,
  onChange,
  id,
  placeholder = "Select a date",
  className,
  minDate,
  error = false,
}: BusinessDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + "T00:00:00") : undefined;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleDayClick = (day: Date) => {
    if (!isBusinessDay(day)) return;
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  };

  const formatDisplay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Disable weekends and holidays
  const disabledMatcher = (date: Date) => {
    if (isWeekend(date)) return true;
    if (isHoliday(date)) return true;
    if (minDate && date < minDate) return true;
    return false;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border bg-transparent px-3 py-2 text-sm transition-colors outline-none",
          "focus:border-ring focus:ring-3 focus:ring-ring/50",
          error ? "border-destructive" : "border-slate-200",
          !value && "text-muted-foreground",
          className
        )}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-lg animate-in fade-in-0 zoom-in-95">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(day) => day && handleDayClick(day)}
            disabled={disabledMatcher}
            modifiers={{
              holiday: (date) => isHoliday(date),
              weekend: (date) => isWeekend(date),
            }}
            modifiersClassNames={{
              holiday: "rdp-holiday",
              weekend: "rdp-weekend",
            }}
            showOutsideDays={false}
            fixedWeeks={false}
            classNames={{
              root: "rdp-business",
              months: "flex flex-col",
              month_caption: "flex justify-center pt-1 relative items-center mb-2",
              caption_label: "text-sm font-semibold text-[#0f172a]",
              nav: "flex items-center gap-1",
              button_previous: "absolute left-1 top-0 h-7 w-7 bg-transparent p-0 text-slate-500 hover:text-slate-900 inline-flex items-center justify-center rounded-md hover:bg-slate-100",
              button_next: "absolute right-1 top-0 h-7 w-7 bg-transparent p-0 text-slate-500 hover:text-slate-900 inline-flex items-center justify-center rounded-md hover:bg-slate-100",
              weekday: "text-muted-foreground text-[0.7rem] font-medium w-8 text-center",
              day_button: "h-8 w-8 text-center text-sm p-0 font-normal rounded-md transition-colors",
              selected: "bg-[#1e293b] text-white font-semibold rounded-md",
              today: "bg-slate-100 font-semibold",
              outside: "text-muted-foreground opacity-50",
              disabled: "text-slate-300 cursor-not-allowed line-through",
              hidden: "invisible",
            }}
            footer={
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200" />
                    Holiday
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
                    Weekend
                  </span>
                </div>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}

/**
 * Helper to display business day count between two selected dates
 */
export function BusinessDayCount({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  if (!startDate || !endDate) return null;

  const days = countBusinessDays(startDate, endDate);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
      <CalendarDays className="h-4 w-4 text-blue-600" />
      <span className="text-sm text-blue-700 font-medium">
        {days} business day{days !== 1 ? "s" : ""} (excluding weekends & holidays)
      </span>
    </div>
  );
}
