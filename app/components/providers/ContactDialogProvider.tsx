"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { whenIdle } from "../../lib/whenIdle";

// Not part of the startup JavaScript: fetched once the page is idle, and
// mounted the first time someone opens the contact form.
const loadContactComputer = () => import("../sections/Contact/ContactComputer");
const ContactComputer = dynamic(loadContactComputer, { ssr: false });

type ContactDialogValue = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const ContactDialogContext = createContext<ContactDialogValue | null>(null);

export function useContactDialog() {
  const ctx = useContext(ContactDialogContext);
  if (!ctx) throw new Error("useContactDialog must be used within ContactDialogProvider");
  return ctx;
}

// Render one shared dialog so every contact trigger uses the same instance.
export default function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);

  useEffect(() => whenIdle(() => void loadContactComputer()), []);

  function openDialog() {
    setUsed(true);
    setOpen(true);
  }

  return (
    <ContactDialogContext.Provider value={{ open, openDialog, closeDialog: () => setOpen(false) }}>
      {children}
      {used && <ContactComputer open={open} onClose={() => setOpen(false)} />}
    </ContactDialogContext.Provider>
  );
}
