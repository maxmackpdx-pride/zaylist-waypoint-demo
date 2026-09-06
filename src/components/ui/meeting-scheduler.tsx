"use client";

import * as React from "react";
import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  setHours,
  setMinutes,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SHOW_HOURS = [12, 14, 16, 18, 20, 21, 22, 23, 0, 1, 2];

export interface MeetingSchedulerProps {
  title?: string;
  description?: string;
  scheduleButtonText?: string;
  cancelButtonText?: string;
  initialStartDate?: Date;
  initialEndDate?: Date;
  onSchedule: (details: { startDate: Date | null; endDate: Date | null; aiNotes: boolean }) => void;
  onCancel: () => void;
  now?: boolean;
  onNowChange?: (now: boolean) => void;
  forOptions?: { id: string; label: string }[];
  forValue?: string;
  onForChange?: (id: string) => void;
}

const formatTime = (date: Date | null) => (date ? format(date, "h:mm a") : "Select time");

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  title = "Show up",
  description = "When you hit the map. How long you stay.",
  scheduleButtonText = "Lock it",
  cancelButtonText = "Now",
  initialStartDate,
  initialEndDate,
  onSchedule,
  onCancel,
  now = false,
  onNowChange,
  forOptions,
  forValue,
  onForChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialStartDate || new Date()));
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [aiNotes, setAiNotes] = useState(now);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const handleDateClick = (day: Date) => {
    const next = startDate ? setMinutes(setHours(day, startDate.getHours()), startDate.getMinutes()) : setHours(day, 22);
    setStartDate(next);
    setEndDate(null);
    onNowChange?.(false);
    setAiNotes(false);
    onSchedule({ startDate: next, endDate: null, aiNotes: false });
  };

  const setHour = (hour: number) => {
    if (!startDate) {
      const next = setMinutes(setHours(new Date(), hour), 0);
      setStartDate(next);
      onSchedule({ startDate: next, endDate: null, aiNotes: false });
      return;
    }
    const next = setMinutes(setHours(startDate, hour), 0);
    setStartDate(next);
    onSchedule({ startDate: next, endDate: null, aiNotes: false });
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getEventSummary = () => {
    if (aiNotes || now) return "On the map now.";
    if (!startDate) return "Pick a night.";
    return `Show up ${format(startDate, "EEE MMM d")} · ${formatTime(startDate)}`;
  };

  const isNow = aiNotes || now;

  return (
    <Card className="dark-cal w-full overflow-hidden border-white/10 bg-black/70 text-white shadow-none backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <CardHeader className="flex flex-row items-start gap-3 p-4">
          <div className="rounded-full bg-[#ff2400]/15 p-2 text-[#ff2400]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-display text-xl font-black uppercase tracking-tight">{title}</CardTitle>
            <CardDescription className="text-white/55">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 p-4 pt-0 md:grid-cols-2">
          <div className={cn("flex flex-col", isNow && "pointer-events-none opacity-35")}>
            <div className="mb-3 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month" className="text-white hover:bg-white/10">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={format(currentMonth, "MMMM yyyy")}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="text-center font-display text-base font-bold uppercase tracking-wide"
                >
                  {format(currentMonth, "MMMM yyyy")}
                </motion.h3>
              </AnimatePresence>
              <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Next month" className="text-white hover:bg-white/10">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-7 text-center font-mono text-[10px] tracking-[0.14em] text-white/40">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isSelected = startDate && isSameDay(day, startDate);
                const isInRange = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate);
                return (
                  <motion.button
                    key={day.toString()}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                      !isSameMonth(day, currentMonth) && "text-white/25",
                      isSameDay(day, new Date()) && "font-bold text-[#ff2400]",
                      isSelected && "bg-[#ff2400] font-bold text-white",
                      isInRange && "rounded-none bg-[#ff2400]/20",
                    )}
                  >
                    {format(day, "d")}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
                <Label htmlFor="show-now" className="font-display text-sm font-black uppercase tracking-[0.16em]">
                  {isNow ? "Now" : "Later"}
                </Label>
                <Switch
                  id="show-now"
                  checked={isNow}
                  onCheckedChange={(checked) => {
                    setAiNotes(checked);
                    onNowChange?.(checked);
                    onSchedule({ startDate, endDate, aiNotes: checked });
                  }}
                  className="data-[state=checked]:bg-[#ff2400] data-[state=unchecked]:bg-white/20"
                />
              </div>

              <div>
                <Label className="font-mono text-[10px] tracking-[0.22em] text-white/70">SHOW UP</Label>
                <div className="mt-2 flex items-center rounded-md border border-white/10 bg-black/40 p-3">
                  <span className="flex-grow text-sm">
                    {isNow ? "Right now" : startDate ? format(startDate, "MMMM d, yyyy") : "Pick a date"}
                  </span>
                  <span className="rounded-md bg-[#ff2400]/15 px-3 py-1 text-sm font-medium text-[#ff2400]">
                    {isNow ? "LIVE" : formatTime(startDate)}
                  </span>
                </div>
                {!isNow ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {SHOW_HOURS.map((hour) => (
                      <button
                        key={hour}
                        type="button"
                        onClick={() => setHour(hour)}
                        className={cn(
                          "h-8 rounded-full px-2.5 font-mono text-[10px] tracking-wider",
                          startDate && startDate.getHours() === hour
                            ? "bg-[#ff2400] text-white border-transparent"
                            : "border border-white/25 bg-transparent text-white/70",
                        )}
                      >
                        {format(setHours(new Date(), hour), "h a")}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <Label className="font-mono text-[10px] tracking-[0.22em] text-white/70">FOR</Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(forOptions ?? []).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onForChange?.(item.id)}
                      className={cn(
                        "h-9 rounded-full px-3 font-display text-xs font-black tracking-[0.12em]",
                        forValue === item.id
                          ? "bg-[#ff2400] text-white border-transparent"
                          : "border border-white/25 bg-transparent text-white/70",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 text-sm text-white/55">{getEventSummary()}</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAiNotes(true);
                    onNowChange?.(true);
                    onCancel();
                  }}
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  {cancelButtonText}
                </Button>
                <Button
                  onClick={() => onSchedule({ startDate, endDate, aiNotes: isNow })}
                  disabled={!isNow && !startDate}
                  className="bg-[#ff2400] text-white hover:bg-[#ff2400]/90"
                >
                  {scheduleButtonText}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </motion.div>
    </Card>
  );
};