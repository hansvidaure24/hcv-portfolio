"use client";
import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { whenIdle } from "../../lib/whenIdle";

// Not part of the startup JavaScript: fetched once the page is idle, and
// mounted the first time someone opens Options.
const loadOptionsDialog = () => import("../ui/OptionsDialog");
const OptionsDialog = dynamic(loadOptionsDialog, { ssr: false });

type OptionsValue = { openOptions: () => void };

const OptionsContext = createContext<OptionsValue | null>(null);

export function useOptions() {
  const ctx = useContext(OptionsContext);
  if (!ctx) throw new Error("useOptions must be used within OptionsProvider");
  return ctx;
}

/** One shared OPTIONS screen, opened from the top bar or the Pokéball menu. */
export default function OptionsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => whenIdle(() => void loadOptionsDialog()), []);

  function openOptions() {
    setUsed(true);
    setOpen(true);
  }

  return (
    <OptionsContext.Provider value={{ openOptions }}>
      {children}
      {used && <OptionsDialog open={open} onClose={close} />}
    </OptionsContext.Provider>
  );
}
