"use client";

import { useLinkStatus } from "next/link";

export function NavLinkHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`ml-1 inline-block h-1.5 w-1.5 rounded-full bg-papaya-whip-400 transition-opacity duration-150 ${
        pending ? "animate-pulse opacity-100" : "opacity-0"
      }`}
    />
  );
}
