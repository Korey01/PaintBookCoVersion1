import { useState, useMemo } from "react";
import { supabase, Job } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay,
  format, parseISO, isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";

interface Painter {
  id: string;
  available_from: string | null;
  available_to: string | null;
}

interface AvailabilityCalendarProps {
  painter: Painter;
  jobs: Job[];
  onSaved: (from: string, to: string) => void;
}

type DayType = "available" | "unavailable" | "job" | "default";

export default function AvailabilityCalendar({
  painter,
  jobs,
  onSaved,
}: AvailabilityCalendarProps) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(() => {
    if (!painter.available_from || !painter.available_to) return new Set();
    const from = parseISO(painter.available_from);
    const to   = parseISO(painter.available_to);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return new Set();
    return new Set(
      eachDayOfInterval({ start: from, end: to }).map((d) => format(d, "yyyy-MM-dd")),
    );
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  // Compute job-blocked dates
  const jobDates = useMemo(() => {
    const s = new Set<string>();
    for (const job of jobs) {
      if (
        (job.status === "escrow_funded" || job.status === "in_progress" || job.status === "painter_accepted") &&
        job.start_date && job.end_date
      ) {
        const days = eachDayOfInterval({
          start: parseISO(job.start_date),
          end:   parseISO(job.end_date),
        });
        days.forEach((d) => s.add(format(d, "yyyy-MM-dd")));
      }
    }
    return s;
  }, [jobs]);

  const days = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end   = endOfMonth(viewMonth);
    const allDays = eachDayOfInterval({ start, end });
    // Pad to start on Monday
    const startPad = (start.getDay() + 6) % 7; // 0=Mon
    const padded: (Date | null)[] = Array(startPad).fill(null);
    return [...padded, ...allDays];
  }, [viewMonth]);

  function toggleDate(d: Date) {
    const key = format(d, "yyyy-MM-dd");
    if (jobDates.has(key)) return; // cannot toggle job dates
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setSaved(false);
  }

  function dayType(d: Date): DayType {
    const key = format(d, "yyyy-MM-dd");
    if (jobDates.has(key)) return "job";
    if (selectedDates.has(key)) return "available";
    return "default";
  }

  async function saveAvailability() {
    setSaving(true);
    try {
      const sorted = Array.from(selectedDates).sort();
      const from = sorted[0] ?? null;
      const to   = sorted[sorted.length - 1] ?? null;

      const { error } = await supabase
        .from("painters")
        .update({ available_from: from, available_to: to })
        .eq("id", painter.id);

      if (error) throw new Error(error.message);
      setSaved(true);
      if (from && to) onSaved(from, to);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ fontFamily: "Arial, system-ui, sans-serif" }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold" style={{ color: "#1B3A5C" }}>
          Availability Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMonth((m) => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <span className="text-sm font-semibold w-32 text-center" style={{ color: "#1B3A5C" }}>
            {format(viewMonth, "MMMM yyyy")}
          </span>
          <button onClick={() => setViewMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-400" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-400" /> Active job</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-200" /> Unavailable</span>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
              {d}
            </div>
          ))}
        </div>
        {/* Date cells */}
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            if (!d) return <div key={`pad-${i}`} className="h-10 border-b border-r border-gray-50" />;
            const type = dayType(d);
            const inMonth = isSameMonth(d, viewMonth);
            const isToday = isSameDay(d, new Date());

            return (
              <button
                key={format(d, "yyyy-MM-dd")}
                onClick={() => inMonth && toggleDate(d)}
                disabled={!inMonth || type === "job"}
                className={`h-10 border-b border-r border-gray-50 flex items-center justify-center text-xs font-medium transition-colors select-none
                  ${!inMonth ? "opacity-0 pointer-events-none" : ""}
                  ${type === "job" ? "bg-blue-100 text-blue-700 cursor-default" : ""}
                  ${type === "available" ? "bg-green-400 text-white hover:bg-green-500" : ""}
                  ${type === "default" && inMonth ? "hover:bg-gray-50 text-gray-700" : ""}
                  ${isToday && type === "default" ? "font-bold underline" : ""}
                `}
              >
                {format(d, "d")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={saveAvailability}
          disabled={saving}
          className="text-sm text-white gap-2"
          style={{ backgroundColor: "#1B3A5C" }}
        >
          {saving ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
          ) : (
            <><Save className="h-3.5 w-3.5" /> Save Availability</>
          )}
        </Button>
        {saved && <span className="text-xs text-green-600">Saved ✓</span>}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Click dates to mark them available (green). Active job dates (blue) are automatically blocked.
        Your availability directly affects which jobs our matching engine sends to you.
      </p>
    </div>
  );
}
