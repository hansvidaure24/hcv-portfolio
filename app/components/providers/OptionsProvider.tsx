"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import OptionsDialog from "../ui/OptionsDialog";

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
  const close = useCallback(() => setOpen(false), []);

  return (
    <OptionsContext.Provider value={{ openOptions: () => setOpen(true) }}>
      {children}
      <OptionsDialog open={open} onClose={close} />
    </OptionsContext.Provider>
  );
}
