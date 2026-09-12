"use client";

import { useState } from "react";

function toShortIndian(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year.slice(2)}`;
}

export function CalendarDateInput({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: string;
  label: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="mat-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="date"
        defaultValue={defaultValue}
        onChange={(e) => setValue(e.target.value)}
        className="mat-input px-2 py-1.5 text-sm"
      />
      <span className="h-4 text-xs font-medium text-brand-violet">
        {value ? toShortIndian(value) : ""}
      </span>
    </div>
  );
}
