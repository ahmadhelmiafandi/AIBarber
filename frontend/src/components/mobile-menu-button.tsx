"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Fitur AI", href: "#features" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Portofolio", href: "#portfolio" },
  { label: "Statistik", href: "#stats" },
  { label: "Testimoni", href: "#testimonials" },
];

export default function MobileMenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        className="text-foreground p-1 cursor-pointer"
        aria-label={open ? "Tutup Menu" : "Buka Menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Menu Panel */}
          <div className="fixed left-0 right-0 top-16 z-50 border-b border-border bg-background/95 backdrop-blur-md shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-4 py-3 transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}

              <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors duration-200 text-center"
                >
                  Masuk
                </Link>
                <Link
                  href="/dashboard/booking"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm text-center"
                >
                  Pesan Sekarang
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
