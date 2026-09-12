"use client";

import { useState } from "react";

export function MaterialsMultiSelect({
  fieldName,
  existingItems,
  defaultSelected = [],
}: {
  /** Form field name; each selected material is submitted as a repeated value under this name. */
  fieldName: string;
  existingItems: { id: string; name: string }[];
  defaultSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [query, setQuery] = useState("");

  const suggestions = existingItems
    .map((item) => item.name)
    .filter(
      (name) =>
        !selected.includes(name) &&
        query.trim().length > 0 &&
        name.toLowerCase().includes(query.trim().toLowerCase())
    )
    .slice(0, 6);

  const exactMatch = existingItems.some(
    (item) => item.name.toLowerCase() === query.trim().toLowerCase()
  );

  function addMaterial(name: string) {
    const trimmed = name.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    setSelected((prev) => [...prev, trimmed]);
    setQuery("");
  }

  function removeMaterial(name: string) {
    setSelected((prev) => prev.filter((n) => n !== name));
  }

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((name) => (
            <span
              key={name}
              className="badge-info inline-flex items-center gap-1.5 py-1 pl-2.5 pr-1.5"
            >
              {name}
              <button
                type="button"
                onClick={() => removeMaterial(name)}
                aria-label={`Remove ${name}`}
                className="rounded-full px-1 text-brand-indigo/70 hover:bg-brand-indigo/10 hover:text-brand-indigo"
              >
                ×
              </button>
              <input type="hidden" name={fieldName} value={name} />
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addMaterial(query);
            }
          }}
          placeholder="Type a material name and press Enter…"
          className="mat-input"
        />
        {query.trim().length > 0 && (suggestions.length > 0 || !exactMatch) && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-steel-blue-200 bg-white shadow-[var(--shadow-elevation-2)]">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => addMaterial(name)}
                  className="block w-full px-3 py-2 text-left text-sm text-brand-navy hover:bg-steel-blue-50"
                >
                  {name}
                </button>
              </li>
            ))}
            {!exactMatch && (
              <li>
                <button
                  type="button"
                  onClick={() => addMaterial(query)}
                  className="block w-full px-3 py-2 text-left text-sm font-medium text-brand-indigo hover:bg-steel-blue-50"
                >
                  + Add &quot;{query.trim()}&quot; as a new item
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
