"use client";

import { useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseIsoDate(
  value: string | undefined
): { day: number | ""; month: number | ""; year: number | "" } {
  if (value) {
    const [y, m, d] = value.split("-").map(Number);
    if (y && m && d) return { day: d, month: m, year: y };
  }
  return { day: "", month: "", year: "" };
}

function toIso(day: number | "", month: number | "", year: number | ""): string {
  if (day === "" || month === "" || year === "") return "";
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function IndianDateInput({
  name,
  defaultValue,
  required,
  allowEmpty = false,
  yearsBack = 5,
  yearsForward = 1,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  /** When true, all three fields start blank and "no selection" is a valid state (composes to ""). Used for optional filters. */
  allowEmpty?: boolean;
  yearsBack?: number;
  yearsForward?: number;
}) {
  const initial = parseIsoDate(defaultValue);
  const fallbackToday = !allowEmpty && defaultValue === undefined;
  const now = new Date();

  const [day, setDay] = useState<number | "">(
    initial.day !== "" ? initial.day : fallbackToday ? now.getDate() : ""
  );
  const [month, setMonth] = useState<number | "">(
    initial.month !== "" ? initial.month : fallbackToday ? now.getMonth() + 1 : ""
  );
  const [year, setYear] = useState<number | "">(
    initial.year !== "" ? initial.year : fallbackToday ? now.getFullYear() : ""
  );

  const currentYear = now.getFullYear();
  const years = Array.from(
    { length: yearsBack + yearsForward + 1 },
    (_, i) => currentYear + yearsForward - i
  );
  const daysInMonth = month === "" ? 31 : new Date(year || currentYear, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function handleDayChange(raw: string) {
    setDay(raw === "" ? "" : Math.min(Number(raw), daysInMonth));
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        aria-label="Day"
        value={day === "" ? "" : Math.min(day, daysInMonth)}
        onChange={(e) => handleDayChange(e.target.value)}
        className="mat-input px-2"
      >
        {allowEmpty && <option value="">Day</option>}
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        aria-label="Month"
        value={month}
        onChange={(e) => setMonth(e.target.value === "" ? "" : Number(e.target.value))}
        className="mat-input px-2"
      >
        {allowEmpty && <option value="">Month</option>}
        {MONTHS.map((label, i) => (
          <option key={label} value={i + 1}>
            {label}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        value={year}
        onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
        className="mat-input px-2"
      >
        {allowEmpty && <option value="">Year</option>}
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <input
        type="hidden"
        name={name}
        value={toIso(day === "" ? "" : Math.min(day, daysInMonth), month, year)}
        required={required}
      />
    </div>
  );
}
