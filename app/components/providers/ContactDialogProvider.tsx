"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import ContactComputer from "../sections/Contact/ContactComputer";

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

  return (
    <ContactDialogContext.Provider value={{ open, openDialog: () => setOpen(true), closeDialog: () => setOpen(false) }}>
      {children}
      <ContactComputer open={open} onClose={() => setOpen(false)} />
    </ContactDialogContext.Provider>
  );
}
